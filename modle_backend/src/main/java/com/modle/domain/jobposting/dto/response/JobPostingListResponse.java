package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;

import java.time.LocalDateTime;

public record JobPostingListResponse(
        Long id,
        String title,
        String category,
        String region,
        JobPostingStatus status,
        LocalDateTime createDate
) {
    public static JobPostingListResponse from(JobPosting jobPosting) {
        return new JobPostingListResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getCreateDate()
        );
    }
}
