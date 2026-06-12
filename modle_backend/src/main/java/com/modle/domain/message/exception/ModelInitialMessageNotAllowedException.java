package com.modle.domain.message.exception;

public class ModelInitialMessageNotAllowedException extends RuntimeException {

    public ModelInitialMessageNotAllowedException() {
        super("모델은 받은 쪽지에만 답신할 수 있습니다.");
    }
}
