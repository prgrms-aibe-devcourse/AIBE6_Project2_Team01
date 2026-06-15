package com.modle.domain.jobposting.entity;

import java.util.Set;

public enum JobPostingStatus {
    RECRUITING, // 모집 중
    SHOOTING,   // 촬영 중
    COMPLETED,  // 완료
    CANCELLED,  // 취소
    ON_HOLD,    // 보류
    CLOSED;     // 마감

    public boolean canTransitionTo(JobPostingStatus next) {
        return switch (this) {
            case RECRUITING -> Set.of(SHOOTING, CANCELLED, ON_HOLD, CLOSED).contains(next);
            case SHOOTING   -> Set.of(COMPLETED, CANCELLED, ON_HOLD).contains(next);
            default         -> false;
        };
    }
}
