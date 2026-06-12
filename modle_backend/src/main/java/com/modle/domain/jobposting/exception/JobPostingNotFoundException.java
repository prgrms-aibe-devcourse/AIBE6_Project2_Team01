package com.modle.domain.jobposting.exception;

public class JobPostingNotFoundException extends RuntimeException {

    public JobPostingNotFoundException(Long jobPostingId) {
        super("공고를 찾을 수 없습니다. id=" + jobPostingId);
    }
}
