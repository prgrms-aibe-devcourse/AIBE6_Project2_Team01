package com.modle.domain.profile.dto.request;

import com.modle.domain.user.entity.type.ClientType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClientModifyReqBody(
        @NotBlank
        @Size(min = 2, max = 100)
        String companyName,

        @NotBlank
        @Size(max = 20)
        String companyNumber,

        ClientType clientType,

        String introduction,
        
        String profileImageUrl
) {}
