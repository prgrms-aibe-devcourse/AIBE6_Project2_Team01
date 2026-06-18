package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.global.entity.type.Region;
import com.modle.domain.jobposting.entity.type.RequiredSex;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobPostingListResponse(
        Long id,
        String title,
        Category category,
        Region region,
        JobPostingStatus status,
        RequiredSex requiredSex,
        BigDecimal payment,
        PayType payType,
        LocalDateTime shootDate,
        LocalDateTime createdDate
) {
    public static JobPostingListResponse from(JobPosting jobPosting) {
        return new JobPostingListResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
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
