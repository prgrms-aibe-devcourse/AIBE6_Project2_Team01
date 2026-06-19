package com.modle.domain.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CancelShootingRequest(
        @NotBlank(message = "취소 사유는 필수입니다.")
        String cancelReason
) {}
