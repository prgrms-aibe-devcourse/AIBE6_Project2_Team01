package com.modle.domain.message.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record ConversationMessagesResponse(
        List<MessageResponse> content,
        long totalElements,
        boolean hasNext
) {
    public static ConversationMessagesResponse from(Page<MessageResponse> page) {
        return new ConversationMessagesResponse(
                page.getContent(),
                page.getTotalElements(),
                page.hasNext()
        );
    }
}
