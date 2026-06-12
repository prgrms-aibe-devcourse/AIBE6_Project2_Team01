package com.modle.domain.user.dto.response;

import com.modle.domain.user.dto.UserDto;
import org.springframework.lang.NonNull;

public record LoginResponse(
        @NonNull UserDto item
) {
}
