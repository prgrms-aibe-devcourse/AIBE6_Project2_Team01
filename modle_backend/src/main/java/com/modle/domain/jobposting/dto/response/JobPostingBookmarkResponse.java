package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingBookmark;

import java.time.LocalDateTime;

public record JobPostingBookmarkResponse(
        Long jobPostingId,
        String title,
        String category,
        String region,
        LocalDateTime createdDate
) {
    public static JobPostingBookmarkResponse from(JobPostingBookmark bookmark, JobPosting jobPosting) {
        return new JobPostingBookmarkResponse(
                bookmark.getJobPostingId(),
                jobPosting.getTitle(),
                jobPosting.getCategory().name(),
                jobPosting.getRegion().name(),
                bookmark.getCreatedDate()
        );
    }
}
