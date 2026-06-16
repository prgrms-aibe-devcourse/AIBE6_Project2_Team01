package com.modle.domain.message.dto.request;

import jakarta.validation.constraints.NotNull;

public record CreateConversationRequest(
        @NotNull(message = "대화 상대 ID는 필수입니다.")
        Long receiverId,

        Long postId,

        Long applicationId
) {
}
