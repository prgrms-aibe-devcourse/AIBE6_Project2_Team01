package com.modle.domain.contract.dto.response;

import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.entity.type.PayType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContractDraftResponse(
        Long contractId,
        Long applicationId,
        ContractType contractType,
        LocalDateTime shootStartAt,
        LocalDateTime shootEndAt,
        String location,
        BigDecimal payment,
        PayType payType,
        String usageScope,
        String memo,
        String pdfUrl,
        ContractStatus status
) {
    public static ContractDraftResponse from(Contract contract) {
        return new ContractDraftResponse(
                contract.getId(),
                contract.getApplicationId(),
                contract.getContractType(),
                contract.getShootStartAt(),
                contract.getShootEndAt(),
                contract.getLocation(),
                contract.getPayment(),
                contract.getPayType(),
                contract.getUsageScope(),
                contract.getMemo(),
                contract.getPdfUrl(),
                contract.getStatus()
        );
    }
}
