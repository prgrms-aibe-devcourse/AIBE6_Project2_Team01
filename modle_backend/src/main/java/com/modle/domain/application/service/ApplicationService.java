package com.modle.domain.application.service;

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
    public ApplicationResponse applyToJob(Long modelId, Long jobPostingId) {
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(jobPostingId);

        if (jobPosting.status() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.APPLICATION_JOB_NOT_RECRUITING);
        }

        boolean alreadyApplied = applicationRepository
                .existsByJobPostingIdAndModelIdAndStatusNot(jobPostingId, modelId, ApplicationStatus.CANCELLED);
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.APPLICATION_ALREADY_EXISTS);
        }

        Application application = Application.builder()
                .jobPostingId(jobPostingId)
                .modelId(modelId)
                .status(ApplicationStatus.APPLIED)
                .build();
        Application saved = applicationRepository.save(application);

        // TODO(message 도메인 협의 필요): 지원 완료 시 의뢰인에게 알림 발송 연동
        return ApplicationResponse.from(saved);
    }
}
