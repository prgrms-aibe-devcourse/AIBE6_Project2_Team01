package com.modle.domain.profile.dto.request;

import com.modle.domain.user.entity.type.Sex;
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
        Sex sex,

        @NotNull
        int age,

        List<String> categories,
        List<String> tags,

        String introduction,
        String region,
        String profileImageUrl,
        List<String> activeRegions,

        String experience,
        String topSize,
        String bottomSize,
        Integer shoeSize,
        String availableDays
) {}
