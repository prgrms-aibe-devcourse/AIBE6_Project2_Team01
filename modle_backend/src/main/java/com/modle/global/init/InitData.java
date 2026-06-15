package com.modle.global.init;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.modle.domain.profile.service.ModelService;
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
    private final ModelService modelService;

    @Bean
    public ApplicationRunner initDataApplicationRunner() {
        return args -> {
            self.work1(); // 관리자
            self.work2(); // 테스트 모델
            self.work3(); // 테스트 의뢰인
            self.work4(); // 테스트 모델프로필
            self.work5(); // 테스트 클라이언트프로필
        };
    }

    // 관리자 계정 생성
    @Transactional
    public void work1() {
        if (userRepository.existsByEmail("admin@modle.com"))
            return;

        User admin = User.createLocal(
                "admin@modle.com",
                passwordEncoder.encode("admin1234"),
                "서울",
                Role.ADMIN);
        admin.updateStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
    }

    // 테스트 모델 계정 생성
    @Transactional
    public void work2() {
        if (userRepository.existsByEmail("model@modle.com"))
            return;

        User user = User.createLocal(
                "model@modle.com",
                passwordEncoder.encode("model1234"),
                "서울",
                Role.MODEL);
        userRepository.save(user);

        Model model = Model.create(user, "테스트모델", 170, 55, true, 25);
        modelRepository.save(model);
    }

    // 테스트 의뢰인 계정 생성 (승인된 상태)
    @Transactional
    public void work3() {
        if (userRepository.existsByEmail("client@modle.com"))
            return;

        User user = User.createLocal(
                "client@modle.com",
                passwordEncoder.encode("client1234"),
                "서울",
                Role.CLIENT);
        user.updateStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        Client client = Client.create(
                user,
                ClientType.INDIVIDUAL,
                "테스트기업",
                "123-45-67890");
        clientRepository.save(client);
    }

    @Transactional
    public void work4() {
        if (userRepository.existsByEmail("model1@modle.com")) {
            return;
        }
        if (modelService.count() > 1) {
            return;
        }
        User user1 = User.createLocal(
                "model1@modle.com",
                passwordEncoder.encode("model1234"),
                "서울",
                Role.MODEL);
        userRepository.save(user1);
        Model model1 = modelService.create(user1, "홍길동", 180, 75, true, 25);
        modelService.update(model1, "홍길동", 180, 75, true, 25, List.of("FITTING"), List.of("tag1"), "안녕하세요, 홍길동입니다.",
                "https://example.com/profile1.jpg", "서울");

        User user2 = User.createLocal(
                "model2@modle.com",
                passwordEncoder.encode("model1234"),
                "부산",
                Role.MODEL);
        userRepository.save(user2);
        Model model2 = modelService.create(user2, "김철수", 175, 68, true, 30);
        modelService.update(model2, "김철수", 175, 68, true, 30, List.of("HAIR"), List.of("tag2"), "안녕하세요, 김철수입니다.",
                "https://example.com/profile2.jpg", "부산");

        User user3 = User.createLocal(
                "model3@modle.com",
                passwordEncoder.encode("model1234"),
                "대전",
                Role.MODEL);
        userRepository.save(user3);
        Model model3 = modelService.create(user3, "이영희", 165, 55, false, 28);
        modelService.update(model3, "이영희", 165, 55, false, 28, List.of("MAKEUP"), List.of("tag3"), "안녕하세요, 이영희입니다.",
                "https://example.com/profile3.jpg", "대전");
    }

    @Transactional
    public void work5() {
        if (userRepository.existsByEmail("client1@modle.com")) {
            return;
        }

        User user1 = User.createLocal(
                "client1@modle.com",
                passwordEncoder.encode("client1234"),
                "서울",
                Role.CLIENT);
        user1.updateStatus(UserStatus.ACTIVE);
        userRepository.save(user1);
        Client client1 = Client.create(user1, ClientType.ORGANIZATION, "무신사", "111-22-33333");
        client1.update("무신사", "111-22-33333", ClientType.ORGANIZATION, "대한민국 No.1 패션 플랫폼 무신사입니다.",
                "https://image.msscdn.net/mfile_s01/2021/04/16/0919ec3116fc53e878ecdfab2d90eb11.jpg");
        clientRepository.save(client1);

        User user2 = User.createLocal(
                "client2@modle.com",
                passwordEncoder.encode("client1234"),
                "서울",
                Role.CLIENT);
        user2.updateStatus(UserStatus.ACTIVE);
        userRepository.save(user2);
        Client client2 = Client.create(user2, ClientType.ORGANIZATION, "지그재그", "222-33-44444");
        client2.update("지그재그", "222-33-44444", ClientType.ORGANIZATION, "나를 찾는 1020 여성 쇼핑앱 지그재그입니다.",
                "https://example.com/zigzag.jpg");
        clientRepository.save(client2);

        User user3 = User.createLocal(
                "client3@modle.com",
                passwordEncoder.encode("client1234"),
                "경기",
                Role.CLIENT);
        user3.updateStatus(UserStatus.ACTIVE);
        userRepository.save(user3);
        Client client3 = Client.create(user3, ClientType.INDIVIDUAL, "에이블리", "333-44-55555");
        client3.update("에이블리", "333-44-55555", ClientType.INDIVIDUAL, "내 스타일을 가장 잘 아는 쇼핑몰 에이블리입니다.",
                "https://example.com/ably.jpg");
        clientRepository.save(client3);
    }
}
