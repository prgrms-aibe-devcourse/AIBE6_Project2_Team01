package com.modle.domain.message.exception;

public class MessageAccessDeniedException extends RuntimeException {

    public MessageAccessDeniedException() {
        super("해당 쪽지를 읽음 처리할 권한이 없습니다.");
    }
}
