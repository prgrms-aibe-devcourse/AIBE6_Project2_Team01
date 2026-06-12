package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.entity.PayType;
import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.jobposting.entity.RequiredSex;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        Integer ageMin,
        Integer ageMax,
        Integer heightMin,
        Integer heightMax,
        Integer weightMin,
        Integer weightMax,
        Integer minCareerMonths,
        BigDecimal payment,
        PayType payType,
        LocalDate shootDate,
        LocalDateTime createdDate,
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
                false
        );
    }
}
