package com.modle.global.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.NonNull;

public record ApiResponse<T>(
        @NonNull String resultCode,
        @JsonIgnore int statusCode,
        @NonNull String msg,
        T data
) {
    public ApiResponse(String resultCode, String msg) {
        this(resultCode, msg, null);
    }

    public ApiResponse(String resultCode, String msg, T data) {
        this(resultCode, parseStatusCode(resultCode), msg, data);
    }

    public static <T> ApiResponse<T> ok(String msg, T data) {
        return new ApiResponse<>("200-1", msg, data);
    }

    public static <T> ApiResponse<T> ok(String msg) {
        return new ApiResponse<>("200-1", msg, null);
    }

    public static <T> ApiResponse<T> fail(String resultCode, String msg) {
        return new ApiResponse<>(resultCode, msg, null);
    }

    private static int parseStatusCode(String resultCode) {
        try {
            return Integer.parseInt(resultCode.split("-", 2)[0]);
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }
}
