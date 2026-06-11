package com.modle.global.auth;

import com.modle.global.exception.CustomException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    // 인증 없이 통과할 경로
    private static final List<String> PERMIT_URLS = List.of(
            "/api/v1/auth/signup/model",
            "/api/v1/auth/signup/client",
            "/api/v1/auth/email/verify/send",
            "/api/v1/auth/email/verify/confirm",
            "/api/v1/auth/login",
            "/api/v1/auth/reissue"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();

        // 인증이 필요 없는 경로는 통과
        if (PERMIT_URLS.contains(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 쿠키에서 accessToken 추출
        String accessToken = extractTokenFromCookie(request, "accessToken");

        // accessToken이 없거나 빈 값이면 인증 없이 통과
        if (accessToken == null || accessToken.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 토큰 유효성 검증
            if (!jwtTokenProvider.isValid(accessToken)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 토큰에서 유저 정보 추출
            Long userId = jwtTokenProvider.getUserId(accessToken);
            String role = jwtTokenProvider.getRole(accessToken);

            // SecurityContext에 인증 정보 등록
            SecurityUser securityUser = new SecurityUser(userId, String.valueOf(userId), role);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(securityUser, "", securityUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (CustomException e) {
            // 만료/위조 토큰은 인증 없이 통과 → SecurityConfig에서 401 처리
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    // 쿠키 배열에서 특정 이름의 쿠키 값 추출
    private String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
