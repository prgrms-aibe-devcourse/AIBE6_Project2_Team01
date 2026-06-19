package com.modle.domain.review.entity;

import com.modle.domain.review.entity.type.ReviewerRole;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "review",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_review_application_reviewer",
                        columnNames = {"application_id", "reviewer_id"}
                )
        }
)
@Getter
@NoArgsConstructor
public class Review extends BaseEntity {
    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private Long reviewerId; // 리뷰 작성자 User.id

    @Column(nullable = false)
    private Long targetId; // 리뷰 대상 User.id

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewerRole reviewerRole;  // CLIENT_TO_MODEL, MODEL_TO_CLIENT

    @Column(nullable = false)
    private int rating;

    @Column(length = 500)
    private String content;

    public static Review create(Long applicationId, Long reviewerId,
                                Long targetId, ReviewerRole reviewerRole,
                                int rating, String content) {
        Review review = new Review();
        review.applicationId = applicationId;
        review.reviewerId = reviewerId;
        review.targetId = targetId;
        review.reviewerRole = reviewerRole;
        review.rating = rating;
        review.content = content;
        return review;
    }
}
