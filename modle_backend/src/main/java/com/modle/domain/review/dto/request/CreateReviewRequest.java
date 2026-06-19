package com.modle.domain.review.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateReviewRequest(
        @NotNull
        Long applicationId,

        @NotNull
        @Min(1) @Max(5)
        int rating,

        String content
) {}
