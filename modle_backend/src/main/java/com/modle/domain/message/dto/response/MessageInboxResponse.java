package com.modle.domain.message.dto.response;

import java.util.List;

public record MessageInboxResponse(
        MessageParticipantResponse currentUser,
        List<MessageConversationSummaryResponse> conversations
) {
}
