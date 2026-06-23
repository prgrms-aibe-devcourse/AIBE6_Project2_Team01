package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.global.entity.type.Region;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT j FROM JobPosting j WHERE j.id = :id")
    Optional<JobPosting> findByIdForUpdate(@Param("id") Long id);

    // JOB-005: 지역·카테고리·상태 필터 (null이면 해당 조건 전체 조회)
    @Query("SELECT j FROM JobPosting j WHERE (:region IS NULL OR j.region = :region) AND (:category IS NULL OR j.category = :category) AND (:status IS NULL OR j.status = :status)")
    Page<JobPosting> findByFilter(@Param("region") Region region, @Param("category") Category category, @Param("status") JobPostingStatus status, Pageable pageable);

    List<JobPosting> findByClientIdAndStatusOrderByCreatedDateDesc(
            Long clientId,
            JobPostingStatus status
    );

    // MATCH-006: 의뢰인 전체 공고 목록 (상태 무관)
    List<JobPosting> findByClientIdOrderByCreatedDateDesc(Long clientId);

    // PROFILE: 의뢰인 공개 공고 목록 (지정한 상태 집합만)
    List<JobPosting> findByClientIdAndStatusInOrderByCreatedDateDesc(
            Long clientId,
            List<JobPostingStatus> statuses
    );
}
