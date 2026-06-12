package com.modle.domain.jobposting.controller;

import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.JobPostingListResponse;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.JobPostingTemplateResponse;
import com.modle.domain.jobposting.entity.ViewerType;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/jobs")
public class JobPostingController {

    private final JobPostingService jobPostingService;

    // JOB-001: 카테고리별 공고 템플릿 목록 반환.
    @GetMapping("/templates")
    public ApiResponse<List<JobPostingTemplateResponse>> getTemplates(@RequestParam String category) {
        return ApiResponse.ok("공고 템플릿 목록 조회 성공", jobPostingService.getTemplatesByCategory(category));
    }

    // JOB-002: 공고 등록(상태=모집 중) 후 AI 모델 추천 트리거.
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping
    public ApiResponse<JobPostingResponse> create(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody JobPostingCreateRequest request) {
        return ApiResponse.ok("공고 등록 성공", jobPostingService.createJobPosting(securityUser.getId(), request));
    }

    // JOB-003: 공고 수정 (모집 중 상태에서만 가능).
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/{id}")
    public ApiResponse<JobPostingResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody JobPostingUpdateRequest request) {
        return ApiResponse.ok("공고 수정 성공", jobPostingService.updateJobPosting(id, securityUser.getId(), request));
    }

    // JOB-004: 공고 삭제 (모집 중 상태에서만 가능).
    @PreAuthorize("hasRole('CLIENT')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        jobPostingService.deleteJobPosting(id, securityUser.getId());
        return ApiResponse.ok("공고 삭제 성공");
    }

    // JOB-005: 지역·카테고리 필터를 적용한 공고 목록 반환.
    @GetMapping
    public ApiResponse<Page<JobPostingListResponse>> getJobPostings(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "createDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok("공고 목록 조회 성공", jobPostingService.getJobPostings(region, category, pageable));
    }

    // JOB-006~008: 역할에 따라 공고 상세 반환 (MODEL → 모델 뷰, CLIENT → 클라이언트 뷰, 그 외 → OTHER 뷰).
    @GetMapping("/{id}")
    public ApiResponse<Object> getJobPostingDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        ViewerType viewerType = switch (securityUser.getRole()) {
            case "MODEL" -> ViewerType.MODEL;
            case "CLIENT" -> ViewerType.CLIENT;
            default -> ViewerType.OTHER;
        };
        return ApiResponse.ok("공고 상세 조회 성공", jobPostingService.getJobPostingDetail(id, viewerType));
    }
}
