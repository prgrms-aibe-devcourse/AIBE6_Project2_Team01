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
    USER_PENDING(HttpStatus.FORBIDDEN, "403-0", "가입 승인 대기 중인 계정입니다."),
    USER_SUSPENDED(HttpStatus.FORBIDDEN, "403-1", "정지된 계정입니다."),
    USER_WITHDRAWN(HttpStatus.FORBIDDEN, "403-2", "탈퇴한 계정입니다."),
    USER_REJECTED(HttpStatus.FORBIDDEN, "403-3", "가입이 반려된 계정입니다."),

    // 이메일 인증
    EMAIL_CODE_NOT_FOUND(HttpStatus.BAD_REQUEST, "400-1", "인증 코드가 만료되었거나 존재하지 않습니다."),
    EMAIL_CODE_INVALID(HttpStatus.BAD_REQUEST, "400-2", "인증 코드가 올바르지 않습니다."),
    INVALID_STATUS_CHANGE(HttpStatus.BAD_REQUEST, "400-3", "유효하지 않은 상태 변경입니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "403-4", "이메일 인증이 완료되지 않았습니다."),

    // JWT
    UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "403-7", "접근 권한이 없습니다."),
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

    // 쪽지
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "MSG-001", "쪽지를 찾을 수 없습니다."),
    MESSAGE_CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, "MSG-002", "대화방을 찾을 수 없습니다."),
    MESSAGE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "MSG-003", "대화방에 접근할 권한이 없습니다."),
    MESSAGE_CONVERSATION_CREATE_FORBIDDEN(HttpStatus.FORBIDDEN, "MSG-004", "클라이언트만 모델과 대화를 시작할 수 있습니다."),
    MESSAGE_MODEL_INITIAL_SEND_NOT_ALLOWED(HttpStatus.FORBIDDEN, "MSG-005", "모델은 받은 쪽지에만 답신할 수 있습니다."),
    MESSAGE_SELF_SEND_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "MSG-006", "자기 자신과 대화방을 만들 수 없습니다."),
    MESSAGE_INVALID_PARENT(HttpStatus.BAD_REQUEST, "MSG-007", "답신 대상 쪽지가 현재 대화방에 속하지 않습니다."),
    MESSAGE_POST_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "MSG-008", "선택한 공고를 대화에 연결할 수 없습니다.");

    private final HttpStatus status;
    private final String resultCode;
    private final String message;
}
