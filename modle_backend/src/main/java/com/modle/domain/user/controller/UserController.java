package com.modle.domain.user.controller;

import com.modle.domain.user.dto.UserDto;
import com.modle.domain.user.dto.request.*;
import com.modle.domain.user.dto.response.LoginResponse;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.service.UserService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.response.ApiResponse;
import com.modle.global.rq.Rq;
import com.modle.domain.user.service.EmailVerifyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class UserController {
    private final UserService userService;
    private final Rq rq;
    private final EmailVerifyService emailVerifyService;

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

    @PostMapping("/email/verify/send")
    public ApiResponse<Void> sendVerificationCode(
            @Valid @RequestBody EmailVerifyRequest request
    ) {
        emailVerifyService.sendVerificationCode(request.email());
        return new ApiResponse<>("200-1", "인증 코드가 발송되었습니다.");
    }

    @PostMapping("/email/verify/confirm")
    public ApiResponse<Void> confirmVerificationCode(
            @Valid @RequestBody EmailVerifyConfirmRequest request
    ) {
        emailVerifyService.verifyCode(request.email(), request.code());
        return new ApiResponse<>("200-1", "이메일 인증이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        User user = userService.findByEmail(request.email());
        // 패스워트, 상태 검증
        userService.checkPassword(user, request.password());
        userService.checkStatus(user);

        // Access Token — 30분
        String accessToken = userService.genAccessToken(user);
        rq.setCookie("accessToken", accessToken, 60 * 30);

        // Refresh Token — 7일
        String refreshToken = userService.genRefreshToken(user);
        rq.setCookie("refreshToken", refreshToken);

        return new ApiResponse<LoginResponse>(
                "200-1",
                "로그인 성공",
                new LoginResponse(new UserDto(user))
        );
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // 쿠키에서 Refresh Token 꺼내서 Redis 삭제
        String refreshToken = rq.getCookieValue("refreshToken", "");
        if (!refreshToken.isBlank()) {
            userService.deleteRefreshToken(refreshToken);
        }

        // 쿠키 삭제
        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");

        return new ApiResponse<>("200-1", "로그아웃 되었습니다.");
    }

    @PostMapping("/reissue")
    public ApiResponse<Void> reissue() {
        // 쿠키에서 Refresh Token 꺼냄
        String refreshToken = rq.getCookieValue("refreshToken", "");
        if (refreshToken.isBlank()) {
            throw new CustomException(ErrorCode.TOKEN_NOT_FOUND);
        }

        // 새 Access Token 발급
        String newAccessToken = userService.reissueAccessToken(refreshToken);
        rq.setCookie("accessToken", newAccessToken, 60 * 30);

        return new ApiResponse<>("200-1", "토큰이 재발급되었습니다.");
    }

    @PostMapping("/signup/additional")
    public ApiResponse<Void> signupAdditional(
            @Valid @RequestBody AdditionalInfoRequest request,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        userService.completeSignup(securityUser.getId(), request);

        // 완료 후 갱신된 role로 토큰 재발급
        User user = userService.findById(securityUser.getId());

        String accessToken = userService.genAccessToken(user);
        String refreshToken = userService.genRefreshToken(user);
        rq.setCookie("accessToken", accessToken, 60 * 30);
        rq.setCookie("refreshToken", refreshToken);

        return new ApiResponse<>("200-1", "추가 정보 입력이 완료되었습니다.");
    }

    @GetMapping("/me")
    public ApiResponse<UserDto> me(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        User user = userService.findById(securityUser.getId());
        return new ApiResponse<>("200-1", "내 정보 조회 성공", new UserDto(user));
    }
}
