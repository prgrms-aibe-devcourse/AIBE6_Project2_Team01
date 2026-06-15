package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.JobPostingClientDetailResponse;
import com.modle.domain.jobposting.dto.response.JobPostingListResponse;
import com.modle.domain.jobposting.dto.response.JobPostingModelDetailResponse;
import com.modle.domain.jobposting.dto.response.JobPostingOtherDetailResponse;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.JobPostingTemplateResponse;
import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.jobposting.entity.ViewerType;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.domain.jobposting.event.JobPostingCreatedEvent;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.jobposting.repository.JobPostingTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
                .requiredSex(request.requiredSex())
                .ageMin(request.ageMin())
                .ageMax(request.ageMax())
                .heightMin(request.heightMin())
                .heightMax(request.heightMax())
                .weightMin(request.weightMin())
                .weightMax(request.weightMax())
                .minCareerMonths(request.minCareerMonths())
                .payment(request.payment())
                .payType(request.payType())
                .shootDate(request.shootDate())
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
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }

        if (jobPosting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.JOB_POSTING_NOT_EDITABLE);
        }

        jobPosting.update(request.title(), request.content(), request.category(), request.region(),
                request.requiredSex(), request.ageMin(), request.ageMax(),
                request.heightMin(), request.heightMax(),
                request.weightMin(), request.weightMax(),
                request.minCareerMonths(),
                request.payment(), request.payType(), request.shootDate());
        return JobPostingResponse.from(jobPosting);
    }


    // JOB-004: 공고를 삭제한다. 모집 중(RECRUITING) 상태에서만 삭제 가능.
    @Transactional
    public void deleteJobPosting(Long jobPostingId, Long clientId) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }

        if (jobPosting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.JOB_POSTING_NOT_EDITABLE);
        }

        jobPostingRepository.delete(jobPosting);
    }

    // JOB-005: 지역·카테고리 필터를 적용한 공고 목록을 반환한다.
    public Page<JobPostingListResponse> getJobPostings(String region, String category, Pageable pageable) {
        Region regionEnum = parseEnum(Region.class, region);
        Category categoryEnum = parseEnum(Category.class, category);
        return jobPostingRepository.findByFilter(regionEnum, categoryEnum, pageable)
                .map(JobPostingListResponse::from);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value);
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.JOB_POSTING_INVALID);
        }
    }

    // JOB-006~008: 뷰어 타입에 따라 다른 공고 상세 정보를 반환한다.
    public Object getJobPostingDetail(Long jobPostingId, ViewerType viewerType) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        return switch (viewerType) {
            case MODEL -> JobPostingModelDetailResponse.from(jobPosting);
            case CLIENT -> JobPostingClientDetailResponse.from(jobPosting);
            case OTHER -> JobPostingOtherDetailResponse.from(jobPosting);
        };
    }
}
