package com.modle.global.init;

import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.ClientType;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class InitData {
    @Autowired
    @Lazy
    private InitData self;

    private final UserRepository userRepository;
    private final ModelRepository modelRepository;
    private final ClientRepository clientRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initDataApplicationRunner() {
        return args -> {
            self.work1(); // 관리자
            self.work2(); // 테스트 모델
            self.work3(); // 테스트 의뢰인
        };
    }

    // 관리자 계정 생성
    @Transactional
    public void work1() {
        if (userRepository.existsByEmail("admin@modle.com")) return;

        User admin = User.createLocal(
                "admin@modle.com",
                passwordEncoder.encode("admin1234"),
                "서울",
                Role.ADMIN
        );
        admin.updateStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
    }

    // 테스트 모델 계정 생성
    @Transactional
    public void work2() {
        if (userRepository.existsByEmail("model@modle.com")) return;

        User user = User.createLocal(
                "model@modle.com",
                passwordEncoder.encode("model1234"),
                "서울",
                Role.MODEL
        );
        userRepository.save(user);

        Model model = Model.create(user, "테스트모델", 170, 55, true, 25);
        modelRepository.save(model);
    }

    // 테스트 의뢰인 계정 생성 (승인된 상태)
    @Transactional
    public void work3() {
        if (userRepository.existsByEmail("client@modle.com")) return;

        User user = User.createLocal(
                "client@modle.com",
                passwordEncoder.encode("client1234"),
                "서울",
                Role.CLIENT
        );
        user.updateStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        Client client = Client.create(
                user,
                ClientType.INDIVIDUAL,
                "테스트기업",
                "123-45-67890"
        );
        clientRepository.save(client);
    }
}
