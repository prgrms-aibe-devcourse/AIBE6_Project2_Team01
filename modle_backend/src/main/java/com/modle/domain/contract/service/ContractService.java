package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.request.ContractPdfCreateRequest;
import com.modle.domain.contract.dto.response.ContractPdfResponse;
import com.modle.domain.contract.dto.response.ContractResponse;
import com.modle.domain.contract.dto.response.ContractStatusResponse;
import com.modle.domain.contract.dto.response.ContractTemplateResponse;
import com.modle.domain.contract.dto.response.ContractViewResponse;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.pdf.ContractPdfGenerator;
import com.modle.domain.contract.repository.ContractRepository;
import com.modle.domain.contract.repository.ContractTemplateRepository;
import com.modle.domain.contract.template.ContractTemplateRenderer;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.service.MessageService;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.service.UserService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.gcs.GcsService;
import com.modle.infra.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractTemplateRepository contractTemplateRepository;
    private final ApplicationRepository applicationRepository;

    private final GcsService gcsService;
    private final ContractPdfGenerator contractPdfGenerator;
    private final ContractTemplateRenderer contractTemplateRenderer;

    private final ApplicationService applicationService;
    private final JobPostingService jobPostingService;
    private final MessageService messageService;
    private final UserService userService;
    private final ModelRepository modelRepository;
    private final MailService mailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Transactional
    public ContractResponse createContract(Long clientUserId, ContractCreateRequest request) {
        Application application = applicationService.getApplication(request.applicationId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());
        validateContractApplicableStatus(application);
        validateCreateRequest(request);

        return contractRepository.findByApplicationId(request.applicationId())
                .map(existingContract -> rewriteRejectedContract(existingContract, request))
                .orElseGet(() -> createNewContract(request));
    }

    @Transactional
    public ContractPdfResponse generatePdf(Long clientUserId, ContractPdfCreateRequest request) {
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateDraftStatus(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());
        validateContractApplicableStatus(application);

        // 의뢰인 동의 처리
        contract.clientAgree(LocalDateTime.now(), null);

        if (contract.getContractType() == ContractType.FILE) {
            return handleFileContract(contract);
        }
        return handleTemplateContract(contract);
    }

    @Transactional
    public ContractResponse notifyContract(Long clientUserId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateDraftStatus(contract);
        validatePdfReady(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());
        validateContractApplicableStatus(application);
        validateRequiredCount(application, jobPosting);
        validateClientAgreed(contract);

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        User modelUser = userService.findById(model.getUser().getId());

        MessageConversationResponse conversation = messageService.createApplicationConversation(
                clientUserId,
                modelUser.getId(),
                application.getJobPostingId(),
                application.getId()
        );

        String contractLink = createContractLink(contract.getId());

        messageService.sendSystemMessage(
                conversation.id(),
                clientUserId,
                null,
                createContractNotificationMessage(contractLink)
        );

        mailService.sendContractNotificationEmail(
                modelUser.getEmail(),
                contractLink
        );

        contract.notifyModel(LocalDateTime.now());
        applicationService.markContractSent(contract.getApplicationId());

        return ContractResponse.from(contract);
    }

    @Transactional
    public ContractResponse agreeContract(Long modelUserId, Long contractId, String modelIp) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateAgreeableStatus(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        validateContractTargetModel(modelUserId, model.getUser().getId());

        contract.modelAgree(LocalDateTime.now(), modelIp);

        if (contract.isBothAgreed()) {
            contract.confirm(LocalDateTime.now());
            application.shoot();
            updateJobPostingAfterAgreement(application);
        }

        return ContractResponse.from(contract);
    }

    @Transactional
    public ContractResponse rejectContract(Long modelUserId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateAgreeableStatus(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());
        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        validateContractTargetModel(modelUserId, model.getUser().getId());

        contract.reject();
        application.revertToContacted(); // 거부 시 재계약 가능하도록 CONTACTED 상태로 롤백

        return ContractResponse.from(contract);
    }

    public ContractStatusResponse getContractByApplicationId(Long userId, Long applicationId) {
        Application application = applicationService.getApplication(applicationId);
        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        boolean isModel = model.getUser().getId().equals(userId);
        boolean isClient = jobPosting.clientId().equals(userId);

        if (!isModel && !isClient) {
            throw new CustomException(ErrorCode.CONTRACT_ACCESS_DENIED);
        }

        Contract contract = contractRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        return ContractStatusResponse.from(contract, application);
    }

    @Transactional
    public ContractViewResponse viewContract(Long modelUserId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateViewable(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        validateContractTargetModel(modelUserId, model.getUser().getId());

        contract.markViewedAt(LocalDateTime.now());

        return ContractViewResponse.from(contract);
    }

    private String createContractLink(Long contractId) {
        return frontendBaseUrl + "/contracts/" + contractId;
    }

    private String createContractNotificationMessage(String contractLink) {
        return """
                계약서가 도착했습니다. 아래 링크에서 확인해 주세요.
                %s
                """.formatted(contractLink);
    }

    private void validateDraftStatus(Contract contract) {
        if (contract.getStatus() != ContractStatus.DRAFT) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
    }

    private void validateAgreeableStatus(Contract contract) {
        if (contract.getStatus() != ContractStatus.NOTIFIED
                && contract.getStatus() != ContractStatus.VIEWED
                && contract.getStatus() != ContractStatus.AGREED) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
    }

    private void validatePdfReady(Contract contract) {
        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_REQUIRED);
        }
    }

    private void validateClientAgreed(Contract contract) {
        if (!Boolean.TRUE.equals(contract.getClientAgreed())) {
            throw new CustomException(ErrorCode.CONTRACT_CLIENT_AGREEMENT_REQUIRED);
        }
    }

    private ContractResponse rewriteRejectedContract(
            Contract existingContract,
            ContractCreateRequest request
    ) {
        if (existingContract.getStatus() != ContractStatus.REJECTED) {
            throw new CustomException(ErrorCode.CONTRACT_ALREADY_EXISTS);
        }

        existingContract.rewriteDraft(
                request.contractType(),
                request.shootStartAt(),
                request.shootEndAt(),
                request.location(),
                request.payment(),
                request.payType(),
                request.usageScope(),
                request.memo(),
                request.pdfUrl()
        );

        return ContractResponse.from(existingContract);
    }

    private ContractResponse createNewContract(ContractCreateRequest request) {
        Contract contract = Contract.createDraft(
                request.applicationId(),
                request.contractType(),
                request.shootStartAt(),
                request.shootEndAt(),
                request.location(),
                request.payment(),
                request.payType(),
                request.usageScope(),
                request.memo(),
                request.pdfUrl()
        );

        try {
            return ContractResponse.from(contractRepository.save(contract));
        } catch (DataIntegrityViolationException e) {
            throw new CustomException(ErrorCode.CONTRACT_ALREADY_EXISTS);
        }
    }

    private void validateContractApplicableStatus(Application application) {
        if (application.getStatus() != ApplicationStatus.APPLIED
                && application.getStatus() != ApplicationStatus.CONTACTED) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }
    }

    private void validateCreateRequest(ContractCreateRequest request) {
        validateShootTime(request);
        validateContractType(request);
        validatePayType(request);
    }

    private void validatePayType(ContractCreateRequest request) {
        if (request.payType() == null) {
            return;
        }

        if (request.payment() == null) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_PAYMENT);
        }

        switch (request.payType()) {
            case CASH -> validateCashPayment(request);
            case SERVICE -> validateServicePayment(request);
            case FREE -> validateFreePayment(request);
        }
    }

    private void validateCashPayment(ContractCreateRequest request) {
        if (request.payment().compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_PAYMENT);
        }
    }

    private void validateServicePayment(ContractCreateRequest request) {
        if (request.payment().compareTo(BigDecimal.ZERO) < 0) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_PAYMENT);
        }
    }

    private void validateFreePayment(ContractCreateRequest request) {
        if (request.payment().compareTo(BigDecimal.ZERO) != 0) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_PAYMENT);
        }
    }

    private void validateShootTime(ContractCreateRequest request) {
        if (!request.shootEndAt().isAfter(request.shootStartAt())) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_SHOOT_TIME);
        }
    }

    private void validateContractType(ContractCreateRequest request) {
        if (request.contractType() == ContractType.FILE) {
            validateFileContract(request);
        }
    }

    private void validateFileContract(ContractCreateRequest request) {
        if (request.pdfUrl() == null || request.pdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.INVALID_FILE_CONTRACT);
        }
    }

    public List<ContractTemplateResponse> getTemplates() {
        return contractTemplateRepository.findAll().stream()
                .map(ContractTemplateResponse::from)
                .toList();
    }

    private ContractPdfResponse handleFileContract(Contract contract) {
        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.INVALID_FILE_CONTRACT);
        }

        return ContractPdfResponse.from(contract);
    }

    private ContractPdfResponse handleTemplateContract(Contract contract) {
        String templateContent = loadContractTemplate();
        String renderedContent = contractTemplateRenderer.render(templateContent, contract);

        byte[] pdfBytes = contractPdfGenerator.generate(renderedContent);

        String objectName = "contracts/" + contract.getId() + "/" + UUID.randomUUID() + ".pdf";
        String pdfUrl = gcsService.uploadPdf(pdfBytes, objectName);

        contract.updatePdfUrl(pdfUrl);
        return ContractPdfResponse.from(contract);
    }

    private String loadContractTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/contract-template.html");
            return resource.getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.CONTRACT_TEMPLATE_LOAD_FAILED);
        }
    }

    private void validateViewable(Contract contract) {
        if (contract.getStatus() == ContractStatus.DRAFT) {
            throw new CustomException(ErrorCode.CONTRACT_NOT_VIEWABLE);
        }

        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_REQUIRED);
        }
    }

    private void validateContractOwner(Long clientUserId, Long ownerClientId) {
        if (!ownerClientId.equals(clientUserId)) {
            throw new CustomException(ErrorCode.CONTRACT_FORBIDDEN);
        }
    }

    private void validateContractTargetModel(Long modelUserId, Long contractModelId) {
        if (!contractModelId.equals(modelUserId)) {
            throw new CustomException(ErrorCode.CONTRACT_FORBIDDEN);
        }
    }

    private void updateJobPostingAfterAgreement(Application application) {
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        if (jobPosting.requiredCount() == null) {
            jobPostingService.markShooting(application.getJobPostingId());
            return;
        }

        long confirmedCount = applicationRepository.countByJobPostingIdAndStatusIn(
                application.getJobPostingId(),
                List.of(
                        ApplicationStatus.SHOOTING,
                        ApplicationStatus.COMPLETED
                )
        );

        if (confirmedCount >= jobPosting.requiredCount()) {
            jobPostingService.markShooting(application.getJobPostingId());
        }
    }

    private void validateRequiredCount(Application application, JobPostingResponse jobPosting) {
        long contracted = applicationRepository.countByJobPostingIdAndStatusIn(
                application.getJobPostingId(),
                List.of(
                        ApplicationStatus.CONTRACT_SENT,
                        ApplicationStatus.SHOOTING,
                        ApplicationStatus.COMPLETED
                )
        );
        if (jobPosting.requiredCount() != null && contracted >= jobPosting.requiredCount()) {
            throw new CustomException(ErrorCode.APPLICATION_EXCEED_REQUIRED_COUNT);
        }
    }
}
