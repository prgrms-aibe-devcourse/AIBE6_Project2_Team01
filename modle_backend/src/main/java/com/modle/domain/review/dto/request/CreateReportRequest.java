package com.modle.domain.review.dto.request;

import com.modle.domain.review.entity.type.ReportReason;
import com.modle.domain.review.entity.type.ReportTargetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReportRequest(
        @NotNull
        ReportTargetType targetType,

        @NotNull
        Long targetId,

        @NotNull
        ReportReason reason,

        @Size(max = 500)
        String description
) {
}
