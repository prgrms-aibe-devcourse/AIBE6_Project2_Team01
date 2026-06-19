package com.modle.domain.application.entity.type;

public enum ApplicationStatus {
    APPLIED,               // 지원 완료
    CONTACTED,             // 컨택 완료
    CONTRACT_SENT,         // 계약서 발송
    SHOOTING,              // 촬영 진행
    SHOOTING_CANCELLED,    // 촬영 취소
    ON_HOLD,               // 보류
    COMPLETED,             // 완료
    REJECTED,              // 거절
    APPLICATION_CANCELLED  // 지원 취소 (모델이 직접 취소)
}
