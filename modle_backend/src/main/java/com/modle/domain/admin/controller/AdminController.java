package com.modle.domain.admin.controller;

import com.modle.domain.admin.dto.request.RejectRequest;
import com.modle.domain.admin.dto.response.NoShowReportResponse;
import com.modle.domain.admin.dto.response.PendingClientResponse;
import com.modle.domain.admin.service.AdminService;
import com.modle.domain.user.dto.UserDto;
import com.modle.domain.user.entity.Client;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "관리자", description = "의뢰인 승인·계정 정지 등 관리자 전용 API")
public class AdminController {
    private final AdminService adminService;

    @Operation(summary = "승인 대기 의뢰인 목록 조회", description = "가입 승인 대기 중인 의뢰인 목록을 조회합니다.")
    @GetMapping("/clients/pending")
    public ApiResponse<List<PendingClientResponse>> getPendingClients() {
        List<Client> clients = adminService.getPendingClients();
        List<PendingClientResponse> response  = clients.stream()
                .map(PendingClientResponse::new)
                .toList();
        return new ApiResponse<>(
                "200-1",
                "승인 대기 목록 조회",
                response
        );
    }

    @Operation(summary = "의뢰인 가입 승인", description = "대기 중인 의뢰인의 가입을 승인합니다.")
    @PatchMapping("/clients/{userId}/approve")
    public ApiResponse<Void> approveClient(@PathVariable Long userId) {
        adminService.approveClient(userId);
        return new ApiResponse<>("200-1", "의뢰인 가입을 승인했습니다.");
    }

    @Operation(summary = "의뢰인 가입 반려", description = "대기 중인 의뢰인의 가입을 사유와 함께 반려합니다.")
    @PatchMapping("/clients/{userId}/reject")
    public ApiResponse<Void> rejectClient(
            @PathVariable Long userId,
            @Valid @RequestBody RejectRequest request
    ) {
        adminService.rejectClient(userId, request.reason());
        return new ApiResponse<>("200-1", "의뢰인 가입을 반려했습니다.");
    }

    // 경고 횟수 N 이상 유저 목록
    @Operation(summary = "경고 누적 유저 목록 조회", description = "경고 횟수가 기준치 이상인 유저 목록을 조회합니다.")
    @GetMapping("/users/warnings")
    public ApiResponse<List<UserDto>> getUsersByWarningCount(
            @RequestParam(defaultValue = "3") int minCount
    ) {
        return ApiResponse.ok(
                "경고 유저 목록 조회 성공",
                adminService.getUsersByWarningCount(minCount)
        );
    }

    // 노쇼 신고 PENDING 목록
    @Operation(summary = "노쇼 신고 목록 조회", description = "처리 대기(PENDING) 상태의 노쇼 신고 목록을 조회합니다.")
    @GetMapping("/reports/no-show")
    public ApiResponse<List<NoShowReportResponse>> getPendingNoShowReports() {
        return ApiResponse.ok(
                "노쇼 신고 목록 조회 성공",
                adminService.getPendingNoShowReports()
        );
    }

    // 계정 정지
    @Operation(summary = "계정 정지", description = "특정 유저의 계정을 정지 처리합니다.")
    @PatchMapping("/users/{userId}/suspend")
    public ApiResponse<UserDto> suspendUser(
            @PathVariable Long userId
    ) {
        return ApiResponse.ok(
                "계정이 정지되었습니다.",
                adminService.suspendUser(userId)
        );
    }
}
