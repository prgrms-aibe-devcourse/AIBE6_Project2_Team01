package com.modle.domain.jobposting.controller;

import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingStatusUpdateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingTemplateGenerateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.JobPostingDetailResponse;
import com.modle.domain.jobposting.dto.response.JobPostingListResponse;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.JobPostingTemplateGenerateResponse;
import com.modle.domain.jobposting.dto.response.MyJobPostingResponse;
import com.modle.domain.jobposting.dto.response.RecommendationListResponse;
import com.modle.domain.jobposting.service.AiRecommendService;
import com.modle.domain.jobposting.entity.type.ViewerType;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.jobposting.service.JobPostingTemplateService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/jobs")
@Tag(name = "공고", description = "공고 등록·조회·수정·AI 추천 API")
public class JobPostingController {

    private final JobPostingService jobPostingService;
    private final AiRecommendService aiRecommendService;
    private final JobPostingTemplateService jobPostingTemplateService;

    // JOB-001: AI 공고 본문 생성 (CLIENT 전용).
    @Operation(summary = "AI 공고 본문 생성", description = "입력 정보를 바탕으로 AI가 공고 본문을 생성합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/templates/generate")
    public ApiResponse<JobPostingTemplateGenerateResponse> generateTemplate(
            @Valid @RequestBody JobPostingTemplateGenerateRequest request) {
        String content = jobPostingTemplateService.generateContent(request);
        return ApiResponse.ok("AI 본문 생성 성공", new JobPostingTemplateGenerateResponse(content));
    }

    // JOB-002: 공고 등록(상태=모집 중) 후 AI 모델 추천 트리거.
    @Operation(summary = "공고 등록", description = "공고를 모집 중 상태로 등록하고 AI 모델 추천을 트리거합니다. (CLIENT 전용)")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping
    public ApiResponse<JobPostingResponse> create(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody JobPostingCreateRequest request) {
        return ApiResponse.ok("공고 등록 성공", jobPostingService.createJobPosting(securityUser.getId(), request));
    }

    // JOB-003: 공고 수정 (모집 중 상태에서만 가능).
    @Operation(summary = "공고 수정", description = "모집 중 상태의 공고를 수정합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/{id}")
    public ApiResponse<JobPostingResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody JobPostingUpdateRequest request) {
        return ApiResponse.ok("공고 수정 성공", jobPostingService.updateJobPosting(id, securityUser.getId(), request));
    }

    // JOB-004: 공고 삭제 (모집 중 상태에서만 가능).
    @Operation(summary = "공고 삭제", description = "모집 중 상태의 공고를 삭제합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        jobPostingService.deleteJobPosting(id, securityUser.getId());
        return ApiResponse.ok("공고 삭제 성공");
    }

    // JOB-005: 지역·카테고리 필터를 적용한 공고 목록 반환.
    @Operation(summary = "공고 목록 조회", description = "지역·카테고리·상태 필터와 페이징을 적용해 공고 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<Page<JobPostingListResponse>> getJobPostings(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @ParameterObject @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok("공고 목록 조회 성공", jobPostingService.getJobPostings(region, category, status, pageable));
    }

    @Operation(summary = "내 모집 중 공고 목록 조회", description = "본인이 작성한 모집 중 공고 목록을 조회합니다. (CLIENT 전용)")
    @GetMapping("/mine/recruiting")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<List<JobPostingListResponse>> getMyRecruitingJobPostings(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return ApiResponse.ok(
                "내 모집 중 공고 목록 조회 성공",
                jobPostingService.getMyRecruitingJobPostings(securityUser.getId())
        );
    }

    @Operation(summary = "추천 모델 목록 조회", description = "공고에 대한 AI 추천 모델 목록을 조회합니다. (CLIENT 전용)")
    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<RecommendationListResponse> getRecommendations(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return ApiResponse.ok(
                "추천 모델 목록 조회 성공",
                aiRecommendService.getOrCreateRecommendations(id, securityUser.getId())
        );
    }

    @Operation(summary = "추천 모델 잠금 해제", description = "공고의 AI 추천 모델 정보를 잠금 해제합니다. (CLIENT 전용)")
    @PostMapping("/{id}/recommendations/unlock")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<RecommendationListResponse> unlockRecommendations(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return ApiResponse.ok(
                "추천 모델 잠금 해제 성공",
                aiRecommendService.unlockRecommendations(id, securityUser.getId())
        );
    }

    // JOB-009: 공고 상태 변경 (CLIENT 본인만 가능).
    @Operation(summary = "공고 상태 변경", description = "본인 공고의 상태를 변경합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/{id}/status")
    public ApiResponse<JobPostingResponse> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody JobPostingStatusUpdateRequest request) {
        return ApiResponse.ok("공고 상태 변경 성공", jobPostingService.updateJobPostingStatus(id, securityUser.getId(), request));
    }

    // JOB-006~008: 역할에 따라 공고 상세 반환 (MODEL → 모델 뷰, CLIENT → 클라이언트 뷰, 그 외 → OTHER 뷰).
    @Operation(summary = "공고 상세 조회", description = "조회자 역할(MODEL/CLIENT/그 외)에 따라 맞춤 공고 상세를 반환합니다.")
    @GetMapping("/{id}")
    public ApiResponse<JobPostingDetailResponse> getJobPostingDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        ViewerType viewerType = securityUser == null ? ViewerType.OTHER : switch (securityUser.getRole()) {
            case "MODEL" -> ViewerType.MODEL;
            case "CLIENT" -> ViewerType.CLIENT;
            default -> ViewerType.OTHER;
        };
        return ApiResponse.ok("공고 상세 조회 성공", jobPostingService.getJobPostingDetail(id, viewerType));
    }

    // MATCH-006: 작성한 공고 목록 (의뢰인)
    @Operation(summary = "작성한 공고 목록 조회", description = "본인이 작성한 전체 공고 목록을 조회합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @GetMapping("/my")
    public ApiResponse<List<MyJobPostingResponse>> getMyJobPostings(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return ApiResponse.ok(
                "작성한 공고 목록 조회 성공",
                jobPostingService.getMyJobPostings(securityUser.getId())
        );
    }
}
