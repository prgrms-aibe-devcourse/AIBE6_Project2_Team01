package com.modle.global.auth;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    // 이메일로 DB에서 유저 조회 후 SecurityUser로 변환
    // Spring Security가 인증할 때 내부적으로 호출
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
