package com.modle.domain.contract.dto.request;

import com.modle.domain.contract.entity.ContractType;
import com.modle.domain.contract.entity.PayType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// TODO: GlobalExceptionHandler 도입 시 validation 에러 메시지 포맷 통일
@Schema(description = "계약서 생성 요청")
public record ContractCreateRequest(

        @NotNull(message = "지원 ID는 필수입니다.")
        @Positive(message = "지원 ID는 양수여야 합니다.")
        Long applicationId,

        @NotNull(message = "계약서 유형은 필수입니다.")
        ContractType contractType,

        @NotNull(message = "촬영 시작 시간은 필수입니다.")
        LocalDateTime shootStartAt,

        @NotNull(message = "촬영 종료 시간은 필수입니다.")
        LocalDateTime shootEndAt,

        @NotBlank(message = "촬영 장소는 필수입니다.")
        String location,

        @NotNull(message = "보수 금액은 필수입니다.")
        @DecimalMin(value = "0.0", inclusive = true, message = "보수 금액은 0 이상이어야 합니다.")
        BigDecimal payment,

        @NotNull(message = "보수 유형은 필수입니다.")
        PayType payType,

        @NotBlank(message = "사용 범위는 필수입니다.")
        String usageScope,

        String memo,

        String pdfUrl
) {
}