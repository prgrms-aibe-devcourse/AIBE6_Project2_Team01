package com.modle.domain.user.entity.type;

public enum UserStatus {
    PENDING,    // 의뢰인 승인 대기
    ACTIVE,     // 정상 활동 (모델 가입 시 기본값)
    SUSPENDED,  // 정지 (노쇼·신고 누적)
    WITHDRAWN,  // 탈퇴
    REJECTED    // 의뢰인 가입 거절
}
