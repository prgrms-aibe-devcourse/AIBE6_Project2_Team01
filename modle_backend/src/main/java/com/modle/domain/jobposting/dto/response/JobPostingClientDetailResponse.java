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
import java.util.List;

// JOB-007: 의뢰인 뷰 — 공고 정보 (AI 추천은 GET /jobs/{id}/recommendations 별도 API)
public record JobPostingClientDetailResponse(
        Long id,
        Long clientId,
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
        int clientReviewCount,
        List<String> imageUrls
) implements JobPostingDetailResponse {
    public static JobPostingClientDetailResponse from(JobPosting jobPosting, Client client, List<String> imageUrls) {
        return new JobPostingClientDetailResponse(
                jobPosting.getId(),
                jobPosting.getClientId(),
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
                client != null ? client.getReviewCount() : 0,
                imageUrls
        );
    }
}
