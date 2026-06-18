package com.modle.domain.contract.dto.response;

import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;

import java.time.LocalDateTime;

public record ContractViewResponse(
        Long id,
        Long applicationId,
        ContractStatus status,
        String pdfUrl,
        LocalDateTime viewedAt
) {
    public static ContractViewResponse from(Contract contract) {
        return new ContractViewResponse(
                contract.getId(),
                contract.getApplicationId(),
                contract.getStatus(),
                contract.getPdfUrl(),
                contract.getViewedAt()
        );
    }
}