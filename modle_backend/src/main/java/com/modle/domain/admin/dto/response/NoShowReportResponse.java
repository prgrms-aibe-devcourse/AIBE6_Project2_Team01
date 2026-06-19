package com.modle.domain.admin.dto.response;

import java.time.LocalDateTime;

public record NoShowReportResponse(
        Long reportId,
        Long applicationId,
        Long modelUserId,
        String modelName,
        int warningCount,
        LocalDateTime reportedAt
) {}
