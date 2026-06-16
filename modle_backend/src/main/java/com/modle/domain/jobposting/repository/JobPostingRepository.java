package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    // JOB-005: 지역·카테고리 필터 (null이면 전체 조회)
    @Query("SELECT j FROM JobPosting j WHERE (:region IS NULL OR j.region = :region) AND (:category IS NULL OR j.category = :category)")
    Page<JobPosting> findByFilter(@Param("region") Region region, @Param("category") Category category, Pageable pageable);

    List<JobPosting> findByClientIdAndStatusOrderByCreatedDateDesc(
            Long clientId,
            JobPostingStatus status
    );
}
