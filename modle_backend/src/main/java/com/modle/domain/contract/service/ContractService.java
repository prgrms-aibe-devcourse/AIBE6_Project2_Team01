package com.modle.domain.contract.service;

import com.modle.domain.contract.dto.request.ContractCreateRequest;
import com.modle.domain.contract.dto.response.ContractResponse;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository contractRepository;

    @Transactional
    public ContractResponse createContract(ContractCreateRequest request) {
        validateDuplicateContract(request.applicationId());
        validateShootTime(request);

        Contract contract = Contract.builder()
                .applicationId(request.applicationId())
                .contractType(request.contractType())
                .shootStartAt(request.shootStartAt())
                .shootEndAt(request.shootEndAt())
                .location(request.location())
                .payment(request.payment())
                .payType(request.payType())
                .usageScope(request.usageScope())
                .memo(request.memo())
                .pdfUrl(request.pdfUrl())
                .build();

        Contract savedContract = contractRepository.save(contract);

        return ContractResponse.from(savedContract);

    }

    private void validateDuplicateContract(Long applicationId) {
        if (contractRepository.existsByApplicationId(applicationId)) {
            throw new IllegalStateException("이미 해당 지원 ID로 계약이 존재합니다.");
        }

    }

    private void validateShootTime(ContractCreateRequest request) {
        if (!request.shootEndAt().isAfter(request.shootStartAt())) {
            throw new IllegalArgumentException("촬영 종료 시간은 촬영 시작 시간 이후여야 합니다.");
        }
    }
}
