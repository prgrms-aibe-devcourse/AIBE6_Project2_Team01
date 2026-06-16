package com.modle.domain.message.dto.request;

import jakarta.validation.constraints.NotNull;

public record ReadConversationRequest(
        @NotNull(message = "대화방 ID는 필수입니다.")
        Long conversationId
) {
}
