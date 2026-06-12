package com.modle.domain.message.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.modle.domain.message")
public class MessageExceptionHandler {

    @ExceptionHandler(MessageNotFoundException.class)
    public ResponseEntity<MessageErrorResponse> handleNotFound(MessageNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageErrorResponse("MSG_001_NOT_FOUND", exception.getMessage()));
    }

    @ExceptionHandler({
            MessageAccessDeniedException.class,
            ModelInitialMessageNotAllowedException.class
    })
    public ResponseEntity<MessageErrorResponse> handleAccessDenied(
            RuntimeException exception
    ) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageErrorResponse("MSG_002_ACCESS_DENIED", exception.getMessage()));
    }

    @ExceptionHandler({
            SelfMessageNotAllowedException.class,
            InvalidParentMessageException.class
    })
    public ResponseEntity<MessageErrorResponse> handleBadRequest(RuntimeException exception) {
        return ResponseEntity.badRequest()
                .body(new MessageErrorResponse("MSG_003_INVALID_REQUEST", exception.getMessage()));
    }

    public record MessageErrorResponse(String code, String message) {
    }
}
