package com.modle.domain.user.dto.request;

import com.modle.domain.user.entity.type.ClientType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClientRegisterRequest(
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
        @Size(min = 1, max = 100)
        String companyName,

        @NotBlank
        @Size(min = 1, max = 20)
        String companyNumber,

        @NotNull
        ClientType clientType
) {
}
