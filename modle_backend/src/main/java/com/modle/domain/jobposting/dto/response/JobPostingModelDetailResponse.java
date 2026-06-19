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

// JOB-006: 모델 뷰 — 공고 정보 + 즐겨찾기 여부 (지원하기·즐겨찾기 버튼은 프론트에서 노출)
public record JobPostingModelDetailResponse(
        Long id,
        String title,
        String content,
        Category category,
        Region region,
        JobPostingStatus status,
        RequiredSex requiredSex,
        Integer requiredCount,
        Integer ageMin,
        Integer ageMax,
        Integer heightMin,
        Integer heightMax,
        Integer weightMin,
        Integer weightMax,
        Integer minCareerMonths,
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
    public static JobPostingModelDetailResponse from(JobPosting jobPosting, Client client) {
        return new JobPostingModelDetailResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getContent(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getRequiredSex(),
                jobPosting.getRequiredCount(),
                jobPosting.getAgeMin(),
                jobPosting.getAgeMax(),
                jobPosting.getHeightMin(),
                jobPosting.getHeightMax(),
                jobPosting.getWeightMin(),
                jobPosting.getWeightMax(),
                jobPosting.getMinCareerMonths(),
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
