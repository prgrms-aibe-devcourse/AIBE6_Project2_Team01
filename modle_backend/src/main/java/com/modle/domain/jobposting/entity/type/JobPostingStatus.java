package com.modle.domain.jobposting.entity.type;

import java.util.Set;

public enum JobPostingStatus {
    RECRUITING, // 모집 중
    SHOOTING,   // 촬영 중
    COMPLETED,  // 완료
    CANCELLED,  // 취소
    ON_HOLD,    // 보류
    CLOSED;     // 마감

    public String getDisplayName() {
        return switch (this) {
            case RECRUITING -> "모집 중";
            case SHOOTING   -> "촬영 중";
            case COMPLETED  -> "완료";
            case CANCELLED  -> "취소";
            case ON_HOLD    -> "보류";
            case CLOSED     -> "마감";
        };
    }

    public boolean canTransitionTo(JobPostingStatus next) {
        return switch (this) {
            case RECRUITING -> Set.of(SHOOTING, CANCELLED, ON_HOLD, CLOSED).contains(next);
            case SHOOTING   -> Set.of(CANCELLED, ON_HOLD).contains(next);
            case ON_HOLD    -> Set.of(RECRUITING, CANCELLED, CLOSED, SHOOTING).contains(next);
            default         -> false;
        };
    }
}
