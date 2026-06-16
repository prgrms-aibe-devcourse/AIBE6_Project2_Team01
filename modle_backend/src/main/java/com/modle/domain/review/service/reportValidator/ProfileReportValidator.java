package com.modle.domain.review.service.reportValidator;

import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfileReportValidator implements ReportTargetValidator {
    private final UserRepository userRepository;

    @Override
    public ReportTargetType getTargetType() {
        return ReportTargetType.PROFILE;
    }

    @Override
    public void validate(Long targetId, Long reporterId) {
        userRepository.findById(targetId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_TARGET_NOT_FOUND));

        // 내 프로필 신고 불가
        if (targetId.equals(reporterId)) {
            throw new CustomException(ErrorCode.REPORT_SELF_NOT_ALLOWED);
        }
    }
}
