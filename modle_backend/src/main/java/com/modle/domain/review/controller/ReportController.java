package com.modle.domain.review.controller;

import com.modle.domain.review.dto.request.CreateReportRequest;
import com.modle.domain.review.dto.request.HandleReportRequest;
import com.modle.domain.review.dto.response.ReportResponse;
import com.modle.domain.review.entity.type.ReportStatus;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.domain.review.service.ReportService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "신고", description = "신고 접수 및 관리자 신고 처리 API")
public class ReportController {
    private final ReportService reportService;

    // 신고 접수
    @Operation(summary = "신고 접수", description = "유저·공고 등에 대한 신고를 접수합니다.")
    @PostMapping("/api/v1/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReportResponse> createReport(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateReportRequest request
    ) {
        return new ApiResponse<>(
                "201-1",
                "신고가 접수되었습니다.",
                reportService.createReport(securityUser.getId(), request)
        );
    }

    // 관리자 신고 목록 조회
    @Operation(summary = "신고 목록 조회 (관리자)", description = "대상 유형·상태로 신고 목록을 조회합니다. (ADMIN 전용)")
    @GetMapping("/api/v1/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<ReportResponse>> getReports(
            @RequestParam(required = false) ReportTargetType targetType,
            @RequestParam(required = false) ReportStatus status,
            Pageable pageable
    ) {
        return ApiResponse.ok(
                "신고 목록 조회 성공",
                reportService.getReports(targetType, status, pageable)
        );
    }

    // 관리자 신고 처리
    @Operation(summary = "신고 처리 (관리자)", description = "접수된 신고를 처리합니다. (ADMIN 전용)")
    @PatchMapping("/api/v1/admin/reports/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ReportResponse> handleReport(
            @PathVariable Long reportId,
            @Valid @RequestBody HandleReportRequest request
    ) {
        return ApiResponse.ok(
                "신고 처리가 완료되었습니다.",
                reportService.handleReport(reportId, request)
        );
    }
}
