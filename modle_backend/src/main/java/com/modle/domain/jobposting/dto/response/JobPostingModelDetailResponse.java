package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;

import java.time.LocalDateTime;

// JOB-006: 모델 뷰 — 공고 정보 + 즐겨찾기 여부 (지원하기·즐겨찾기 버튼은 프론트에서 노출)
public record JobPostingModelDetailResponse(
        Long id,
        String title,
        String content,
        String category,
        String region,
        JobPostingStatus status,
        LocalDateTime createDate,
        // TODO(즐겨찾기): 즐겨찾기 단위 구현 후 실제 값으로 교체
        boolean favorited
) {
    public static JobPostingModelDetailResponse from(JobPosting jobPosting) {
        return new JobPostingModelDetailResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getCreateDate(),
                false
        );
    }
}
