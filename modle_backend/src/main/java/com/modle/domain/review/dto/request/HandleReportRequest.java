package com.modle.domain.review.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HandleReportRequest(
        @NotNull
        Boolean accepted,       // ← boolean → Boolean

        @Size(max = 500)
        String dismissReason
) {}
