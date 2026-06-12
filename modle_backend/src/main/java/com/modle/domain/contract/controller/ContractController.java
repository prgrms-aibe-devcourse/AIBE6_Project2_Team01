package com.modle.domain.contract.controller;

import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.response.ContractResponse;
import com.modle.domain.contract.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "ApiV1ContractController", description = "계약서 API 컨트롤러")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/contracts")
public class ContractController {
    private final ContractService contractService;

    @Operation(summary = "계약서 임시 저장", description = "계약 조건을 입력받아 DRAFT 상태의 계약서를 생성합니다.")
    @PostMapping
    public ResponseEntity<ContractResponse> createContract(
            @Valid @RequestBody ContractCreateRequest request
    ) {
        ContractResponse response = contractService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }
}
