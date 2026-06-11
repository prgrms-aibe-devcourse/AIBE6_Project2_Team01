package com.modle.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 인증
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "409-1", "이미 사용 중인 이메일입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "401-1", "비밀번호가 일치하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "404-1", "존재하지 않는 계정입니다."),
    USER_NOT_ACTIVE(HttpStatus.FORBIDDEN, "403-1", "승인 대기 중이거나 이용이 제한된 계정입니다."),
    USER_REJECTED(HttpStatus.FORBIDDEN, "403-2", "가입이 반려된 계정입니다."),

    // 이메일 인증
    EMAIL_CODE_NOT_FOUND(HttpStatus.BAD_REQUEST, "400-1", "인증 코드가 만료되었거나 존재하지 않습니다."),
    EMAIL_CODE_INVALID(HttpStatus.BAD_REQUEST, "400-2", "인증 코드가 올바르지 않습니다."),

    // JWT
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "401-2", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "401-3", "만료된 토큰입니다."),
    TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "401-4", "토큰이 없습니다.");

    private final HttpStatus status;
    private final String resultCode;
    private final String message;
}
