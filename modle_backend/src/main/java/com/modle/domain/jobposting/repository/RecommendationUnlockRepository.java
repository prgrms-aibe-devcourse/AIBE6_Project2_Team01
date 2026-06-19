package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.RecommendationUnlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecommendationUnlockRepository extends JpaRepository<RecommendationUnlock, Long> {

    Optional<RecommendationUnlock> findByPostId(Long postId);

    boolean existsByPostId(Long postId);
}
