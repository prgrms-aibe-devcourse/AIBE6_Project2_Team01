package com.modle.domain.contract.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ContractPdfCreateRequest(
        @NotNull(message = "계약 ID는 필수입니다.")
        @Positive(message = "계약 ID는 양수여야 합니다.")
        Long contractId
) {
}
