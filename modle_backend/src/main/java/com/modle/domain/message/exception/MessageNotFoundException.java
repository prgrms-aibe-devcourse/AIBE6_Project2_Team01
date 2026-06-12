package com.modle.domain.message.exception;

public class MessageNotFoundException extends RuntimeException {

    public MessageNotFoundException(Long messageId) {
        super("쪽지를 찾을 수 없습니다. messageId=" + messageId);
    }
}
