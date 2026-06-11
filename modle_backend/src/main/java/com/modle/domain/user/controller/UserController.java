package com.modle.domain.user.controller;

import com.modle.domain.user.dto.UserDto;
import com.modle.domain.user.dto.request.ClientRegisterRequest;
import com.modle.domain.user.dto.request.LoginRequest;
import com.modle.domain.user.dto.request.ModelRegisterRequest;
import com.modle.domain.user.dto.response.LoginResponse;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.service.UserService;
import com.modle.global.response.ApiResponse;
import com.modle.global.rq.Rq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class UserController {
    private final UserService userService;
    private final Rq rq;

    @PostMapping("/signup/model")
    public ApiResponse<Void> registerModel(
            @Valid @RequestBody ModelRegisterRequest request
    ) {
        User user = userService.registerModel(request);
        return new ApiResponse<Void>(
                "201-1",
                "환영합니다. 회원가입이 완료되었습니다."
        );
    }

    @PostMapping("/signup/client")
    public ApiResponse<Void> registerClient(
            @Valid @RequestBody ClientRegisterRequest request
    ) {
        User user = userService.registerClient(request);
        return new ApiResponse<Void>(
                "201-1",
                "환영합니다. 회원가입이 완료되었습니다."
        );
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        User user = userService.findByEmail(request.email());
        // 패스워트, 상태 검증
        userService.checkPassword(user, request.password());
        userService.checkStatus(user);
        // 쿠키 설정
        String accessToken = userService.genAccessToken(user);
        rq.setCookie("accessToken", accessToken);

        return new ApiResponse<LoginResponse>(
                "200-1",
                "로그인 성공",
                new LoginResponse(new UserDto(user))
        );
    }
}
