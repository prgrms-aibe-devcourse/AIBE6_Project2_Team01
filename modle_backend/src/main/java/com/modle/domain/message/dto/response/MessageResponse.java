package com.modle.domain.message.dto.response;

import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.SenderType;

import java.time.OffsetDateTime;

public record MessageResponse(
        Long id,
        Long senderId,
        Long receiverId,
        Long applicationId,
        Long postId,
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
                message.getSenderId(),
                message.getReceiverId(),
                message.getApplicationId(),
                message.getPostId(),
                message.getParentMessageId(),
                message.getContent(),
                message.getSenderType(),
                message.isRead(),
                message.getReadAt(),
                message.getCreatedAt()
        );
    }
}
