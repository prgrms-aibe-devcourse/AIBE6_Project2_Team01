package com.modle.domain.contract.dto.response;

import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.entity.type.PayType;

import java.math.BigDecimal;
import java.time.LocalDateTime;


public record ContractListItemResponse(
        Long contractId,
        Long applicationId,
        String partnerName,
        ContractType contractType,
        ContractStatus contractStatus,
        LocalDateTime shootStartAt,
        LocalDateTime shootEndAt,
        String location,
        BigDecimal payment,
        PayType payType,
        String documentUrl,
        LocalDateTime confirmedAt,
        LocalDateTime createdDate
) {
}
