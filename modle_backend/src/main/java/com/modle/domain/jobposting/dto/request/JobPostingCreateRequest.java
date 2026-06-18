package com.modle.domain.jobposting.dto.request;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.global.entity.type.Region;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobPostingCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        String title,

        @NotBlank(message = "내용은 필수입니다.")
        String content,

        @NotNull(message = "카테고리는 필수입니다.")
        Category category,

        @NotNull(message = "촬영 지역은 필수입니다.")
        Region region,

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
