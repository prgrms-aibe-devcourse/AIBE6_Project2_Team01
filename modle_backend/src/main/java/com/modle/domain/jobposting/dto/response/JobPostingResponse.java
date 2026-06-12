package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.entity.PayType;
import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.jobposting.entity.RequiredSex;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobPostingResponse(
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
        LocalDateTime createdDate
) {
    public static JobPostingResponse from(JobPosting jobPosting) {
        return new JobPostingResponse(
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
                jobPosting.getCreatedDate()
        );
    }
}
