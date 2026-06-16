package com.modle.domain.review.service.reportValidator;

import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JobPostingReportValidator implements ReportTargetValidator {
    private final JobPostingRepository jobPostingRepository;

    @Override
    public ReportTargetType getTargetType() {
        return ReportTargetType.JOB_POSTING;
    }

    @Override
    public void validate(Long targetId, Long reporterId) {
        var posting = jobPostingRepository.findById(targetId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_TARGET_NOT_FOUND));

        // 내가 올린 공고는 신고 불가
        if (posting.getClientId().equals(reporterId)) {
            throw new CustomException(ErrorCode.REPORT_SELF_NOT_ALLOWED);
        }
    }
}
