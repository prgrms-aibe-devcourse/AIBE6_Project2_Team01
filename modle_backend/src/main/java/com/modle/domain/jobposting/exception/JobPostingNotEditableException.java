package com.modle.domain.jobposting.exception;

import com.modle.domain.jobposting.entity.JobPostingStatus;

public class JobPostingNotEditableException extends RuntimeException {

    public JobPostingNotEditableException(Long jobPostingId, JobPostingStatus currentStatus) {
        super("모집 중 상태에서만 수정/삭제할 수 있습니다. id=" + jobPostingId + ", 현재 상태=" + currentStatus);
    }
}
