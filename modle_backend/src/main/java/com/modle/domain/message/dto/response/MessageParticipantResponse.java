package com.modle.domain.message.dto.response;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;

public record MessageParticipantResponse(
        Long id,
        String name,
        Role role,
        String profileImageUrl
) {

    public static MessageParticipantResponse from(User user) {
        return switch (user.getRole()) {
            case MODEL -> new MessageParticipantResponse(
                    user.getId(),
                    user.getModel().getName(),
                    user.getRole(),
                    user.getModel().getProfileImageUrl()
            );
            case CLIENT -> new MessageParticipantResponse(
                    user.getId(),
                    user.getClient().getCompanyName(),
                    user.getRole(),
                    user.getClient().getProfileImageUrl()
            );
            case ADMIN -> new MessageParticipantResponse(
                    user.getId(),
                    "관리자",
                    user.getRole(),
                    null
            );
        };
    }
}
