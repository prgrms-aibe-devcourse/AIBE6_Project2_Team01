package com.modle.domain.jobposting.service;

import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingStatusUpdateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.*;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.ViewerType;
import com.modle.domain.jobposting.event.JobPostingCreatedEvent;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.global.entity.type.Region;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ApplicationRepository applicationRepository;
    private final ClientRepository clientRepository;


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
                .requiredCount(request.requiredCount())
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
                request.requiredSex(), request.requiredCount(),request.ageMin(), request.ageMax(),
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

        JobPostingStatus status = jobPosting.getStatus();
        if (status != JobPostingStatus.RECRUITING && status != JobPostingStatus.CANCELLED) {
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
            throw new CustomException(ErrorCode.JOB_POSTING_INVALID_FILTER_VALUE);
        }
    }

    // JOB-009: 공고 상태를 변경한다. 허용된 전환만 가능하며 본인 공고만 변경 가능.
    @Transactional
    public JobPostingResponse updateJobPostingStatus(Long jobPostingId, Long clientId, JobPostingStatusUpdateRequest request) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }

        if (!jobPosting.getStatus().canTransitionTo(request.status())) {
            throw new CustomException(ErrorCode.JOB_POSTING_INVALID_STATUS_TRANSITION);
        }

        // SHOOTING 상태에서 직접 종료 시 활성 지원(SHOOTING/ON_HOLD)이 있으면 차단
        Set<JobPostingStatus> directTerminalFromShooting = Set.of(JobPostingStatus.CANCELLED, JobPostingStatus.COMPLETED);
        if (jobPosting.getStatus() == JobPostingStatus.SHOOTING
                && directTerminalFromShooting.contains(request.status())) {
            boolean hasActive = applicationRepository.existsByJobPostingIdAndStatusIn(
                    jobPostingId,
                    List.of(ApplicationStatus.SHOOTING, ApplicationStatus.ON_HOLD)
            );
            if (hasActive) {
                throw new CustomException(ErrorCode.JOB_POSTING_HAS_ACTIVE_APPLICATION);
            }
        }

        jobPosting.updateStatus(request.status());
        return JobPostingResponse.from(jobPosting);
    }

    // 재모집: 기존 공고를 마감하고 동일 내용으로 새 공고(RECRUITING)를 생성한다.
    @Transactional
    public JobPosting cloneForReRecruit(Long jobPostingId) {
        JobPosting original = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        original.updateStatus(JobPostingStatus.CLOSED);

        JobPosting clone = JobPosting.builder()
                .clientId(original.getClientId())
                .title(original.getTitle())
                .content(original.getContent())
                .category(original.getCategory())
                .region(original.getRegion())
                .status(JobPostingStatus.RECRUITING)
                .requiredSex(original.getRequiredSex())
                .requiredCount(original.getRequiredCount())
                .ageMin(original.getAgeMin())
                .ageMax(original.getAgeMax())
                .heightMin(original.getHeightMin())
                .heightMax(original.getHeightMax())
                .weightMin(original.getWeightMin())
                .weightMax(original.getWeightMax())
                .minCareerMonths(original.getMinCareerMonths())
                .payment(original.getPayment())
                .payType(original.getPayType())
                .shootDate(original.getShootDate())
                .build();

        JobPosting saved = jobPostingRepository.save(clone);
        eventPublisher.publishEvent(new JobPostingCreatedEvent(saved.getId()));
        return saved;
    }

    public List<JobPostingListResponse> getMyRecruitingJobPostings(Long clientId) {
        return jobPostingRepository
                .findByClientIdAndStatusOrderByCreatedDateDesc(clientId, JobPostingStatus.RECRUITING)
                .stream()
                .map(JobPostingListResponse::from)
                .toList();
    }

    /**
     * 지원(application) 도메인 등 타 도메인에서 공고 모집 상태·작성자를 확인할 때 사용하는 공개 조회 메서드.
     */
    public JobPostingResponse getJobPosting(Long jobPostingId) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));
        return JobPostingResponse.from(jobPosting);
    }

    // JOB-006~008: 뷰어 타입에 따라 다른 공고 상세 정보를 반환한다.
    public JobPostingDetailResponse getJobPostingDetail(Long jobPostingId, ViewerType viewerType) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        Client client = clientRepository.findByUserId(jobPosting.getClientId()).orElse(null);

        return switch (viewerType) {
            case MODEL -> JobPostingModelDetailResponse.from(jobPosting, client);
            case CLIENT -> JobPostingClientDetailResponse.from(jobPosting, client);
            case OTHER -> JobPostingOtherDetailResponse.from(jobPosting, client);
        };
    }

    // MATCH-006: 작성한 공고 목록 (의뢰인)
    public List<MyJobPostingResponse> getMyJobPostings(Long clientId) {
        List<JobPosting> jobPostings =
                jobPostingRepository.findByClientIdOrderByCreatedDateDesc(clientId);

        return jobPostings.stream()
                .map(jobPosting -> {
                    long applicantCount = applicationRepository.countByJobPostingIdAndStatusNot(
                            jobPosting.getId(), ApplicationStatus.APPLICATION_CANCELLED);

                    long contactedCount = applicationRepository.countByJobPostingIdAndStatusIn(
                            jobPosting.getId(),
                            List.of(
                                    ApplicationStatus.CONTACTED,
                                    ApplicationStatus.CONTRACT_SENT,
                                    ApplicationStatus.SHOOTING,
                                    ApplicationStatus.COMPLETED
                            )
                    );

                    long completedCount = applicationRepository.countByJobPostingIdAndStatus(
                            jobPosting.getId(),
                            ApplicationStatus.COMPLETED
                    );

                    return MyJobPostingResponse.of(
                            jobPosting,
                            applicantCount,
                            contactedCount,
                            completedCount
                    );
                })
                .toList();
    }

    @Transactional
    public void markShooting(Long jobPostingId) {
        JobPosting jobPosting = jobPostingRepository.findByIdForUpdate(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        jobPosting.updateStatus(JobPostingStatus.SHOOTING);
    }
}
