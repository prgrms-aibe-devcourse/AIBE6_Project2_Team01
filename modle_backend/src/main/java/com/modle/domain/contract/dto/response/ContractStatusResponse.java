package com.modle.domain.contract.dto.response;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;

public record ContractStatusResponse(
        Long contractId,
        Long applicationId,
        boolean contractSent,
        ContractStatus status,
        Boolean clientAgreed,
        Boolean modelAgreed,
        String pdfUrl,
        String rejectReason,
        boolean shootingAvailable
) {

    public static ContractStatusResponse from(Contract contract, Application application) {
        boolean contractSent = contract.getStatus() != ContractStatus.DRAFT;
        boolean shootingAvailable = contract.getStatus() == ContractStatus.CONFIRMED
                && application.getStatus() == ApplicationStatus.SHOOTING;

        return new ContractStatusResponse(
                contract.getId(),
                contract.getApplicationId(),
                contractSent,
                contract.getStatus(),
                contract.getClientAgreed(),
                contract.getModelAgreed(),
                contract.getPdfUrl(),
                contract.getRejectReason(),
                shootingAvailable
        );
    }
}
