package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.JobPostingBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobPostingBookmarkRepository extends JpaRepository<JobPostingBookmark, Long> {
    boolean existsByModelIdAndJobPostingId(Long modelId, Long jobPostingId);

    Optional<JobPostingBookmark> findByModelIdAndJobPostingId(Long modelId, Long jobPostingId);

    List<JobPostingBookmark> findByModelIdOrderByCreatedDateDesc(Long modelId);
}
