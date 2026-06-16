package com.modle.domain.user.dto.request;

import com.modle.domain.user.entity.type.ClientType;
import com.modle.domain.user.entity.type.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdditionalInfoRequest(
        @NotNull
        Role role,

        @NotBlank
        String region,

        // 모델 전용
        String name,
        Integer height,
        Integer weight,
        Integer age,
        com.modle.domain.user.entity.type.Sex sex,

        // 의뢰인 전용
        String companyName,
        String companyNumber,
        ClientType clientType
) {}
