package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.JobPostingImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostingImageRepository extends JpaRepository<JobPostingImage, Long> {

    List<JobPostingImage> findByJobPostingIdOrderByDisplayOrderAsc(Long jobPostingId);

    void deleteByJobPostingId(Long jobPostingId);
}
