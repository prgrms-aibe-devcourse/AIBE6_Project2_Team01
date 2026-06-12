package com.modle.domain.jobposting.exception;

import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;

public class JobPostingNotEditableException extends CustomException {

    public JobPostingNotEditableException(Long jobPostingId, JobPostingStatus currentStatus) {
        super(ErrorCode.JOB_POSTING_NOT_EDITABLE);
    }
}
