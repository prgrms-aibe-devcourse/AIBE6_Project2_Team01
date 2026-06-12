package com.modle.domain.jobposting.exception;

import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;

public class JobPostingNotFoundException extends CustomException {

    public JobPostingNotFoundException(Long jobPostingId) {
        super(ErrorCode.JOB_POSTING_NOT_FOUND);
    }
}
