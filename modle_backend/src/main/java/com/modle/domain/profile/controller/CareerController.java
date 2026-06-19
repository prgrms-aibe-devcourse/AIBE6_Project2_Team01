package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.response.CareerResponse;
import com.modle.domain.profile.service.CareerService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class CareerController {
    private final CareerService careerService;

    // 내 경력 조회 (마이페이지 — MODEL만)
    @GetMapping("/careers/my")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<List<CareerResponse>> getMyCareer(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "내 경력 조회 성공",
                careerService.getMyCareer(securityUser.getId()));
    }

    // 모델 공개 경력 조회 (프로필 페이지)
    @GetMapping("/models/{modelId}/careers")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<List<CareerResponse>> getPublicCareer(
            @PathVariable Long modelId
    ) {
        return new ApiResponse<>("200-1", "경력 조회 성공",
                careerService.getPublicCareer(modelId));
    }

    // 경력 공개 여부 변경 (MODEL만)
    @PatchMapping("/careers/{careerId}/public")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<CareerResponse> updatePublic(
            @PathVariable Long careerId,
            @RequestParam boolean isPublic,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "공개 여부가 변경되었습니다.",
                careerService.updatePublic(securityUser.getId(), careerId, isPublic));
    }
}
