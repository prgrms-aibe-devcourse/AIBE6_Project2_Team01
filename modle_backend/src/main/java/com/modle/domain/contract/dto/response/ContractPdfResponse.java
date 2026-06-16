package com.modle.domain.contract.dto.response;

import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;

public record ContractPdfResponse(
        Long contractId,
        String pdfUrl,
        ContractStatus status
) {

    public static ContractPdfResponse from(Contract contract) {
        return new ContractPdfResponse(
                contract.getId(),
                contract.getPdfUrl(),
                contract.getStatus()
        );
    }
}
