package com.modle.domain.user.service;

import com.modle.domain.jobposting.entity.type.Region;
import com.modle.domain.user.dto.TokenPair;
import com.modle.domain.user.dto.request.AdditionalInfoRequest;
import com.modle.domain.user.dto.request.ClientRegisterRequest;
import com.modle.domain.user.dto.request.ModelRegisterRequest;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.repository.UserRepository;
import com.modle.domain.jobposting.service.AiRecommendService;
import com.modle.global.auth.JwtTokenProvider;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ModelRepository modelRepository;
    private final ClientRepository clientRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final EmailVerifyService emailVerifyService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AiRecommendService aiRecommendService;

    @Transactional
    public User registerModel(ModelRegisterRequest request) {
        // 1. 이메일 인증 완료 여부 확인
        emailVerifyService.checkVerified(request.email());

        // 2. 이메일 중복 검증
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 3. 비밀번호 암호화 + 유저 생성
        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.createLocal(request.email(), encodedPassword, request.region(), Role.MODEL);
        userRepository.save(user);

        // 4. 모델 프로필 생성
        Model model = Model.create(user, request.name(), request.height(),
                request.weight(), request.sex(), request.age());
        modelRepository.save(model);

        // MVP: User.region을 초기 model_region으로 1개 복사
        if (user.getRegion() != null && !user.getRegion().isBlank()) {
            try {
                Region regionEnum = Region.valueOf(user.getRegion());
                com.modle.domain.profile.entity.ModelRegion modelRegion = new com.modle.domain.profile.entity.ModelRegion();
                modelRegion.setModel(model);
                modelRegion.setRegion(regionEnum);
                model.getModelRegions().add(modelRegion);
                modelRepository.save(model); // Cascade 옵션이 있다면 여기서 저장됨
            } catch (IllegalArgumentException e) {
            }
        }

        // 5. 인증 완료 표시 삭제 (재사용 방지)
        emailVerifyService.deleteVerified(request.email());

        return user;
    }

    @Transactional
    public User registerClient(ClientRegisterRequest request) {
        // 1. 이메일 인증 완료 여부 확인
        emailVerifyService.checkVerified(request.email());

        // 2. 이메일 중복 검증
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 3. 비밀번호 암호화 + 유저 생성
        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.createLocal(request.email(), encodedPassword, request.region(), Role.CLIENT);
        userRepository.save(user);

        // 4. 의뢰인 프로필 생성
        Client client = Client.create(user, request.clientType(),
                request.companyName(), request.companyNumber());
        clientRepository.save(client);

        // 5. 인증 완료 표시 삭제 (재사용 방지)
        emailVerifyService.deleteVerified(request.email());

        return user;
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
    
    @Transactional(readOnly = true)
    public void checkPassword(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
    }

    public void checkStatus(User user) {
        if (user.getStatus() == UserStatus.PENDING) {
            throw new CustomException(ErrorCode.USER_PENDING);
        } else if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new CustomException(ErrorCode.USER_SUSPENDED);
        } else if (user.getStatus() == UserStatus.WITHDRAWN) {
            throw new CustomException(ErrorCode.USER_WITHDRAWN);
        } else if (user.getStatus() == UserStatus.REJECTED) {
            throw new CustomException(ErrorCode.USER_REJECTED);
        }
    }

    public String genAccessToken(User user) {
        return authTokenService.genAccessToken(user);
    }

    public String genRefreshToken(User user) {
        return authTokenService.genRefreshToken(user);
    }

    public TokenPair reissueTokens(String refreshToken) {
        return authTokenService.reissueTokens(refreshToken);
    }

    public void deleteRefreshToken(String refreshToken) {
        Long userId = jwtTokenProvider.getUserId(refreshToken);
        authTokenService.deleteRefreshToken(userId);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    public List<User> findAllByIds(Collection<Long> ids) {
        return userRepository.findAllById(ids);
    }

    @Transactional
    public void completeSignup(Long userId, AdditionalInfoRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.INCOMPLETE) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        if (!request.role().isSelectable()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }

        user.completeOAuthSignup(request.role(), request.region());

        if (request.role() == Role.MODEL) {
            if (request.name() == null || request.height() == null ||
                    request.weight() == null || request.age() == null || request.sex() == null) {
                throw new CustomException(ErrorCode.INVALID_REQUEST);
            }
            Model model = Model.create(user, request.name(), request.height(),
                    request.weight(), request.sex(), request.age());
            modelRepository.save(model);
            
            if (user.getRegion() != null && !user.getRegion().isBlank()) {
                try {
                    Region regionEnum = Region.valueOf(user.getRegion());
                    com.modle.domain.profile.entity.ModelRegion modelRegion = new com.modle.domain.profile.entity.ModelRegion();
                    modelRegion.setModel(model);
                    modelRegion.setRegion(regionEnum);
                    model.getModelRegions().add(modelRegion);
                    modelRepository.save(model);
                } catch (IllegalArgumentException e) {
                }
            }
            aiRecommendService.upsertModelEmbedding(model.getId());
        } else if (request.role() == Role.CLIENT) {
            if (request.companyName() == null || request.companyNumber() == null
                    || request.clientType() == null) {
                throw new CustomException(ErrorCode.INVALID_REQUEST);
            }
            Client client = Client.create(user, request.clientType(),
                    request.companyName(), request.companyNumber());
            clientRepository.save(client);
        }
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.changePassword(passwordEncoder.encode(newPassword));
    }
}
