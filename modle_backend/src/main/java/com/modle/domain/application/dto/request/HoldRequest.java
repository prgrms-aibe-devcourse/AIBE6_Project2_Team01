package com.modle.domain.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record HoldRequest(
        @NotBlank(message = "보류 사유는 필수입니다.")
        String holdReason
) {}
