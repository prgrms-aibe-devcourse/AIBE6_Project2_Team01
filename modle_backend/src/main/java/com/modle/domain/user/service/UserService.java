package com.modle.domain.user.service;

import com.modle.domain.user.dto.request.ClientRegisterRequest;
import com.modle.domain.user.dto.request.ModelRegisterRequest;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ModelRepository modelRepository;
    private final ClientRepository clientRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public void registerModel(ModelRegisterRequest request) {
        // 1. 이메일 중복 검증
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 2. 비밀번호 암호화 및 공통 유저 엔티티 생성 (모델은 가입 즉시 ACTIVE)
        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.createLocal(request.email(), encodedPassword, request.region(), Role.MODEL);
        userRepository.save(user);

        // 3. 모델 프로필 엔티티 생성 및 저장 (나머지 필드는 자동으로 null 및 기본값 0.0 세팅됨)
        Model model = Model.create(
                user,
                request.name(),
                request.height(),
                request.weight(),
                request.gender(),
                request.age()
        );
        modelRepository.save(model);
    }

    @Transactional
    public void registerClient(ClientRegisterRequest request) {
        // 1. 이메일 중복 검증
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 2. 비밀번호 암호화 및 공통 유저 엔티티 생성 (의뢰인은 가입 시 PENDING)
        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.createLocal(request.email(), encodedPassword, request.region(), Role.CLIENT);
        userRepository.save(user);

        // 3. 의뢰인 프로필 엔티티 생성 및 저장
        Client client = Client.create(
                user,
                request.clientType(),
                request.companyName(),
                request.companyNumber()
        );
        clientRepository.save(client);
    }
}
