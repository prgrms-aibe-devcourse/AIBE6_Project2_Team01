package com.modle.domain.contract.controller;

import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.request.ContractPdfCreateRequest;
import com.modle.domain.contract.dto.response.ContractPdfResponse;
import com.modle.domain.contract.dto.response.ContractResponse;
import com.modle.domain.contract.dto.response.ContractTemplateResponse;
import com.modle.domain.contract.service.ContractService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
            @Valid @RequestBody ContractPdfCreateRequest request
    ) {
        return ApiResponse.ok(
                "계약서 PDF 생성 성공",
                contractService.generatePdf(securityUser.getId(), request)
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

}
