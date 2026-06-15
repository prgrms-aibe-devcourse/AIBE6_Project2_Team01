package com.modle.domain.user.service;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Provider;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.infra.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailVerifyService {
    private final RedisTemplate<String, String> redisTemplate;
    private final MailService mailService;
    private final UserRepository userRepository;

    private static final String CODE_PREFIX = "email:verify:";
    private static final String VERIFIED_PREFIX = "email:verified:";
    private static final String PASSWORD_RESET_PREFIX = "password:reset:";
    private static final long CODE_EXPIRE_MINUTES = 5;
    private static final long VERIFIED_EXPIRE_MINUTES = 30;
    private static final long PASSWORD_RESET_EXPIRE_MINUTES = 10;

    // 인증 코드 생성 → Redis 저장 → 이메일 발송
    public void sendVerificationCode(String email) {
        String code = generateCode();
        String key = CODE_PREFIX + email;

        // Redis에 TTL 5분으로 저장
        redisTemplate.opsForValue().set(key, code, CODE_EXPIRE_MINUTES, TimeUnit.MINUTES);

        // 이메일 발송
        mailService.sendVerificationCode(email, code);
    }

    // 인증 코드 검증 → 성공 시 인증 완료 표시 저장
    public void verifyCode(String email, String code) {
        String key = CODE_PREFIX + email;
        String savedCode = redisTemplate.opsForValue().get(key);

        if (savedCode == null) {
            throw new CustomException(ErrorCode.EMAIL_CODE_NOT_FOUND);
        }
        if (!savedCode.equals(code)) {
            throw new CustomException(ErrorCode.EMAIL_CODE_INVALID);
        }

        // 코드 삭제
        redisTemplate.delete(key);

        // 인증 완료 표시 저장 (TTL 30분)
        redisTemplate.opsForValue().set(
                VERIFIED_PREFIX + email,
                "true",
                VERIFIED_EXPIRE_MINUTES,
                TimeUnit.MINUTES
        );
    }

    // 인증 완료 여부 확인
    public void checkVerified(String email) {
        String key = VERIFIED_PREFIX + email;
        String verified = redisTemplate.opsForValue().get(key);
        if (verified == null) {
            throw new CustomException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
    }

    // 인증 완료 표시 삭제 (회원가입 성공 후 호출)
    public void deleteVerified(String email) {
        redisTemplate.delete(VERIFIED_PREFIX + email);
    }

    // 6자리 숫자 인증 코드 생성
    private String generateCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }

    // 비밀번호 재설정용 인증 코드 발송
    public void sendPasswordResetCode(String email) {
        userRepository.findByEmail(email)
                .filter(user -> user.getProvider() == Provider.LOCAL)
                .ifPresent(user -> sendVerificationCode(email));
    }

    // 인증 코드 확인 → 비밀번호 재설정 허용 토큰 저장
    public void verifyPasswordResetCode(String email, String code) {
        verifyCode(email, code);

        redisTemplate.opsForValue().set(
                PASSWORD_RESET_PREFIX + email,
                "true",
                PASSWORD_RESET_EXPIRE_MINUTES,
                TimeUnit.MINUTES
        );
    }

    // 재설정 허용 여부 확인
    public void checkPasswordResetVerified(String email) {
        String verified = redisTemplate.opsForValue().get(PASSWORD_RESET_PREFIX + email);
        if (!"true".equals(verified)) {
            throw new CustomException(ErrorCode.PASSWORD_RESET_NOT_VERIFIED);
        }
    }

    // 재설정 허용 플래그 삭제
    public void clearPasswordResetVerified(String email) {
        redisTemplate.delete(PASSWORD_RESET_PREFIX + email);
    }
}
