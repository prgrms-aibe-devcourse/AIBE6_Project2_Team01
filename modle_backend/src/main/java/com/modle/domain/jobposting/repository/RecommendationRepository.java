package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByPostIdOrderByRankAsc(Long postId);

    void deleteByPostId(Long postId);
}
