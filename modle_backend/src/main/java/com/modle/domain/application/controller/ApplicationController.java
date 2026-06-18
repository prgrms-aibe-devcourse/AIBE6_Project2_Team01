package com.modle.domain.application.controller;

import com.modle.domain.application.dto.request.ApplicationCreateRequest;
import com.modle.domain.application.dto.response.ApplicantResponse;
import com.modle.domain.application.dto.response.ApplicationResponse;
import com.modle.domain.application.dto.response.ContactResponse;
import com.modle.domain.application.dto.response.MyApplicationResponse;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.contract.dto.response.ContractStatusResponse;
import com.modle.domain.contract.service.ContractService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ContractService contractService;

    // MATCH-001: 모델이 모집 중인 공고에 지원한다 (MODEL 전용).
    @PreAuthorize("hasRole('MODEL')")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/jobs/{id}/apply")
    public ApiResponse<ApplicationResponse> apply(
            @PathVariable Long id,
            @RequestBody(required = false) ApplicationCreateRequest request,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("공고 지원 성공", applicationService.applyToJob(securityUser.getId(), id, request));
    }

    // MATCH-003: 모델이 특정 공고에 이미 지원했는지 확인한다 (MODEL 전용).
    @PreAuthorize("hasRole('MODEL')")
    @GetMapping("/jobs/{id}/apply-status")
    public ApiResponse<Boolean> checkApplyStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("지원 여부 조회 성공", applicationService.hasApplied(securityUser.getId(), id));
    }

    // MATCH-002: 모델이 본인의 지원을 취소한다 (MODEL 전용).
    @PreAuthorize("hasRole('MODEL')")
    @PatchMapping("/applications/{id}/cancel")
    public ApiResponse<ApplicationResponse> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("지원 취소 성공", applicationService.cancelApplication(securityUser.getId(), id));
    }

    // MATCH-004: 특정 공고의 지원자 목록 (의뢰인)
    @PreAuthorize("hasRole('CLIENT')")
    @GetMapping("/jobs/{id}/applicants")
    public ApiResponse<List<ApplicantResponse>> getApplicants(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return ApiResponse.ok(
                "지원자 목록 조회 성공",
                applicationService.getApplicants(securityUser.getId(), id)
        );
    }

    // MATCH-005: 내가 지원한 공고 목록 (모델)
    @PreAuthorize("hasRole('MODEL')")
    @GetMapping("/applications/my")
    public ApiResponse<List<MyApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return ApiResponse.ok(
                "지원한 공고 목록 조회 성공",
                applicationService.getMyApplications(securityUser.getId())
        );
    }

    // MATCH-008: 의뢰인이 지원자에게 컨택한다 (CLIENT 전용).
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/applications/{id}/contact")
    public ApiResponse<ApplicationResponse> contact(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("컨택 성공", applicationService.contact(securityUser.getId(), id));
    }

    // MATCH-009: 컨택 이력을 조회한다 (공고 작성자 또는 해당 지원의 모델만 접근 가능).
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/applications/{id}/contacts")
    public ApiResponse<List<ContactResponse>> getContacts(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("컨택 이력 조회 성공", applicationService.getContacts(securityUser.getId(), id));
    }

    // MATCH-011: 지원 건의 계약 상태를 조회한다 (의뢰인 또는 해당 지원의 모델).
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/applications/{id}/contract-status")
    public ApiResponse<ContractStatusResponse> getContractStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("계약 상태 조회 성공", contractService.getContractByApplicationId(securityUser.getId(), id));
    }

}
