package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.global.entity.type.Region;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import com.modle.domain.user.entity.Client;

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
        Integer requiredCount,
        BigDecimal payment,
        PayType payType,
        LocalDateTime shootDate,
        LocalDateTime createdDate,
        Long clientProfileId,
        String clientCompanyName,
        String clientRegion,
        double clientAvgRating,
        int clientReviewCount
) implements JobPostingDetailResponse {
    public static JobPostingOtherDetailResponse from(JobPosting jobPosting, Client client) {
        return new JobPostingOtherDetailResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getRequiredSex(),
                jobPosting.getRequiredCount(),
                jobPosting.getPayment(),
                jobPosting.getPayType(),
                jobPosting.getShootDate(),
                jobPosting.getCreatedDate(),
                client != null ? client.getId() : null,
                client != null ? client.getCompanyName() : null,
                client != null ? client.getUser().getRegion() : null,
                client != null ? client.getAvgRating() : 0.0,
                client != null ? client.getReviewCount() : 0
        );
    }
}
