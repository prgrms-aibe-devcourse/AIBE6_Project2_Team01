package com.modle.domain.profile.dto.response;

import com.modle.domain.profile.entity.Career;

import java.time.LocalDateTime;

public record CareerResponse(
        Long id,
        Long jobPostingId,
        String title,
        String category,
        String region,
        LocalDateTime shootDate,
        LocalDateTime completedDate,
        boolean isPublic
) {
    public static CareerResponse from(Career career) {
        return new CareerResponse(
                career.getId(),
                career.getJobPostingId(),
                career.getTitle(),
                career.getCategory(),
                career.getRegion(),
                career.getShootDate(),
                career.getCompletedDate(),
                career.isPublic()
        );
    }
}
