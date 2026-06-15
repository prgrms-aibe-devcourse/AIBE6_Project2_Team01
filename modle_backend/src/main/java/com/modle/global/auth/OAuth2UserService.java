package com.modle.global.auth;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Provider;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 유저 정보 조회
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 소셜 플랫폼 정보 확인
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Provider provider = Provider.valueOf(registrationId.toUpperCase());

        // 필요한 유저 정보 추출
        String providerId;
        String email;

        if (provider == Provider.KAKAO) {
            // 카카오: 최상위 id, kakao_account.email
            Long kakaoId = oAuth2User.getAttribute("id");
            providerId = String.valueOf(kakaoId);

            Map<String, Object> kakaoAccount = oAuth2User.getAttribute("kakao_account");
            if (kakaoAccount == null || kakaoAccount.get("email") == null) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("kakao_email_required", "카카오 이메일 동의가 필요합니다.", null)
                );
            }
            email = (String) kakaoAccount.get("email");
        } else if (provider == Provider.NAVER) {
            Map<String, Object> response = oAuth2User.getAttribute("response");
            if (response == null || response.get("email") == null) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("naver_email_required", "네이버 이메일 동의가 필요합니다.", null)
                );
            }
            providerId = (String) response.get("id");
            email = (String) response.get("email");
        } else {
            // 구글: sub, email
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
        }

        // 기존 유저 조회
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    // provider가 다르면 차단
                    if (existingUser.getProvider() != provider) {
                        throw new OAuth2AuthenticationException(
                                new OAuth2Error(
                                        ErrorCode.OAUTH_EMAIL_ALREADY_EXISTS.getResultCode(),
                                        ErrorCode.OAUTH_EMAIL_ALREADY_EXISTS.getMessage(),
                                        null
                                )
                        );
                    }
                    return existingUser;
                })
                .orElseGet(() -> createOAuthUser(email, provider, providerId));

        return new OAuth2SecurityUser(user, oAuth2User.getAttributes());
    }

    // 신규 OAuth 유저 임시 생성 (INCOMPLETE 상태)
    private User createOAuthUser(String email, Provider provider, String providerId) {
        User user = User.createOAuth(email, provider, providerId);
        return userRepository.save(user);
    }
}
