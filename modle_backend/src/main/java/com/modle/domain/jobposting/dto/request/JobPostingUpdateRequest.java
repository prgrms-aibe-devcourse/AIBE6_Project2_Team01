package com.modle.domain.jobposting.dto.request;

import jakarta.validation.constraints.NotBlank;

public record JobPostingUpdateRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String category,
        @NotBlank String region
) {}
