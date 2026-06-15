package com.modle.domain.message.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record MessagePageResponse(
        MessageParticipantResponse currentUser,
        List<MessageParticipantResponse> participants,
        List<MessageConversationResponse> conversations,
        List<MessageResponse> content,
        long totalElements,
        boolean hasNext
) {

    public static MessagePageResponse from(
            MessageParticipantResponse currentUser,
            List<MessageParticipantResponse> participants,
            List<MessageConversationResponse> conversations,
            Page<MessageResponse> page
    ) {
        return new MessagePageResponse(
                currentUser,
                participants,
                conversations,
                page.getContent(),
                page.getTotalElements(),
                page.hasNext()
        );
    }
}
