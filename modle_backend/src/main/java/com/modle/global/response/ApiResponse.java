package com.modle.global.response;

import lombok.Getter;

// TODO(골격): 골격 담당 머지 후 이 파일을 삭제하고 골격 버전으로 교체한다.
@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final Object error;

    private ApiResponse(boolean success, T data, Object error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> failure(Object error) {
        return new ApiResponse<>(false, null, error);
    }
}
