package com.modle.domain.message.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotNull(message = "수신자 ID는 필수입니다.")
        Long receiverId,

        Long applicationId,

        Long postId,

        Long parentMessageId,

        @NotBlank(message = "쪽지 내용은 필수입니다.")
        @Size(max = 2000, message = "쪽지 내용은 2,000자를 초과할 수 없습니다.")
        String content
) {
}
