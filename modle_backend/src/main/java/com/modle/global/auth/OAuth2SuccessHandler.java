package com.modle.global.auth;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.domain.user.service.AuthTokenService;
import com.modle.global.rq.Rq;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final AuthTokenService authTokenService;
    private final Rq rq;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2SecurityUser oAuth2SecurityUser = (OAuth2SecurityUser) authentication.getPrincipal();
        User user = oAuth2SecurityUser.getUser();

        // 신규 유저 (추가 정보 미입력) → 추가 정보 입력 페이지로 redirect
        if (user.getStatus() == UserStatus.INCOMPLETE) {
            // 임시 토큰 발급 (추가 정보 입력 페이지에서 인증용)
            String tempToken = authTokenService.genAccessToken(user);
            rq.setCookie("accessToken", tempToken, 60 * 30);
            response.sendRedirect(frontendBaseUrl + "/signup/additional");
            return;
        }

        // status 검증
        if (user.getStatus() != UserStatus.ACTIVE) {
            String message = URLEncoder.encode(
                    switch (user.getStatus()) {
                        case PENDING -> "승인 대기 중인 계정입니다.";
                        case REJECTED -> "가입이 반려된 계정입니다.";
                        case SUSPENDED -> "정지된 계정입니다.";
                        case WITHDRAWN -> "탈퇴한 계정입니다.";
                        default -> "로그인할 수 없는 계정입니다.";
                    }, StandardCharsets.UTF_8
            );
            response.sendRedirect(frontendBaseUrl + "/login?error=" + message);
            return;
        }

        // 기존 유저 → JWT 발급 후 메인으로 redirect
        String accessToken = authTokenService.genAccessToken(user);
        String refreshToken = authTokenService.genRefreshToken(user);
        rq.setCookie("accessToken", accessToken, 60 * 30);
        rq.setCookie("refreshToken", refreshToken);

        response.sendRedirect(frontendBaseUrl);
    }
}
