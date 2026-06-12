package com.modle.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank
        @Size(min = 4, max = 30)
        String email,
        @NotBlank
        @Size(min = 4, max = 30)
        String password
) {
}
