package com.modle.domain.application.dto.response;

import java.time.LocalDateTime;

public record ContactResponse(
        Long id,
        Long senderId,
        Long receiverId,
        String content,
        Long jobPostingId,
        LocalDateTime sentAt
) {
}
