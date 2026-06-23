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

public record JobPostingListResponse(
        Long id,
        String title,
        Category category,
        Region region,
        JobPostingStatus status,
        RequiredSex requiredSex,
        Integer requiredCount,
        BigDecimal payment,
        PayType payType,
        LocalDateTime shootDate,
        LocalDateTime createdDate,
        String clientCompanyName,
        String clientProfileImageUrl
) {
    public static JobPostingListResponse from(JobPosting jobPosting) {
        return from(jobPosting, null);
    }

    public static JobPostingListResponse from(JobPosting jobPosting, Client client) {
        return new JobPostingListResponse(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getCategory(),
                jobPosting.getRegion(),
                jobPosting.getStatus(),
                jobPosting.getRequiredSex(),
                jobPosting.getRequiredCount(),
                jobPosting.getPayment(),
                jobPosting.getPayType(),
                jobPosting.getShootDate(),
                jobPosting.getCreatedDate(),
                client != null ? client.getCompanyName() : null,
                client != null ? client.getProfileImageUrl() : null
        );
    }
}
