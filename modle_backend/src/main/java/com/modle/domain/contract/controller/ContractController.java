package com.modle.domain.contract.controller;

import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.request.ContractPdfCreateRequest;
import com.modle.domain.contract.dto.request.ContractRejectRequest;
import com.modle.domain.contract.dto.response.ContractPdfResponse;
import com.modle.domain.contract.dto.response.ContractResponse;
import com.modle.domain.contract.dto.response.ContractTemplateResponse;
import com.modle.domain.contract.dto.response.ContractViewResponse;
import com.modle.domain.contract.service.ContractService;
import com.modle.domain.contract.entity.type.ContractListStatus;
import com.modle.domain.contract.dto.response.ContractListItemResponse;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "ApiV1ContractController", description = "계약서 API 컨트롤러")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/contracts")
public class ContractController {
    private final ContractService contractService;

    @Operation(summary = "계약서 임시 저장", description = "계약 조건을 입력받아 DRAFT 상태의 계약서를 생성합니다.")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<ContractResponse> createContract(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody ContractCreateRequest request
    ) {
        return ApiResponse.ok(
                "계약서가 임시 저장되었습니다.",
                contractService.createContract(securityUser.getId(), request)
        );
    }

    @GetMapping("/templates")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<List<ContractTemplateResponse>> getTemplates() {
        return ApiResponse.ok(
                "계약서 템플릿 목록 조회 성공",
                contractService.getTemplates()
        );
    }

    @PostMapping("/pdf")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<ContractPdfResponse> createContractPdf(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody ContractPdfCreateRequest request,
            HttpServletRequest httpServletRequest
    ) {
        return ApiResponse.ok(
                "계약서 PDF 생성 성공",
                contractService.generatePdf(
                        securityUser.getId(),
                        request,
                        httpServletRequest.getRemoteAddr()
                )
        );
    }

    @PostMapping("/{id}/notify")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<ContractResponse> notifyContract(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable Long id
    ) {
        return ApiResponse.ok(
                "계약서가 모델에게 발송되었습니다.",
                contractService.notifyContract(securityUser.getId(), id)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<ContractViewResponse> viewContract(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable Long id
    ) {
        return ApiResponse.ok(
                "계약서 열람 성공",
                contractService.viewContract(securityUser.getId(), id)
        );
    }

    @Operation(summary = "계약서 동의", description = "모델이 계약서에 동의합니다. 양측 모두 동의 시 자동 확정됩니다.")
    @PatchMapping("/{id}/agree")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<ContractResponse> agreeContract(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        return ApiResponse.ok(
                "계약서에 동의했습니다.",
                contractService.agreeContract(securityUser.getId(), id, request.getRemoteAddr())
        );
    }

    @Operation(summary = "계약서 거부", description = "모델이 계약서를 거부합니다.")
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<ContractResponse> rejectContract(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable Long id,
            @Valid @RequestBody ContractRejectRequest request
    ) {
        return ApiResponse.ok(
                "계약서를 거부했습니다.",
                contractService.rejectContract(securityUser.getId(), id, request.rejectReason())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'MODEL')")
    public ApiResponse<List<ContractListItemResponse>> getContracts(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam ContractListStatus status
    ) {
        return ApiResponse.ok(
                "계약 내역 조회 성공",
                contractService.getContracts(securityUser.getId(), securityUser.getRole(), status)
        );
    }

}
