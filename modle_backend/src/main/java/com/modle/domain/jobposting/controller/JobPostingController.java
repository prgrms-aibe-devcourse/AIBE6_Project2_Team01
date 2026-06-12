package com.modle.domain.jobposting.controller;

import com.modle.domain.jobposting.dto.request.JobPostingCreateRequest;
import com.modle.domain.jobposting.dto.request.JobPostingUpdateRequest;
import com.modle.domain.jobposting.dto.response.JobPostingListResponse;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.JobPostingTemplateResponse;
import com.modle.domain.jobposting.entity.ViewerType;
import com.modle.domain.jobposting.service.JobPostingService;
// TODO(골격): 공통 응답 래퍼는 global/response 골격 머지 후 사용 가능. success 팩토리 시그니처는 골격 기준으로 정렬.
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
        return ApiResponse.success(jobPostingService.getTemplatesByCategory(category));
    }

    // JOB-002: 공고 등록(상태=모집 중) 후 AI 모델 추천 트리거.
    // TODO(인증): 인증 골격 머지 후 @PreAuthorize("hasRole('CLIENT')") 적용
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<JobPostingResponse> create(
            // TODO(인증) 임시: 인증 머지 후 @AuthenticationPrincipal에서 사용자 추출로 교체
            @RequestParam Long userId,
            @Valid @RequestBody JobPostingCreateRequest request) {
        return ApiResponse.success(jobPostingService.createJobPosting(userId, request));
    }

    // JOB-003: 공고 수정 (모집 중 상태에서만 가능).
    // TODO(인증): 인증 머지 후 @PreAuthorize("hasRole('CLIENT')") 적용
    @PatchMapping("/{id}")
    public ApiResponse<JobPostingResponse> update(
            @PathVariable Long id,
            // TODO(인증) 임시: 인증 머지 후 @AuthenticationPrincipal에서 사용자 추출로 교체
            @RequestParam Long userId,
            @Valid @RequestBody JobPostingUpdateRequest request) {
        return ApiResponse.success(jobPostingService.updateJobPosting(id, userId, request));
    }

    // JOB-004: 공고 삭제 (모집 중 상태에서만 가능).
    // TODO(인증): 인증 머지 후 @PreAuthorize("hasRole('CLIENT')") 적용
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            // TODO(인증) 임시: 인증 머지 후 @AuthenticationPrincipal에서 사용자 추출로 교체
            @RequestParam Long userId) {
        jobPostingService.deleteJobPosting(id, userId);
        return ApiResponse.success(null);
    }

    // JOB-005: 지역·카테고리 필터를 적용한 공고 목록 반환.
    // TODO(인증): 인증 머지 후 역할별 접근 제한 적용
    @GetMapping
    public ApiResponse<Page<JobPostingListResponse>> getJobPostings(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "createDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(jobPostingService.getJobPostings(region, category, pageable));
    }

    // JOB-006~008: 뷰어 타입에 따라 공고 상세 반환.
    // TODO(인증): 인증 머지 후 viewer 파라미터 제거 — JWT role + clientId로 서버 사이드 자동 결정
    @GetMapping("/{id}")
    public ApiResponse<Object> getJobPostingDetail(
            @PathVariable Long id,
            @RequestParam ViewerType viewer) {
        return ApiResponse.success(jobPostingService.getJobPostingDetail(id, viewer));
    }
}
