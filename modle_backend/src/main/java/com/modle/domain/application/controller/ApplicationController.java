package com.modle.domain.application.controller;

import com.modle.domain.application.dto.request.ApplicationCreateRequest;
import com.modle.domain.application.dto.request.CancelShootingRequest;
import com.modle.domain.application.dto.request.HoldRequest;
import com.modle.domain.application.dto.response.ApplicantResponse;
import com.modle.domain.application.dto.response.ApplicationResponse;
import com.modle.domain.application.dto.response.ContactResponse;
import com.modle.domain.application.dto.response.MyApplicationResponse;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.contract.dto.response.ContractDraftResponse;
import com.modle.domain.contract.dto.response.ContractStatusResponse;
import com.modle.domain.contract.service.ContractService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
@Tag(name = "지원/매칭", description = "공고 지원·컨택·촬영 진행 등 매칭 API")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ContractService contractService;

    // MATCH-001: 모델이 모집 중인 공고에 지원한다 (MODEL 전용).
    @Operation(summary = "공고 지원", description = "모집 중인 공고에 지원합니다. (MODEL 전용)")
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
    @Operation(summary = "지원 여부 확인", description = "특정 공고에 이미 지원했는지 여부를 조회합니다. (MODEL 전용)")
    @PreAuthorize("hasRole('MODEL')")
    @GetMapping("/jobs/{id}/apply-status")
    public ApiResponse<Boolean> checkApplyStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("지원 여부 조회 성공", applicationService.hasApplied(securityUser.getId(), id));
    }

    // MATCH-002: 모델이 본인의 지원을 취소한다 (MODEL 전용).
    @Operation(summary = "지원 취소", description = "본인의 공고 지원을 취소합니다. (MODEL 전용)")
    @PreAuthorize("hasRole('MODEL')")
    @PatchMapping("/applications/{id}/cancel")
    public ApiResponse<ApplicationResponse> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("지원 취소 성공", applicationService.cancelApplication(securityUser.getId(), id));
    }

    // MATCH-004: 특정 공고의 지원자 목록 (의뢰인)
    @Operation(summary = "지원자 목록 조회", description = "본인 공고의 지원자 목록을 조회합니다. (CLIENT 전용)")
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
    @Operation(summary = "내 지원 목록 조회", description = "본인이 지원한 공고 목록을 조회합니다. (MODEL 전용)")
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
    @Operation(summary = "지원자 컨택", description = "지원자에게 컨택을 보냅니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/applications/{id}/contact")
    public ApiResponse<ApplicationResponse> contact(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("컨택 성공", applicationService.contact(securityUser.getId(), id));
    }

    // MATCH-009: 컨택 이력을 조회한다 (공고 작성자 또는 해당 지원의 모델만 접근 가능).
    @Operation(summary = "컨택 이력 조회", description = "지원 건의 컨택 이력을 조회합니다. (공고 작성자 또는 해당 모델)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/applications/{id}/contacts")
    public ApiResponse<List<ContactResponse>> getContacts(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("컨택 이력 조회 성공", applicationService.getContacts(securityUser.getId(), id));
    }

    // MATCH-011: 지원 건의 계약 상태를 조회한다 (의뢰인 또는 해당 지원의 모델).
    @Operation(summary = "계약 상태 조회", description = "지원 건의 계약 진행 상태를 조회합니다. (의뢰인 또는 해당 모델)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/applications/{id}/contract-status")
    public ApiResponse<ContractStatusResponse> getContractStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("계약 상태 조회 성공", contractService.getContractByApplicationId(securityUser.getId(), id));
    }

    // MATCH-013: 촬영 보류 (의뢰인 전용)
    @Operation(summary = "촬영 보류", description = "진행 중인 촬영을 보류 처리합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/applications/{id}/hold")
    public ApiResponse<ApplicationResponse> holdShooting(
            @PathVariable Long id,
            @RequestBody @Valid HoldRequest request,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("촬영 보류 성공", applicationService.holdShooting(securityUser.getId(), id, request));
    }

    // MATCH-012: 촬영 취소 (의뢰인 전용)
    @Operation(summary = "촬영 취소", description = "진행 중인 촬영을 취소합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/applications/{id}/cancel-shooting")
    public ApiResponse<ApplicationResponse> cancelShooting(
            @PathVariable Long id,
            @RequestBody @Valid CancelShootingRequest request,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("촬영 취소 성공", applicationService.cancelShooting(securityUser.getId(), id, request));
    }

    // MATCH-014: 촬영 재개 (의뢰인 전용)
    @Operation(summary = "촬영 재개", description = "보류된 촬영을 다시 진행합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/applications/{id}/resume")
    public ApiResponse<ApplicationResponse> resumeShooting(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("촬영 재개 성공", applicationService.resumeShooting(securityUser.getId(), id));
    }

    // re-recruit: 재모집 (의뢰인 전용)
    @Operation(summary = "재모집", description = "해당 지원 건의 공고를 다시 모집 상태로 전환합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/applications/{id}/re-recruit")
    public ApiResponse<ApplicationResponse> reRecruit(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("재모집 요청 성공", applicationService.reRecruit(securityUser.getId(), id));
    }

    @Operation(summary = "계약 임시저장 조회", description = "지원 건의 임시저장된 계약 정보를 조회합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @GetMapping("/applications/{id}/contract-draft")
    public ApiResponse<ContractDraftResponse> getContractDraft(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok(
                "계약 임시저장 조회 성공",
                contractService.getDraftContract(securityUser.getId(), id)
        );
    }

    // MATCH-016: 촬영 완료 처리 (의뢰인)
    @Operation(summary = "촬영 완료 처리", description = "촬영을 완료 상태로 처리합니다. (CLIENT 전용)")
    @PreAuthorize("hasRole('CLIENT')")
    @PatchMapping("/applications/{id}/complete")
    public ApiResponse<ApplicationResponse> complete(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok(
                "촬영 완료 처리 성공",
                applicationService.completeApplication(securityUser.getId(), id)
        );
    }
}
