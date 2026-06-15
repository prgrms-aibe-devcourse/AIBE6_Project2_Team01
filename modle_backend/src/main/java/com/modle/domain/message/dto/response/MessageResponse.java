package com.modle.domain.message.dto.response;

import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.SenderType;

import java.time.OffsetDateTime;

public record MessageResponse(
        Long id,
        Long conversationId,
        Long senderId,
        Long receiverId,
        Long parentMessageId,
        String content,
        SenderType senderType,
        boolean read,
        OffsetDateTime readAt,
        OffsetDateTime createdAt
) {

    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getReceiverId(),
                message.getParentMessageId(),
                message.getContent(),
                message.getSenderType(),
                message.isRead(),
                message.getReadAt(),
                message.getCreatedAt()
        );
    }
}
