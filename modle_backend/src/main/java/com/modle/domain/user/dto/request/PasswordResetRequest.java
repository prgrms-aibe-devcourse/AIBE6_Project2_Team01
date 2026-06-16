package com.modle.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(
        @NotBlank
        @Email
        String email,

        @NotBlank
        String resetToken,

        @NotBlank
        String newPassword
) {}
