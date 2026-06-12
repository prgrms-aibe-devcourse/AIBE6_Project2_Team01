package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.entity.PayType;
import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.jobposting.entity.RequiredSex;

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
