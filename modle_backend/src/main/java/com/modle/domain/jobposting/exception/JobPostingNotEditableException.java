package com.modle.domain.jobposting.exception;

import com.modle.domain.jobposting.entity.JobPostingStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 글로벌 예외 핸들러 머지 시 어노테이션 제거 후 핸들러 통합
@ResponseStatus(HttpStatus.CONFLICT)
public class JobPostingNotEditableException extends RuntimeException {

    public JobPostingNotEditableException(Long jobPostingId, JobPostingStatus currentStatus) {
        super("모집 중 상태에서만 수정/삭제할 수 있습니다. id=" + jobPostingId + ", 현재 상태=" + currentStatus);
    }
}
