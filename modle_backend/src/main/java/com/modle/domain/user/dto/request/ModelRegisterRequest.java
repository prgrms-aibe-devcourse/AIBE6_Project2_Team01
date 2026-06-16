package com.modle.domain.user.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ModelRegisterRequest (
        @NotBlank
        @Size(min = 5, max = 100)
        String email,

        @NotBlank
        @Size(min = 5, max = 50)
        String password,

        @NotBlank
        @Size(min = 1, max = 50)
        String region,

        @NotBlank
        @Size(min = 1, max = 50)
        String name,

        @Min(1)
        int height,

        @Min(1)
        int weight,

        @NotNull
        int age,

        @NotNull
        com.modle.domain.user.entity.type.Sex sex
) {
}
