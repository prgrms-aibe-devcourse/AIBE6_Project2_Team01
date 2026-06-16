package com.modle.domain.jobposting.dto.request;

import com.modle.domain.jobposting.entity.JobPostingStatus;
import jakarta.validation.constraints.NotNull;

public record JobPostingStatusUpdateRequest(
        @NotNull JobPostingStatus status
) {}
