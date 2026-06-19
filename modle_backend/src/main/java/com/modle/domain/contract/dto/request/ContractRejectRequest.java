package com.modle.domain.contract.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContractRejectRequest(
        @NotBlank(message = "거절 사유는 필수입니다.")
        @Size(max = 500, message = "거절 사유는 최대 500자까지 입력 가능합니다.")
        String rejectReason
) {
}
