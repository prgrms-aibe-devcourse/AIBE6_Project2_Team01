package com.modle.domain.user.controller;

import com.modle.domain.user.dto.TokenPair;
import com.modle.domain.user.dto.UserDto;
import com.modle.domain.user.dto.request.*;
import com.modle.domain.user.dto.response.LoginResponse;
import com.modle.domain.user.dto.response.PasswordResetResponse;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.service.UserService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.response.ApiResponse;
import com.modle.global.rq.Rq;
import com.modle.domain.user.service.EmailVerifyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "인증/회원", description = "회원가입·로그인·토큰·비밀번호 재설정 API")
public class UserController {
    private final UserService userService;
    private final Rq rq;
    private final EmailVerifyService emailVerifyService;

    @Operation(summary = "모델 회원가입", description = "모델 회원으로 가입합니다.")
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

    @Operation(summary = "의뢰인 회원가입", description = "의뢰인 회원으로 가입합니다. (가입 후 관리자 승인 필요)")
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

    @Operation(summary = "이메일 인증 코드 발송", description = "회원가입용 이메일 인증 코드를 발송합니다.")
    @PostMapping("/email/verify/send")
    public ApiResponse<Void> sendVerificationCode(
            @Valid @RequestBody EmailVerifyRequest request
    ) {
        emailVerifyService.sendVerificationCode(request.email());
        return new ApiResponse<>("200-1", "인증 코드가 발송되었습니다.");
    }

    @Operation(summary = "이메일 인증 코드 확인", description = "발송된 인증 코드를 검증합니다.")
    @PostMapping("/email/verify/confirm")
    public ApiResponse<Void> confirmVerificationCode(
            @Valid @RequestBody EmailVerifyConfirmRequest request
    ) {
        emailVerifyService.verifyCode(request.email(), request.code());
        return new ApiResponse<>("200-1", "이메일 인증이 완료되었습니다.");
    }

    @Operation(summary = "로그인", description = "이메일·비밀번호로 로그인하고 액세스/리프레시 토큰을 쿠키로 발급합니다.")
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

    @Operation(summary = "로그아웃", description = "리프레시 토큰을 폐기하고 인증 쿠키를 삭제합니다.")
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

    @Operation(summary = "토큰 재발급", description = "리프레시 토큰으로 액세스/리프레시 토큰을 재발급합니다.")
    @PostMapping("/reissue")
    public ApiResponse<Void> reissue() {
        // 쿠키에서 Refresh Token 꺼냄
        String refreshToken = rq.getCookieValue("refreshToken", "");
        if (refreshToken.isBlank()) {
            throw new CustomException(ErrorCode.TOKEN_NOT_FOUND);
        }
        try {
            // 토큰 생성
            TokenPair tokens = userService.reissueTokens(refreshToken);
            // 쿠키 갱신
            rq.setCookie("accessToken", tokens.accessToken(), 60 * 30);
            rq.setCookie("refreshToken", tokens.refreshToken());
            return new ApiResponse<>("200-1", "토큰이 재발급되었습니다.");
        } catch (CustomException e) {
            rq.deleteCookie("accessToken");
            rq.deleteCookie("refreshToken");
            throw e;
        }
    }

    @Operation(summary = "소셜 가입 추가 정보 입력", description = "소셜 로그인 후 부족한 추가 정보를 입력하고 토큰을 재발급합니다.")
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

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ApiResponse<UserDto> me(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        User user = userService.findById(securityUser.getId());
        return new ApiResponse<>("200-1", "내 정보 조회 성공", new UserDto(user));
    }

    @Operation(summary = "비밀번호 재설정 코드 발송", description = "비밀번호 재설정용 인증 코드를 이메일로 발송합니다.")
    @PostMapping("/password/reset/send")
    public ApiResponse<Void> sendPasswordResetCode(
            @Valid @RequestBody EmailVerifyRequest request
    ) {
        emailVerifyService.sendPasswordResetCode(request.email());
        return new ApiResponse<>("200-1", "입력하신 이메일이 가입된 계정이라면 인증 코드가 발송됩니다.");
    }

    @Operation(summary = "비밀번호 재설정 코드 확인", description = "인증 코드를 검증하고 재설정 토큰을 발급합니다.")
    @PostMapping("/password/reset/confirm")
    public ApiResponse<PasswordResetResponse> confirmPasswordResetCode(
            @Valid @RequestBody EmailVerifyConfirmRequest request
    ) {
        String resetToken = emailVerifyService.verifyPasswordResetCode(request.email(), request.code());
        return new ApiResponse<>("200-1", "이메일 인증이 완료되었습니다.", new PasswordResetResponse(resetToken));
    }

    @Operation(summary = "비밀번호 재설정", description = "재설정 토큰을 검증하고 새 비밀번호로 변경합니다.")
    @PostMapping("/password/reset")
    public ApiResponse<Void> resetPassword(
            @Valid @RequestBody PasswordResetRequest request
    ) {
        emailVerifyService.checkPasswordResetVerified(request.email(), request.resetToken());
        userService.resetPassword(request.email(), request.newPassword());
        emailVerifyService.clearPasswordResetVerified(request.email());
        return new ApiResponse<>("200-1", "비밀번호가 재설정되었습니다.");
    }
}
