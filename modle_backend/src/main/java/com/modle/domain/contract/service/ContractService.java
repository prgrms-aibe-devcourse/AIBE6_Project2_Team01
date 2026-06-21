package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.request.ContractPdfCreateRequest;
import com.modle.domain.contract.dto.response.*;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractListStatus;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.pdf.ContractPdfGenerator;
import com.modle.domain.contract.repository.ContractRepository;
import com.modle.domain.contract.repository.ContractTemplateRepository;
import com.modle.domain.contract.template.ContractTemplateContext;
import com.modle.domain.contract.template.ContractTemplateRenderer;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.MyJobPostingResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.service.MessageService;
import com.modle.domain.profile.service.ClientService;
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
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    private final ClientService clientService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Transactional
    public ContractResponse createContract(Long clientUserId, ContractCreateRequest request) {
        Application application = applicationService.getApplication(request.applicationId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());
        validateContractDraftableStatus(application);
        validateCreateRequest(request);

        return contractRepository.findByApplicationId(request.applicationId())
                .map(existingContract -> rewriteDraftableContract(existingContract, request))
                .orElseGet(() -> createNewContract(request));
    }

    @Transactional
    public ContractPdfResponse generatePdf(
            Long clientUserId,
            ContractPdfCreateRequest request,
            String clientIp
    ) {
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateDraftStatus(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());
        validateContractDraftableStatus(application);

        contract.clientAgree(LocalDateTime.now(), clientIp);

        if (contract.getContractType() == ContractType.FILE) {
            return handleFileContract(contract);
        }

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        User clientUser = userService.findById(jobPosting.clientId());
        User modelUser = userService.findById(model.getUser().getId());

        return handleTemplateContract(contract, jobPosting, clientUser, model, modelUser);
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
        validateContractNotifiableStatus(application);
        validateRequiredCount(application, jobPosting);

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        User clientUser = userService.findById(jobPosting.clientId());
        User modelUser = userService.findById(model.getUser().getId());

        MessageConversationResponse conversation = messageService.createApplicationConversation(
                clientUserId,
                modelUser.getId(),
                application.getJobPostingId(),
                application.getId()
        );

        String contractLink = createContractLink(contract, ContractStatus.NOTIFIED);

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
            confirmContract(contract, application);
        }

        return ContractResponse.from(contract);
    }

    @Transactional
    public ContractResponse rejectContract(Long modelUserId, Long contractId, String rejectReason) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        validateAgreeableStatus(contract);

        Application application = applicationService.getApplication(contract.getApplicationId());
        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        validateContractTargetModel(modelUserId, model.getUser().getId());

        contract.reject(rejectReason);
        application.revertToContacted(); // 거부 시 재계약 가능하도록 CONTACTED 상태로 롤백

        return ContractResponse.from(contract);
    }

    public ContractDraftResponse getDraftContract(Long clientUserId, Long applicationId) {
        Application application = applicationService.getApplication(applicationId);
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        validateContractOwner(clientUserId, jobPosting.clientId());

        Contract contract = contractRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_NOT_FOUND));

        if (contract.getStatus() != ContractStatus.DRAFT) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        return ContractDraftResponse.from(contract);
    }

    public List<ContractListItemResponse> getContracts(
            Long userId,
            String role,
            ContractListStatus status
    ) {
        return switch (role) {
            case "MODEL" -> getModelContracts(userId, status);
            case "CLIENT" -> getClientContracts(userId, status);
            default -> throw new CustomException(ErrorCode.ACCESS_DENIED);
        };
    }

    private List<ContractListItemResponse> getModelContracts(
            Long userId,
            ContractListStatus status
    ) {
        Long modelId = modelRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND))
                .getId();

        List<Application> applications = applicationRepository.findByModelIdOrderByCreatedDateDesc(modelId);

        if (applications.isEmpty()) {
            return List.of();
        }

        Map<Long, Contract> contractMap = getContractMap(applications);

        return applications.stream()
                .filter(application -> contractMap.containsKey(application.getId()))
                .filter(application -> matchesListStatus(
                        contractMap.get(application.getId()),
                        application,
                        status,
                        false
                ))
                .map(application -> {
                    Contract contract = contractMap.get(application.getId());
                    JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());
                    User clientUser = userService.findById(jobPosting.clientId());
                    var client = clientService.findByUserId(clientUser.getId());

                    return toContractListItemResponse(
                            contract,
                            application,
                            client.getCompanyName()
                    );
                })
                .toList();
    }

    private List<ContractListItemResponse> getClientContracts(
            Long userId,
            ContractListStatus status
    ) {
        List<Long> jobPostingIds = jobPostingService.getMyJobPostings(userId).stream()
                .map(MyJobPostingResponse::jobPostingId)
                .toList();

        if (jobPostingIds.isEmpty()) {
            return List.of();
        }

        List<Application> applications = applicationRepository.findByJobPostingIdInOrderByCreatedDateDesc(jobPostingIds);

        if (applications.isEmpty()) {
            return List.of();
        }

        Map<Long, Contract> contractMap = getContractMap(applications);

        List<Long> modelIds = applications.stream()
                .map(Application::getModelId)
                .distinct()
                .toList();

        Map<Long, Model> modelMap = modelRepository.findAllById(modelIds).stream()
                .collect(Collectors.toMap(Model::getId, Function.identity()));

        return applications.stream()
                .filter(application -> contractMap.containsKey(application.getId()))
                .filter(application -> modelMap.containsKey(application.getModelId()))
                .filter(application -> matchesListStatus(
                        contractMap.get(application.getId()),
                        application,
                        status,
                        true
                ))
                .map(application -> {
                    Contract contract = contractMap.get(application.getId());
                    Model model = modelMap.get(application.getModelId());

                    return toContractListItemResponse(
                            contract,
                            application,
                            model.getName()
                    );
                })
                .toList();
    }

    private Map<Long, Contract> getContractMap(List<Application> applications) {
        List<Long> applicationIds = applications.stream()
                .map(Application::getId)
                .toList();

        return contractRepository.findByApplicationIdInOrderByCreatedDateDesc(applicationIds).stream()
                .collect(Collectors.toMap(
                        Contract::getApplicationId,
                        Function.identity(),
                        (first, second) -> first
                ));
    }

    private boolean matchesListStatus(
            Contract contract,
            Application application,
            ContractListStatus status,
            boolean includeDraft
    ) {
        return switch (status) {
            case ONGOING -> isOngoing(contract, application, includeDraft);
            case DONE -> isDone(contract, application);
            case CANCELLED -> isCancelled(contract, application);
        };
    }

    private boolean isOngoing(
            Contract contract,
            Application application,
            boolean includeDraft
    ) {
        if (contract.getStatus() == ContractStatus.REJECTED
                || contract.getStatus() == ContractStatus.CANCELLED) {
            return false;
        }

        if (contract.getStatus() == ContractStatus.DRAFT) {
            return includeDraft;
        }

        return application.getStatus() == ApplicationStatus.CONTACTED
                || application.getStatus() == ApplicationStatus.CONTRACT_SENT
                || application.getStatus() == ApplicationStatus.SHOOTING
                || application.getStatus() == ApplicationStatus.ON_HOLD;
    }

    private boolean isDone(Contract contract, Application application) {
        return contract.getStatus() == ContractStatus.CONFIRMED
                && application.getStatus() == ApplicationStatus.COMPLETED;
    }

    private boolean isCancelled(Contract contract, Application application) {
        return contract.getStatus() == ContractStatus.REJECTED
                || contract.getStatus() == ContractStatus.CANCELLED
                || application.getStatus() == ApplicationStatus.SHOOTING_CANCELLED
                || application.getStatus() == ApplicationStatus.APPLICATION_CANCELLED;
    }

    private ContractListItemResponse toContractListItemResponse(
            Contract contract,
            Application application,
            String partnerName
    ) {
        return new ContractListItemResponse(
                contract.getId(),
                application.getId(),
                partnerName,
                contract.getContractType(),
                contract.getStatus(),
                contract.getShootStartAt(),
                contract.getShootEndAt(),
                contract.getLocation(),
                contract.getPayment(),
                contract.getPayType(),
                resolveDocumentUrl(contract),
                contract.getConfirmedAt(),
                contract.getCreatedDate()
        );
    }

    private String resolveDocumentUrl(Contract contract) {
        if (contract.getSignedPdfUrl() != null && !contract.getSignedPdfUrl().isBlank()) {
            return contract.getSignedPdfUrl();
        }
        return contract.getPdfUrl();
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

    private String createContractLink(Contract contract, ContractStatus status) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path("/contracts/{id}")
                .queryParam("applicationId", contract.getApplicationId())
                .queryParam("contractType", contract.getContractType())
                .queryParam("payType", contract.getPayType())
                .queryParam("payment", contract.getPayment())
                .queryParam("shootDate", contract.getShootStartAt().toLocalDate())
                .queryParam("shootStartTime", formatContractLinkTime(contract.getShootStartAt()))
                .queryParam("shootEndTime", formatContractLinkTime(contract.getShootEndAt()))
                .queryParam("location", contract.getLocation())
                .queryParam("usageScope", contract.getUsageScope())
                .queryParam("status", status.name());

        if (contract.getMemo() != null && !contract.getMemo().isBlank()) {
            builder.queryParam("memo", contract.getMemo());
        }

        return builder.buildAndExpand(contract.getId()).toUriString();
    }

    private String formatContractLinkTime(LocalDateTime dateTime) {
        return dateTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
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
        if (contract.getStatus() != ContractStatus.VIEWED
                && contract.getStatus() != ContractStatus.AGREED) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
    }

    private void validatePdfReady(Contract contract) {
        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_REQUIRED);
        }
    }

    private ContractResponse rewriteDraftableContract(
            Contract existingContract,
            ContractCreateRequest request
    ) {
        if (existingContract.getStatus() != ContractStatus.REJECTED
                && existingContract.getStatus() != ContractStatus.DRAFT) {
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

    private ContractPdfResponse handleTemplateContract(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser
    ) {
        String templateContent = loadContractTemplate();
        ContractTemplateContext context = buildTemplateContext(
                contract,
                jobPosting,
                clientUser,
                model,
                modelUser
        );
        String renderedContent = contractTemplateRenderer.render(templateContent, context);

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

    private void validateContractDraftableStatus(Application application) {
        if (application.getStatus() != ApplicationStatus.APPLIED && application.getStatus() != ApplicationStatus.CONTACTED) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }
    }

    private void validateContractNotifiableStatus(Application application) {
        if (application.getStatus() != ApplicationStatus.CONTACTED) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }
    }

    private void confirmContract(Contract contract, Application application) {
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        User clientUser = userService.findById(jobPosting.clientId());
        User modelUser = userService.findById(model.getUser().getId());

        String signedPdfUrl = createSignedPdf(contract, jobPosting, clientUser, model, modelUser);

        contract.confirm(signedPdfUrl, LocalDateTime.now());
        application.shoot();
        updateJobPostingAfterAgreement(application);

        sendContractConfirmedNotifications(contract, application);
    }


    private String createSignedPdf(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser
    ) {
        String templateContent = loadContractTemplate();
        ContractTemplateContext context = buildTemplateContext(
                contract,
                jobPosting,
                clientUser,
                model,
                modelUser
        );
        String renderedContent = contractTemplateRenderer.render(templateContent, context);

        byte[] pdfBytes = contractPdfGenerator.generate(renderedContent);

        String objectName = "contracts/" + contract.getId() + "/signed-" + UUID.randomUUID() + ".pdf";
        return gcsService.uploadPdf(pdfBytes, objectName);
    }

    private void sendContractConfirmedNotifications(Contract contract, Application application) {
        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        User modelUser = userService.findById(model.getUser().getId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());
        User clientUser = userService.findById(jobPosting.clientId());

        String contractLink = createContractLink(contract, contract.getStatus());

        MessageConversationResponse conversation = messageService.createApplicationConversation(
                clientUser.getId(),
                modelUser.getId(),
                application.getJobPostingId(),
                application.getId()
        );

        messageService.sendSystemMessage(
                conversation.id(),
                clientUser.getId(),
                null,
                createContractConfirmedMessage(contractLink)
        );

        mailService.sendContractConfirmedEmail(modelUser.getEmail(), contractLink);
    }

    private String createContractConfirmedMessage(String contractLink) {
        return """
                계약이 최종 확정되었습니다.
                아래 링크에서 계약 내용을 확인해 주세요.
                %s
                """.formatted(contractLink);
    }

    private ContractTemplateContext buildTemplateContext(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser
    ) {
        var client = clientService.findByUserId(clientUser.getId());

        String clientSignatureText = Boolean.TRUE.equals(contract.getClientAgreed())
                ? client.getCompanyName()
                : "";

        String clientSignedAt = contract.getClientAgreedAt() == null
                ? ""
                : contract.getClientAgreedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String modelSignatureText = Boolean.TRUE.equals(contract.getModelAgreed())
                ? model.getName()
                : "";

        String modelSignedAt = contract.getModelAgreedAt() == null
                ? ""
                : contract.getModelAgreedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        return new ContractTemplateContext(
                client.getCompanyName(),
                clientUser.getEmail(),
                model.getName(),
                modelUser.getEmail(),
                jobPosting.content(),
                jobPosting.category().name(),
                contract.getShootStartAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                contract.getShootEndAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                contract.getLocation(),
                formatContractPayment(contract),
                formatContractPayType(contract),
                contract.getUsageScope(),
                contract.getMemo(),
                clientSignatureText,
                clientSignedAt,
                modelSignatureText,
                modelSignedAt
        );
    }

    private String formatContractPayment(Contract contract) {
        if (contract.getPayType() == com.modle.domain.contract.entity.type.PayType.FREE) {
            return "0원";
        }

        return NumberFormat.getNumberInstance(Locale.KOREA).format(contract.getPayment()) + "원";
    }

    private String formatContractPayType(Contract contract) {
        return switch (contract.getPayType()) {
            case CASH -> "현금";
            case SERVICE -> "서비스";
            case FREE -> "무료";
        };
    }
}
