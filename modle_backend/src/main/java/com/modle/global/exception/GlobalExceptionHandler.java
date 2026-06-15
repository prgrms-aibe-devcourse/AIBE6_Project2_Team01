package com.modle.global.exception;

import com.modle.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // 커스텀 예외 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handle(CustomException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(errorCode.getResultCode(), errorCode.getMessage()));
    }

    // @Valid 검증 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handle(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.fail("400-4", message));
    }

    // 요청 본문 파싱 실패 (JSON 형식 오류)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handle(HttpMessageNotReadableException e) {
        return new ResponseEntity<>(
                ApiResponse.fail("400-2", "요청 본문 형식이 올바르지 않습니다."),
                BAD_REQUEST
        );
    }

    // 존재하지 않는 데이터 접근
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiResponse<Void>> handle(NoSuchElementException e) {
        return new ResponseEntity<>(
                ApiResponse.fail(ErrorCode.DATA_NOT_FOUND.getResultCode(), ErrorCode.DATA_NOT_FOUND.getMessage()),
                NOT_FOUND
        );
    }

    // 메서드 레벨 권한 부족 (@PreAuthorize 실패)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handle(AccessDeniedException e) {
        return ResponseEntity
                .status(ErrorCode.ACCESS_DENIED.getStatus())
                .body(ApiResponse.fail(ErrorCode.ACCESS_DENIED.getResultCode(), ErrorCode.ACCESS_DENIED.getMessage()));
    }

    // 그 외 예외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handle(Exception e) {
        return new ResponseEntity<>(
                ApiResponse.fail("500-1", "서버 오류가 발생했습니다."),
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
