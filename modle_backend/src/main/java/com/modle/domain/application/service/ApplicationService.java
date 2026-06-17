package com.modle.domain.application.service;

import com.modle.domain.application.dto.request.ApplicationCreateRequest;
import com.modle.domain.application.dto.response.ApplicationResponse;
import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingService jobPostingService;

    // MATCH-001: 모집 중 상태·중복 지원 검증 후 지원을 생성한다 (상태=APPLIED).
    @Transactional
    public ApplicationResponse applyToJob(Long modelId, Long jobPostingId, ApplicationCreateRequest request) {
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(jobPostingId);

        if (jobPosting.status() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.APPLICATION_JOB_NOT_RECRUITING);
        }

        boolean alreadyApplied = applicationRepository
                .existsByJobPostingIdAndModelIdAndStatusNot(jobPostingId, modelId, ApplicationStatus.APPLICATION_CANCELLED);
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.APPLICATION_ALREADY_EXISTS);
        }

        Application application = Application.builder()
                .jobPostingId(jobPostingId)
                .modelId(modelId)
                .coverLetter(request != null ? request.coverLetter() : null)
                .status(ApplicationStatus.APPLIED)
                .build();
        Application saved = applicationRepository.save(application);

        // TODO(message 도메인 협의 필요): 지원 완료 시 의뢰인에게 알림 발송 연동
        return ApplicationResponse.from(saved);
    }

    // MATCH-002: 모델이 본인의 지원을 취소한다 (상태=APPLICATION_CANCELLED).
    @Transactional
    public ApplicationResponse cancelApplication(Long modelId, Long applicationId) {
        Application application = applicationRepository
                .findByIdAndModelId(applicationId, modelId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        if (application.getModelId() == null || !application.getModelId().equals(modelId)) {
            throw new CustomException(ErrorCode.APPLICATION_CANCEL_FORBIDDEN);
        }

        application.cancel();
        return ApplicationResponse.from(application);
    }
}
