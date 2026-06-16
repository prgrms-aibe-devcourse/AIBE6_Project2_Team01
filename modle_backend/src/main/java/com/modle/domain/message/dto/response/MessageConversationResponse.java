package com.modle.domain.message.dto.response;

import com.modle.domain.message.entity.MessageConversation;

import java.time.LocalDateTime;

public record MessageConversationResponse(
        Long id,
        Long clientId,
        Long modelId,
        Long postId,
        Long applicationId,
        LocalDateTime createdAt
) {
    public static MessageConversationResponse from(MessageConversation conversation) {
        return new MessageConversationResponse(
                conversation.getId(),
                conversation.getClientId(),
                conversation.getModelId(),
                conversation.getPostId(),
                conversation.getApplicationId(),
                conversation.getCreatedDate()
        );
    }
}
