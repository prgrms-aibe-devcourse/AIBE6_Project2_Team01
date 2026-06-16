package com.modle.domain.review.service.reportValidator;

import com.modle.domain.review.entity.type.ReportTargetType;

public interface ReportTargetValidator {
    ReportTargetType getTargetType();
    void validate(Long targetId, Long reporterId);
}
