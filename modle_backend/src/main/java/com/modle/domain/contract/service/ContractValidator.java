package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractValidator {
    private final ApplicationRepository applicationRepository;

    void validateDraftStatus(Contract contract) {
        if (contract.getStatus() != ContractStatus.DRAFT) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
    }

    void validateAgreeableStatus(Contract contract) {
        if (contract.getStatus() != ContractStatus.VIEWED
                && contract.getStatus() != ContractStatus.AGREED) {
            throw new CustomException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
    }

    void validatePdfReady(Contract contract) {
        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_REQUIRED);
        }
    }

    void validateCreateRequest(ContractCreateRequest request) {
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

    void validateViewable(Contract contract) {
        if (contract.getStatus() == ContractStatus.DRAFT) {
            throw new CustomException(ErrorCode.CONTRACT_NOT_VIEWABLE);
        }

        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_REQUIRED);
        }
    }

    void validateContractOwner(Long clientUserId, Long ownerClientId) {
        if (!ownerClientId.equals(clientUserId)) {
            throw new CustomException(ErrorCode.CONTRACT_FORBIDDEN);
        }
    }

    void validateContractTargetModel(Long modelUserId, Long contractModelId) {
        if (!contractModelId.equals(modelUserId)) {
            throw new CustomException(ErrorCode.CONTRACT_FORBIDDEN);
        }
    }

    void validateContractDraftableStatus(Application application) {
        if (application.getStatus() != ApplicationStatus.APPLIED && application.getStatus() != ApplicationStatus.CONTACTED) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }
    }

    void validateContractNotifiableStatus(Application application) {
        if (application.getStatus() != ApplicationStatus.CONTACTED) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }
    }

    void validateRequiredCount(Application application, JobPostingResponse jobPosting) {
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
