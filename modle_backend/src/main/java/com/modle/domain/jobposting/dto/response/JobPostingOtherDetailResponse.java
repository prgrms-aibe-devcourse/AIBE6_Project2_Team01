package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.domain.jobposting.entity.type.Region;
import com.modle.domain.jobposting.entity.type.RequiredSex;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// JOB-008: 기타 사용자 뷰 — 공고 기본 정보만 노출 (AI 추천·지원·쪽지 버튼 없음)
public record JobPostingOtherDetailResponse(
        Long id,
        String title,
        String content,
        Category category,
        Region region,
        JobPostingStatus status,
        RequiredSex requiredSex,
        BigDecimal payment,
        PayType payType,
        LocalDateTime shootDate,
        LocalDateTime createdDate
) {
    public static JobPostingOtherDetailResponse from(JobPosting jobPosting) {
        return new JobPostingOtherDetailResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getRequiredSex(),
                jobPosting.getPayment(),
                jobPosting.getPayType(),
                jobPosting.getShootDate(),
                jobPosting.getCreatedDate()
        );
    }
}
