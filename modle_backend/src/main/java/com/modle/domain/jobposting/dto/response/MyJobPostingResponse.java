package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;

import java.time.LocalDateTime;

public record MyJobPostingResponse(
        Long jobPostingId,
        String title,
        String category,
        String region,
        String status,
        long applicantCount,    // 전체 지원자 수
        long contactedCount,    // 선택 인원 (CONTACTED 이상)
        long completedCount,    // 완료 인원
        LocalDateTime createdDate
) {
    public static MyJobPostingResponse of(
            JobPosting jobPosting,
            long applicantCount,
            long contactedCount,
            long completedCount
    ) {
        return new MyJobPostingResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getCategory().name(),
                jobPosting.getRegion().name(),
                jobPosting.getStatus().name(),
                applicantCount,
                contactedCount,
                completedCount,
                jobPosting.getCreatedDate()
        );
    }
}
