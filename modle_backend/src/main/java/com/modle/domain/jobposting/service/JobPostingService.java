package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.JobPostingTemplateResponse;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.event.JobPostingCreatedEvent;
import com.modle.domain.jobposting.exception.JobPostingNotEditableException;
import com.modle.domain.jobposting.exception.JobPostingNotFoundException;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.jobposting.repository.JobPostingTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final JobPostingTemplateRepository jobPostingTemplateRepository;
    private final ApplicationEventPublisher eventPublisher;


    // JOB-001: 카테고리별 공고 템플릿 목록을 반환한다.
    public List<JobPostingTemplateResponse> getTemplatesByCategory(String category) {
        return jobPostingTemplateRepository.findByCategory(category).stream()
                .map(JobPostingTemplateResponse::from)
                .toList();
    }


    // JOB-002: 공고를 저장하고(상태=모집 중) AI 모델 추천을 비동기로 트리거한다.
    @Transactional
    public JobPostingResponse createJobPosting(Long clientId, JobPostingCreateRequest request) {
        JobPosting jobPosting = JobPosting.builder()
                .clientId(clientId)
                .title(request.title())
                .content(request.content())
                .category(request.category())
                .region(request.region())
                .status(JobPostingStatus.RECRUITING)
                .build();

        JobPosting saved = jobPostingRepository.save(jobPosting);

        // 등록 후 AI 모델 추천 트리거 (유일 허용 비동기 지점)
        eventPublisher.publishEvent(new JobPostingCreatedEvent(saved.getId()));

        return JobPostingResponse.from(saved);
    }

    // JOB-003: 공고를 수정한다. 모집 중(RECRUITING) 상태에서만 수정 가능.
    @Transactional
    public JobPostingResponse updateJobPosting(Long jobPostingId, Long clientId, JobPostingUpdateRequest request) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new JobPostingNotFoundException(jobPostingId));

        if (jobPosting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new JobPostingNotEditableException(jobPostingId, jobPosting.getStatus());
        }

        // TODO(인증): 인증 머지 후 clientId == 토큰 userId 일치 검증 추가
        jobPosting.update(request.title(), request.content(), request.category(), request.region());
        return JobPostingResponse.from(jobPosting);
    }


    // JOB-004: 공고를 삭제한다. 모집 중(RECRUITING) 상태에서만 삭제 가능.
    @Transactional
    public void deleteJobPosting(Long jobPostingId, Long clientId) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new JobPostingNotFoundException(jobPostingId));

        if (jobPosting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new JobPostingNotEditableException(jobPostingId, jobPosting.getStatus());
        }

        // TODO(인증): 인증 머지 후 clientId == 토큰 userId 일치 검증 추가
        jobPostingRepository.delete(jobPosting);
    }
}
