package com.modle.domain.jobposting.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 글로벌 예외 핸들러 머지 시 어노테이션 제거 후 핸들러 통합
@ResponseStatus(HttpStatus.NOT_FOUND)
public class JobPostingNotFoundException extends RuntimeException {

    public JobPostingNotFoundException(Long jobPostingId) {
        super("공고를 찾을 수 없습니다. id=" + jobPostingId);
    }
}
