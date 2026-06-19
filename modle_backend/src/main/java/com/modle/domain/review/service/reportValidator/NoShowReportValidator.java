package com.modle.domain.review.service.reportValidator;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NoShowReportValidator implements ReportTargetValidator {
    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;

    @Override
    public ReportTargetType getTargetType() {
        return ReportTargetType.NO_SHOW;
    }

    @Override
    public void validate(Long targetId, Long reporterId) {
        // targetId = applicationId
        Application application = applicationRepository.findById(targetId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        // SHOOTING 상태에서만 신고 가능
        if (application.getStatus() != ApplicationStatus.SHOOTING) {
            throw new CustomException(ErrorCode.REPORT_NO_SHOW_NOT_ALLOWED);
        }

        // 공고 작성자(의뢰인)만 신고 가능
        JobPosting jobPosting = jobPostingRepository.findById(application.getJobPostingId())
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (!jobPosting.getClientId().equals(reporterId)) {
            throw new CustomException(ErrorCode.REPORT_ACCESS_DENIED);
        }
    }
}
