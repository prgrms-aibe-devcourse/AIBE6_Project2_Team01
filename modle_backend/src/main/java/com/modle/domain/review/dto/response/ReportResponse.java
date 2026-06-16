package com.modle.domain.review.dto.response;

import com.modle.domain.review.entity.Report;
import com.modle.domain.review.entity.type.ReportReason;
import com.modle.domain.review.entity.type.ReportStatus;
import com.modle.domain.review.entity.type.ReportTargetType;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long reporterId,
        ReportTargetType targetType,
        Long targetId,
        ReportReason reason,
        String description,
        ReportStatus status,
        String dismissReason,
        LocalDateTime createdDate
) {
    public static ReportResponse from(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getReporterId(),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getDismissReason(),
                report.getCreatedDate()
        );
    }
}
