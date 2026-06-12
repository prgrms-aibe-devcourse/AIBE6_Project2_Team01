package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.entity.PayType;
import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.jobposting.entity.RequiredSex;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// JOB-007: 의뢰인 뷰 — 공고 정보 + AI 추천 모델 섹션 (수락 버튼 없음)
public record JobPostingClientDetailResponse(
        Long id,
        Long clientId,
        String title,
        String content,
        Category category,
        Region region,
        JobPostingStatus status,
        RequiredSex requiredSex,
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
                jobPosting.getRequiredSex(),
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
                List.of()
        );
    }
}
