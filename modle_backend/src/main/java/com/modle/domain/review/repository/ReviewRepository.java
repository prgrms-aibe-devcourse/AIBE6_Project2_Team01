package com.modle.domain.review.repository;

import com.modle.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 중복 리뷰 방지
    boolean existsByApplicationIdAndReviewerId(Long applicationId, Long reviewerId);
}
