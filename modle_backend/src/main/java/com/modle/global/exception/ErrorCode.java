package com.modle.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 인증
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "409-1", "이미 사용 중인 이메일입니다."),
    OAUTH_EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "409-4", "이미 다른 방식으로 가입된 이메일입니다. 기존 로그인 방식을 이용해주세요."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "401-1", "비밀번호가 일치하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "404-1", "존재하지 않는 계정입니다."),
    USER_PENDING(HttpStatus.FORBIDDEN, "403-0", "가입 승인 대기 중인 계정입니다."),
    USER_SUSPENDED(HttpStatus.FORBIDDEN, "403-1", "정지된 계정입니다."),
    USER_WITHDRAWN(HttpStatus.FORBIDDEN, "403-2", "탈퇴한 계정입니다."),
    USER_REJECTED(HttpStatus.FORBIDDEN, "403-3", "가입이 반려된 계정입니다."),

    // 이메일 인증
    EMAIL_CODE_NOT_FOUND(HttpStatus.BAD_REQUEST, "400-1", "인증 코드가 만료되었거나 존재하지 않습니다."),
    EMAIL_CODE_INVALID(HttpStatus.BAD_REQUEST, "400-2", "인증 코드가 올바르지 않습니다."),
    INVALID_STATUS_CHANGE(HttpStatus.BAD_REQUEST, "400-3", "유효하지 않은 상태 변경입니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "403-4", "이메일 인증이 완료되지 않았습니다."),

    // 입력값 검증
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "400-5", "필수 입력값이 누락되었습니다."),

    // JWT
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "401-2", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "401-3", "만료된 토큰입니다."),
    TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "401-4", "토큰이 없습니다."),

    //계약
    CONTRACT_ALREADY_EXISTS(HttpStatus.CONFLICT, "409-2", "이미 해당 지원 ID로 계약이 존재합니다."),
    INVALID_CONTRACT_SHOOT_TIME(HttpStatus.BAD_REQUEST, "400-5", "촬영 종료 시간은 촬영 시작 시간 이후여야 합니다."),

    // 공고
    JOB_POSTING_NOT_FOUND(HttpStatus.NOT_FOUND, "404-2", "공고를 찾을 수 없습니다."),
    JOB_POSTING_NOT_EDITABLE(HttpStatus.CONFLICT, "409-3", "모집 중 상태에서만 수정/삭제할 수 있습니다."),
    JOB_POSTING_FORBIDDEN(HttpStatus.FORBIDDEN, "403-5", "공고에 대한 권한이 없습니다."),

    // 잘못된 접근
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "403-6", "권한이 없습니다."),
    DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "404-3", "존재하지 않는 데이터에 접근했습니다.");

    private final HttpStatus status;
    private final String resultCode;
    private final String message;
}
