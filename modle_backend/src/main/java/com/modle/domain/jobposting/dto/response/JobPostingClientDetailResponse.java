package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;

import java.time.LocalDateTime;
import java.util.List;

// JOB-007: 의뢰인 뷰 — 공고 정보 + AI 추천 모델 섹션 (수락 버튼 없음)
public record JobPostingClientDetailResponse(
        Long id,
        Long clientId,
        String title,
        String content,
        String category,
        String region,
        JobPostingStatus status,
        LocalDateTime createDate,
        // TODO(AI추천): AI 추천 단위 구현 후 실제 추천 모델 목록으로 교체
        List<Long> recommendedModelIds
) {
    public static JobPostingClientDetailResponse from(JobPosting jobPosting) {
        return new JobPostingClientDetailResponse(
                jobPosting.getId(),
                jobPosting.getClientId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getCreateDate(),
                List.of()
        );
    }
}
