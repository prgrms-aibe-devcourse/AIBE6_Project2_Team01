package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(
        name = "recommendation",
        indexes = @Index(name = "idx_recommendation_post", columnList = "post_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_recommendation_post_model",
                columnNames = {"post_id", "model_id"}
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recommendation extends BaseEntity {

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "recommendation_rank", nullable = false)
    private int rank;

    @Column(nullable = false)
    private double score;

    public static Recommendation create(
            Long postId,
            Long modelId,
            Long userId,
            int rank,
            double score
    ) {
        Recommendation recommendation = new Recommendation();
        recommendation.postId = postId;
        recommendation.modelId = modelId;
        recommendation.userId = userId;
        recommendation.rank = rank;
        recommendation.score = score;
        return recommendation;
    }
}
