package com.modle.domain.jobposting.dto.request;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JobPostingTemplateGenerateRequest(
        @NotNull(message = "카테고리는 필수입니다.")
        Category category,

        @NotBlank(message = "제목은 필수입니다.")
        String title,

        @NotBlank(message = "촬영 예정일은 필수입니다.")
        String shootDate,

        @NotNull(message = "보수 유형은 필수입니다.")
        PayType payType,

        Integer ageMin,
        Integer ageMax,
        RequiredSex requiredSex
) {
}
