package com.modle.domain.jobposting.dto.request;

import jakarta.validation.constraints.NotBlank;

public record JobPostingCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        String title,

        @NotBlank(message = "내용은 필수입니다.")
        String content,

        @NotBlank(message = "카테고리는 필수입니다.")
        String category,

        @NotBlank(message = "촬영 지역은 필수입니다.")
        String region
) {
}
