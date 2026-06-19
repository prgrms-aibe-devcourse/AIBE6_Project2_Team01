package com.modle.domain.review.dto.response;

import com.modle.domain.review.entity.Review;
import com.modle.domain.review.entity.type.ReviewerRole;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long applicationId,
        Long reviewerId,
        Long targetId,
        ReviewerRole reviewerRole,
        int rating,
        String content,
        LocalDateTime createdDate
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getApplicationId(),
                review.getReviewerId(),
                review.getTargetId(),
                review.getReviewerRole(),
                review.getRating(),
                review.getContent(),
                review.getCreatedDate()
        );
    }
}
