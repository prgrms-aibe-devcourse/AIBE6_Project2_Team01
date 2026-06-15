package com.modle.domain.profile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ModelModifyReqBody (
        @NotBlank
        @Size(min = 2, max = 20)
        String name,

        @NotNull
        int height,

        @NotNull
        int weight,

        @NotNull
        boolean gender,

        @NotNull
        int age,

        List<String> categories,
        List<String> tags,

        String introduction,
        String region,
        String profileImageUrl

) {}
