package com.modle.global.auth;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Provider;
import com.modle.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

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
        String providerId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");

        // DB에서 유저 조회 or 신규 생성
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createOAuthUser(email, provider, providerId));

        return new OAuth2SecurityUser(user, oAuth2User.getAttributes());
    }

    // 신규 OAuth 유저 임시 생성 (INCOMPLETE 상태)
    private User createOAuthUser(String email, Provider provider, String providerId) {
        User user = User.createOAuth(email, provider, providerId);
        return userRepository.save(user);
    }
}
