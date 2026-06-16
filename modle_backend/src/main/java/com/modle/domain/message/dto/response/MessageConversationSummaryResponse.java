package com.modle.domain.message.dto.response;

import com.modle.domain.message.entity.MessageConversation;

import java.time.LocalDateTime;

public record MessageConversationSummaryResponse(
        Long id,
        Long clientId,
        Long modelId,
        Long postId,
        Long applicationId,
        MessageParticipantResponse participant,
        MessageResponse latestMessage,
        long unreadCount,
        LocalDateTime createdAt
) {
    public static MessageConversationSummaryResponse from(
            MessageConversation conversation,
            MessageParticipantResponse participant,
            MessageResponse latestMessage,
            long unreadCount
    ) {
        return new MessageConversationSummaryResponse(
                conversation.getId(),
                conversation.getClientId(),
                conversation.getModelId(),
                conversation.getPostId(),
                conversation.getApplicationId(),
                participant,
                latestMessage,
                unreadCount,
                conversation.getCreatedDate()
        );
    }
}
