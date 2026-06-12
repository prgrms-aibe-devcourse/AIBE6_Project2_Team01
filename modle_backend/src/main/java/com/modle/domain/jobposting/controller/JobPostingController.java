package com.modle.domain.jobposting.controller;

import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.JobPostingTemplateResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/jobs")
public class JobPostingController {

    private final JobPostingService jobPostingService;

    // JOB-001: 카테고리별 공고 템플릿 목록 반환.
    // TODO(인증): 역할 제한은 시트의 JOB-001 역할 컬럼 확인 후 @PreAuthorize 적용
    @GetMapping("/templates")
    public ApiResponse<List<JobPostingTemplateResponse>> getTemplates(@RequestParam String category) {
        return ApiResponse.ok("공고 템플릿 목록 조회 성공", jobPostingService.getTemplatesByCategory(category));
    }

    // JOB-002: 공고 등록(상태=모집 중) 후 AI 모델 추천 트리거.
    // TODO(인증): @PreAuthorize("hasRole('CLIENT')") 적용
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<JobPostingResponse> create(
            // TODO(인증) 임시: @AuthenticationPrincipal에서 사용자 추출로 교체
            @RequestParam Long userId,
            @Valid @RequestBody JobPostingCreateRequest request) {
        return ApiResponse.ok("공고 등록 성공", jobPostingService.createJobPosting(userId, request));
    }

    // JOB-003: 공고 수정 (모집 중 상태에서만 가능).
    // TODO(인증): @PreAuthorize("hasRole('CLIENT')") 적용
    @PatchMapping("/{id}")
    public ApiResponse<JobPostingResponse> update(
            @PathVariable Long id,
            // TODO(인증) 임시: @AuthenticationPrincipal에서 사용자 추출로 교체
            @RequestParam Long userId,
            @Valid @RequestBody JobPostingUpdateRequest request) {
        return ApiResponse.ok("공고 수정 성공", jobPostingService.updateJobPosting(id, userId, request));
    }

    // JOB-004: 공고 삭제 (모집 중 상태에서만 가능).
    // TODO(인증): @PreAuthorize("hasRole('CLIENT')") 적용
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            // TODO(인증) 임시: @AuthenticationPrincipal에서 사용자 추출로 교체
            @RequestParam Long userId) {
        jobPostingService.deleteJobPosting(id, userId);
        return ApiResponse.ok("공고 삭제 성공");
    }
}
