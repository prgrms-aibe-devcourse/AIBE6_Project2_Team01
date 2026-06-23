package com.modle.domain.application.dto.response;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.jobposting.entity.JobPosting;

import java.time.LocalDateTime;

public record MyApplicationResponse(
        Long applicationId,
        Long jobPostingId,
        String jobPostingTitle,
        String category,
        String region,
        ApplicationStatus status,
        boolean shooting,
        LocalDateTime appliedDate
) {
    public static MyApplicationResponse from(Application application, JobPosting jobPosting) {
        return new MyApplicationResponse(
                application.getId(),
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getCategory() == null ? null : jobPosting.getCategory().name(),
                jobPosting.getRegion().name(),
                application.getStatus(),
                application.getStatus() == ApplicationStatus.SHOOTING
                        || application.getStatus() == ApplicationStatus.COMPLETED,
                application.getCreatedDate()
        );
    }
}
