package com.modle.domain.message.exception;

public class SelfMessageNotAllowedException extends RuntimeException {

    public SelfMessageNotAllowedException() {
        super("자기 자신에게 쪽지를 보낼 수 없습니다.");
    }
}
