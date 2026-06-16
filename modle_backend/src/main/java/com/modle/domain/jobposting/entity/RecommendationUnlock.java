package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(
        name = "recommendation_unlock",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_recommendation_unlock_post",
                columnNames = "post_id"
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecommendationUnlock extends BaseEntity {

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "unlocked_at", nullable = false)
    private LocalDateTime unlockedAt;

    @Column(name = "payment_id")
    private Long paymentId;

    public static RecommendationUnlock create(Long postId, Long clientId) {
        RecommendationUnlock unlock = new RecommendationUnlock();
        unlock.postId = postId;
        unlock.clientId = clientId;
        unlock.unlockedAt = LocalDateTime.now();
        return unlock;
    }
}
