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
    PASSWORD_RESET_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "400-9", "이메일 인증이 필요합니다."),
    EMAIL_CODE_ATTEMPTS_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "429-1", "인증 코드 입력 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요."),

    // 입력값 검증
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "400-5", "필수 입력값이 누락되었습니다."),

    // JWT
    UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "403-7", "접근 권한이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "401-2", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "401-3", "만료된 토큰입니다."),
    TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "401-4", "토큰이 없습니다."),

    //계약
    CONTRACT_ALREADY_EXISTS(HttpStatus.CONFLICT, "409-2", "이미 해당 지원 ID로 계약이 존재합니다."),
    INVALID_CONTRACT_SHOOT_TIME(HttpStatus.BAD_REQUEST, "400-5", "촬영 종료 시간은 촬영 시작 시간 이후여야 합니다."),
    INVALID_FILE_CONTRACT(HttpStatus.BAD_REQUEST, "400-6", "파일 첨부 방식 계약은 업로드된 계약서 정보가 필요합니다."),
    INVALID_CONTRACT_PAYMENT(HttpStatus.BAD_REQUEST, "400-7", "계약 보수 값이 보수 유형과 맞지 않습니다."),
    INVALID_CONTRACT_STATUS(HttpStatus.BAD_REQUEST, "400-10", "DRAFT 상태의 계약서만 PDF 생성이 가능합니다."),
    CONTRACT_NOT_FOUND(HttpStatus.NOT_FOUND, "404-4", "계약서를 찾을 수 없습니다."),
    CONTRACT_TEMPLATE_NOT_FOUND(HttpStatus.NOT_FOUND, "404-5", "계약서 템플릿을 찾을 수 없습니다."),
    CONTRACT_PDF_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "500-2", "계약서 PDF 생성에 실패했습니다."),

    // 공고
    JOB_POSTING_NOT_FOUND(HttpStatus.NOT_FOUND, "404-2", "공고를 찾을 수 없습니다."),
    JOB_POSTING_NOT_EDITABLE(HttpStatus.CONFLICT, "409-3", "모집 중 상태에서만 수정/삭제할 수 있습니다."),
    JOB_POSTING_FORBIDDEN(HttpStatus.FORBIDDEN, "403-5", "공고에 대한 권한이 없습니다."),
    JOB_POSTING_INVALID_FILTER_VALUE(HttpStatus.BAD_REQUEST, "400-8", "유효하지 않은 필터 값입니다."),
    JOB_POSTING_INVALID_STATUS_TRANSITION(HttpStatus.BAD_REQUEST, "400-9", "유효하지 않은 상태 전환입니다."),

    // 쪽지
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "MSG-001", "쪽지를 찾을 수 없습니다."),
    MESSAGE_CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, "MSG-002", "대화방을 찾을 수 없습니다."),
    MESSAGE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "MSG-003", "대화방에 접근할 권한이 없습니다."),
    MESSAGE_CONVERSATION_CREATE_FORBIDDEN(HttpStatus.FORBIDDEN, "MSG-004", "클라이언트만 모델과 대화를 시작할 수 있습니다."),
    MESSAGE_MODEL_INITIAL_SEND_NOT_ALLOWED(HttpStatus.FORBIDDEN, "MSG-005", "모델은 받은 쪽지에만 답신할 수 있습니다."),
    MESSAGE_SELF_SEND_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "MSG-006", "자기 자신과 대화방을 만들 수 없습니다."),
    MESSAGE_INVALID_PARENT(HttpStatus.BAD_REQUEST, "MSG-007", "답신 대상 쪽지가 현재 대화방에 속하지 않습니다."),
    MESSAGE_POST_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "MSG-008", "선택한 공고를 대화에 연결할 수 없습니다."),

    // 신고
    REPORT_TARGET_NOT_FOUND(HttpStatus.NOT_FOUND, "404-4", "신고 대상이 존재하지 않습니다."),
    REPORT_ALREADY_EXISTS(HttpStatus.CONFLICT, "409-5", "이미 신고한 대상입니다."),
    REPORT_SELF_NOT_ALLOWED(HttpStatus.FORBIDDEN, "403-8", "자신을 신고할 수 없습니다."),
    REPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "404-5", "신고 내역을 찾을 수 없습니다."),
    REPORT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "403-9", "해당 콘텐츠에 대한 신고 권한이 없습니다."),

    // 지원
    APPLICATION_JOB_NOT_RECRUITING(HttpStatus.BAD_REQUEST, "400-11", "모집 중인 공고에만 지원할 수 있습니다."),
    APPLICATION_ALREADY_EXISTS(HttpStatus.CONFLICT, "409-6", "이미 지원한 공고입니다."),

    // 잘못된 접근
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "403-6", "권한이 없습니다."),
    DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "404-3", "존재하지 않는 데이터에 접근했습니다.");


    private final HttpStatus status;
    private final String resultCode;
    private final String message;
}
