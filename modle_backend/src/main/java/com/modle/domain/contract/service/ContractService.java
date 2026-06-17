package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.request.ContractPdfCreateRequest;
import com.modle.domain.contract.dto.response.ContractPdfResponse;
import com.modle.domain.contract.dto.response.ContractResponse;
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
import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.service.MessageService;
import com.modle.domain.user.entity.User;
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

    private final GcsService gcsService;
    private final ContractPdfGenerator contractPdfGenerator;
    private final ContractTemplateRenderer contractTemplateRenderer;

    private final ApplicationService applicationService;
    private final JobPostingService jobPostingService;
    private final MessageService messageService;
    private final UserService userService;
    private final MailService mailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Transactional
    public ContractResponse createContract(Long clientUserId, ContractCreateRequest request) {
        validateDuplicateContract(request.applicationId());

        Application application = applicationService.getApplication(request.applicationId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());
        validateContractApplicableStatus(application);
        validateCreateRequest(request);

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
            Contract savedContract = contractRepository.save(contract);
            return ContractResponse.from(savedContract);
        } catch (DataIntegrityViolationException e) {
            // applicationId의 unique 제약 조건 위반 시 예외 처리
            throw new CustomException(ErrorCode.CONTRACT_ALREADY_EXISTS);
        }
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

        User model = userService.findById(application.getModelId());

        MessageConversationResponse conversation = messageService.createConversation(
                clientUserId,
                new CreateConversationRequest(
                        model.getId(),
                        application.getJobPostingId(),
                        application.getId()
                )
        );

        String contractLink = createContractLink(contract.getId());

        messageService.sendSystemMessage(
                conversation.id(),
                clientUserId,
                null,
                createContractNotificationMessage(contractLink)
        );

        mailService.sendContractNotificationEmail(
                model.getEmail(),
                contractLink
        );

        contract.notifyModel(LocalDateTime.now());
        applicationService.markContractSent(contract.getApplicationId());

        return ContractResponse.from(contract);
    }

    @Transactional
    public ContractViewResponse viewContract(Long modelUserId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateViewable(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());
        validateContractTargetModel(modelUserId, application.getModelId());

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

    private void validatePdfReady(Contract contract) {
        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_REQUIRED);
        }
    }

    private void validateDuplicateContract(Long applicationId) {
        if (contractRepository.existsByApplicationId(applicationId)) {
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
}
