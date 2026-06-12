package com.modle.domain.contract.dto.response;

import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.ContractStatus;
import com.modle.domain.contract.entity.ContractType;
import com.modle.domain.contract.entity.PayType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContractResponse(
        Long id,
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
        String signedPdfUrl,
        ContractStatus status
) {
    public static ContractResponse from(Contract contract) {
        return new ContractResponse(
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
                contract.getSignedPdfUrl(),
                contract.getStatus()
        );
    }

}
