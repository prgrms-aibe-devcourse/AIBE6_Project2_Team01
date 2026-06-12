package com.modle.domain.jobposting.dto.request;

import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.PayType;
import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.jobposting.entity.RequiredSex;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobPostingUpdateRequest(
        @NotBlank String title,
        @NotBlank String content,

        @NotNull Category category,
        @NotNull Region region,

        RequiredSex requiredSex,

        @Min(15) @Max(80)
        Integer ageMin,

        @Min(15) @Max(80)
        Integer ageMax,

        @Min(100) @Max(220)
        Integer heightMin,

        @Min(100) @Max(220)
        Integer heightMax,

        @Min(30) @Max(150)
        Integer weightMin,

        @Min(30) @Max(150)
        Integer weightMax,

        @Min(0) @Max(600)
        Integer minCareerMonths,

        BigDecimal payment,

        PayType payType,

        LocalDateTime shootDate
) {
}
