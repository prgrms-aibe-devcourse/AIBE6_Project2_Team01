package com.modle.domain.contract.dto.response;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;

public record ContractStatusResponse(
        Long contractId,
        Long applicationId,
        ContractStatus status,
        Boolean clientAgreed,
        Boolean modelAgreed,
        boolean shootingAvailable
) {

    public static ContractStatusResponse from(Contract contract, Application application) {
        boolean shootingAvailable = contract.getStatus() == ContractStatus.CONFIRMED
                && application.getStatus() == ApplicationStatus.SHOOTING;

        return new ContractStatusResponse(
                contract.getId(),
                contract.getApplicationId(),
                contract.getStatus(),
                contract.getClientAgreed(),
                contract.getModelAgreed(),
                shootingAvailable
        );
    }
}
