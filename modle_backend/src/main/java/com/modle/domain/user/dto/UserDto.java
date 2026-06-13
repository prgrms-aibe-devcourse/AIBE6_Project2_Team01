package com.modle.domain.user.dto;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.UserStatus;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;

public record UserDto(
        @NonNull long id,
        @NonNull LocalDateTime createDate,
        @NonNull LocalDateTime modifyDate,
        Role role,
        UserStatus status
        ) {
    public UserDto(User user) {
        this(
                user.getId(),
                user.getCreatedDate(),
                user.getModifiedDate(),
                user.getRole(),
                user.getStatus()
        );
    }
}
