package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;

import java.time.LocalDateTime;

public record JobPostingResponse(
        Long id,
        Long clientId,
        String title,
        String content,
        String category,
        JobPostingStatus status,
        LocalDateTime createDate
) {
    public static JobPostingResponse from(JobPosting jobPosting) {
        return new JobPostingResponse(
                jobPosting.getId(),
                jobPosting.getClientId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getStatus(),
                jobPosting.getCreateDate()
        );
    }
}
