package com.modle.domain.message.exception;

public class InvalidParentMessageException extends RuntimeException {

    public InvalidParentMessageException() {
        super("답신 대상 쪽지가 현재 대화에 속하지 않습니다.");
    }
}
