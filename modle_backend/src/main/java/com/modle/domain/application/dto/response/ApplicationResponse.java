package com.modle.domain.application.dto.response;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;

import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        Long jobPostingId,
        Long modelId,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime createdDate
) {
    public static ApplicationResponse from(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getJobPostingId(),
                application.getModelId(),
                application.getCoverLetter(),
                application.getStatus(),
                application.getCreatedDate()
        );
    }
}
