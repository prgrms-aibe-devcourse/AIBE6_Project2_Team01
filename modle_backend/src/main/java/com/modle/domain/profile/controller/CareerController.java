package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.response.CareerResponse;
import com.modle.domain.profile.service.CareerService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
@Tag(name = "경력", description = "모델 경력 조회·공개설정 API")
public class CareerController {
    private final CareerService careerService;

    // 내 경력 조회 (마이페이지 — MODEL만)
    @Operation(summary = "내 경력 조회", description = "마이페이지에서 본인 경력을 조회합니다. (MODEL 전용)")
    @GetMapping("/careers/my")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<List<CareerResponse>> getMyCareer(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "내 경력 조회 성공",
                careerService.getMyCareer(securityUser.getId()));
    }

    // 모델 공개 경력 조회 (프로필 페이지)
    @Operation(summary = "모델 공개 경력 조회", description = "프로필 페이지에서 특정 모델의 공개 경력을 조회합니다.")
    @GetMapping("/models/{modelId}/careers")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<List<CareerResponse>> getPublicCareer(
            @PathVariable Long modelId
    ) {
        return new ApiResponse<>("200-1", "경력 조회 성공",
                careerService.getPublicCareer(modelId));
    }

    // 경력 공개 여부 변경 (MODEL만)
    @Operation(summary = "경력 공개 여부 변경", description = "특정 경력의 공개/비공개 여부를 변경합니다. (MODEL 전용)")
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
