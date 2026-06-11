package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;

import java.time.LocalDateTime;

// JOB-008: 기업 사용자 뷰 — 공고 정보만 노출 (AI 추천·지원·쪽지 버튼 없음)
public record JobPostingOtherDetailResponse(
        Long id,
        String title,
        String content,
        String category,
        String region,
        JobPostingStatus status,
        LocalDateTime createDate
) {
    public static JobPostingOtherDetailResponse from(JobPosting jobPosting) {
        return new JobPostingOtherDetailResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getCreateDate()
        );
    }
}
