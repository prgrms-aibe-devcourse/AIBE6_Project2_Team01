package com.modle.domain.contract.service;

import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.request.ContractPdfCreateRequest;
import com.modle.domain.contract.dto.response.ContractPdfResponse;
import com.modle.domain.contract.dto.response.ContractResponse;
import com.modle.domain.contract.dto.response.ContractTemplateResponse;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.ContractTemplate;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.pdf.ContractPdfGenerator;
import com.modle.domain.contract.repository.ContractRepository;
import com.modle.domain.contract.repository.ContractTemplateRepository;
import com.modle.domain.contract.template.ContractTemplateRenderer;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.gcs.GcsService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    // TODO: Application 도메인 연동 후
    // applicationId 존재 검증 및 현재 로그인한 CLIENT의 공고인지 소유권 검증 추가
    @Transactional
    public ContractResponse createContract(Long clientUserId, ContractCreateRequest request) {
        validateDuplicateContract(request.applicationId());
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

        // TODO: Application 도메인 연동 후
        // applicationId -> 공고 작성자 -> clientUserId 검증 연결 필요

        if (contract.getContractType() == ContractType.FILE) {
            return handleFileContract(contract);
        }
        return handleTemplateContract(contract);
    }

    private void validateDraftStatus(Contract contract) {
        if (contract.getStatus() != ContractStatus.DRAFT) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

    }

    private void validateDuplicateContract(Long applicationId) {
        if (contractRepository.existsByApplicationId(applicationId)) {
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

    private ContractPdfResponse handleTemplateContract(Contract contract) {
        ContractTemplate template = contractTemplateRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new CustomException(ErrorCode.CONTRACT_TEMPLATE_NOT_FOUND));

        String templateContent = template.getContent();
        String renderedContent = contractTemplateRenderer.render(templateContent, contract);

        byte[] pdfBytes = contractPdfGenerator.generate(renderedContent);

        String objectName = "contracts/" + contract.getId() + "/" + UUID.randomUUID() + ".pdf";
        String pdfUrl = gcsService.uploadPdf(pdfBytes, objectName);

        contract.updatePdfUrl(pdfUrl);
        return ContractPdfResponse.from(contract);
    }

}
