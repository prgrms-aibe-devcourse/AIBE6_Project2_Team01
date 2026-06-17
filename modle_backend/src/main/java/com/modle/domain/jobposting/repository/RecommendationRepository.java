package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByPostIdOrderByRankAsc(Long postId);

    @Modifying(flushAutomatically = true)
    @Query("delete from Recommendation r where r.postId = :postId")
    void deleteByPostId(@Param("postId") Long postId);
}
