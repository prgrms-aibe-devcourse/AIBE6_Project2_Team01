package com.modle.domain.review.service.reportValidator;

import com.modle.domain.message.entity.Message;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageReportValidator implements ReportTargetValidator {
    private final MessageRepository messageRepository;

    @Override
    public ReportTargetType getTargetType() {
        return ReportTargetType.MESSAGE;
    }

    @Override
    public void validate(Long targetId, Long reporterId) {
        Message message = messageRepository.findById(targetId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_TARGET_NOT_FOUND));

        // 내가 보낸 메시지는 신고 불가
        if (message.getSenderId().equals(reporterId)) {
            throw new CustomException(ErrorCode.REPORT_SELF_NOT_ALLOWED);
        }

        // 수신자만 신고 가능 (발신자가 아님이 위에서 보장됨)
        if (!message.getReceiverId().equals(reporterId)) {
            throw new CustomException(ErrorCode.REPORT_ACCESS_DENIED);
        }
    }
}
