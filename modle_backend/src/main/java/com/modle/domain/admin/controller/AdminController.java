package com.modle.domain.admin.controller;

import com.modle.domain.admin.dto.request.RejectRequest;
import com.modle.domain.admin.dto.response.PendingClientResponse;
import com.modle.domain.admin.service.AdminService;
import com.modle.domain.user.entity.Client;
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

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

    @PatchMapping("/clients/{userId}/approve")
    public ApiResponse<Void> approveClient(@PathVariable Long userId) {
        adminService.approveClient(userId);
        return new ApiResponse<>("200-1", "의뢰인 가입을 승인했습니다.");
    }

    @PatchMapping("/clients/{userId}/reject")
    public ApiResponse<Void> rejectClient(
            @PathVariable Long userId,
            @Valid @RequestBody RejectRequest request
    ) {
        adminService.rejectClient(userId, request.reason());
        return new ApiResponse<>("200-1", "의뢰인 가입을 반려했습니다.");
    }
}
