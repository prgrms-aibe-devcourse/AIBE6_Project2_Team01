package com.modle.global.init;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.modle.domain.contract.entity.ContractTemplate;
import com.modle.domain.contract.repository.ContractTemplateRepository;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.global.entity.type.Region;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.profile.service.ModelService;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.ClientType;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.Sex;
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
        private final ContractTemplateRepository contractTemplateRepository;
        private final JobPostingRepository jobPostingRepository;

        @Bean
        public ApplicationRunner initDataApplicationRunner() {
                return args -> {
                        self.work1(); // 관리자
                        self.work2(); // 테스트 모델
                        self.work3(); // 테스트 의뢰인
                        self.work4(); // 테스트 모델프로필
                        self.work5(); // 테스트 클라이언트프로필
                        self.work6(); // 계약서 템플릿
                        self.work8(); // 추천 테스트용 모델 500개
                        self.work7(); // 테스트 공고
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
                                "SEOUL",
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
                                "SEOUL",
                                Role.MODEL);
                userRepository.save(user);

                Model model = Model.create(user, "테스트모델", 170, 55, com.modle.domain.user.entity.type.Sex.M, 25);
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
                                "SEOUL",
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
                                "SEOUL",
                                Role.MODEL);
                userRepository.save(user1);
                Model model1 = modelService.create(user1, "홍길동", 180, 75, com.modle.domain.user.entity.type.Sex.M, 25);
                modelService.update(model1, "홍길동", 180, 75, com.modle.domain.user.entity.type.Sex.M, 25,
                                List.of("FITTING"), List.of("tag1"),
                                "안녕하세요, 홍길동입니다.",
                                "SEOUL", "", null, List.of("SEOUL"));

                User user2 = User.createLocal(
                                "model2@modle.com",
                                passwordEncoder.encode("model1234"),
                                "BUSAN",
                                Role.MODEL);
                userRepository.save(user2);
                Model model2 = modelService.create(user2, "김철수", 175, 68, com.modle.domain.user.entity.type.Sex.M, 30);
                modelService.update(model2, "김철수", 175, 68, com.modle.domain.user.entity.type.Sex.M, 30,
                                List.of("HAIR"), List.of("tag2"),
                                "안녕하세요, 김철수입니다.",
                                "BUSAN", "", java.time.LocalDate.of(2020, 1, 1), List.of("BUSAN"));

                User user3 = User.createLocal(
                                "model3@modle.com",
                                passwordEncoder.encode("model1234"),
                                "DAEJEON",
                                Role.MODEL);
                userRepository.save(user3);
                Model model3 = modelService.create(user3, "이영희", 165, 55, com.modle.domain.user.entity.type.Sex.F, 28);
                modelService.update(model3, "이영희", 165, 55, com.modle.domain.user.entity.type.Sex.F, 28,
                                List.of("MAKEUP"), List.of("tag3"),
                                "안녕하세요, 이영희입니다.",
                                "DAEJEON", "", null, List.of("DAEJEON"));
        }

        @Transactional
        public void work5() {
                if (userRepository.existsByEmail("client1@modle.com")) {
                        return;
                }

                User user1 = User.createLocal(
                                "client1@modle.com",
                                passwordEncoder.encode("client1234"),
                                "SEOUL",
                                Role.CLIENT);
                user1.updateStatus(UserStatus.ACTIVE);
                userRepository.save(user1);
                Client client1 = Client.create(user1, ClientType.ORGANIZATION, "무신사", "111-22-33333");
                client1.update("무신사", "111-22-33333", ClientType.ORGANIZATION, "대한민국 No.1 패션 플랫폼 무신사입니다.",
                                "");
                clientRepository.save(client1);

                User user2 = User.createLocal(
                                "client2@modle.com",
                                passwordEncoder.encode("client1234"),
                                "SEOUL",
                                Role.CLIENT);
                user2.updateStatus(UserStatus.ACTIVE);
                userRepository.save(user2);
                Client client2 = Client.create(user2, ClientType.ORGANIZATION, "지그재그", "222-33-44444");
                client2.update("지그재그", "222-33-44444", ClientType.ORGANIZATION, "나를 찾는 1020 여성 쇼핑앱 지그재그입니다.",
                                "");
                clientRepository.save(client2);

                User user3 = User.createLocal(
                                "client3@modle.com",
                                passwordEncoder.encode("client1234"),
                                "GYEONGGI",
                                Role.CLIENT);
                user3.updateStatus(UserStatus.ACTIVE);
                userRepository.save(user3);
                Client client3 = Client.create(user3, ClientType.INDIVIDUAL, "에이블리", "333-44-55555");
                client3.update("에이블리", "333-44-55555", ClientType.INDIVIDUAL, "내 스타일을 가장 잘 아는 쇼핑몰 에이블리입니다.",
                                "");
                clientRepository.save(client3);
        }

        @Transactional
        public void work6() {
                if (contractTemplateRepository.count() > 0)
                        return;

                ContractTemplate template = ContractTemplate.create(
                                "기본 촬영 계약서",
                                """
                                                촬영 시작: {{shoot_start_at}}
                                                촬영 종료: {{shoot_end_at}}
                                                촬영 장소: {{location}}
                                                보수 금액: {{payment}}
                                                보수 방식: {{pay_type}}
                                                사용 범위: {{usage_scope}}
                                                기타 메모: {{memo}}
                                                """);

                contractTemplateRepository.save(template);
        }

        // 테스트 공고 데이터 생성
        @Transactional
        public void work7() {
                if (jobPostingRepository.count() > 0)
                        return;

                Long client1Id = userRepository.findByEmail("client1@modle.com").map(User::getId).orElse(null);
                Long client2Id = userRepository.findByEmail("client2@modle.com").map(User::getId).orElse(null);
                Long client3Id = userRepository.findByEmail("client3@modle.com").map(User::getId).orElse(null);

                if (client1Id == null || client2Id == null || client3Id == null)
                        return;

                JobPosting job1 = JobPosting.builder()
                                .clientId(client1Id)
                                .title("2025 여름 헤어 화보 모델 모집")
                                .content("무신사 여름 화보 촬영을 위한 헤어 모델을 모집합니다.")
                                .category(Category.HAIR)
                                .region(Region.SEOUL)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.ANY)
                                .ageMin(20)
                                .ageMax(30)
                                .payment(new BigDecimal("500000"))
                                .payType(PayType.CASH)
                                .shootDate(LocalDateTime.of(2025, 8, 10, 10, 0))
                                .build();

                JobPosting job2 = JobPosting.builder()
                                .clientId(client2Id)
                                .title("가을 신상 의류 피팅 모델 모집")
                                .content("지그재그 가을 신상 의류 피팅 촬영 모델을 모집합니다.")
                                .category(Category.FITTING)
                                .region(Region.BUSAN)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.F)
                                .ageMin(20)
                                .ageMax(28)
                                .heightMin(160)
                                .heightMax(170)
                                .payment(new BigDecimal("300000"))
                                .payType(PayType.CASH)
                                .shootDate(LocalDateTime.of(2025, 9, 5, 13, 0))
                                .build();

                JobPosting job3 = JobPosting.builder()
                                .clientId(client3Id)
                                .title("뷰티 메이크업 화보 모델 모집")
                                .content("에이블리 메이크업 신제품 화보 촬영 모델을 모집합니다.")
                                .category(Category.MAKEUP)
                                .region(Region.GYEONGGI)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.ANY)
                                .ageMin(22)
                                .payType(PayType.SERVICE)
                                .shootDate(LocalDateTime.of(2025, 10, 1, 11, 0))
                                .build();

                JobPosting job4 = JobPosting.builder()
                                .clientId(client1Id)
                                .title("가을 신상 의류 룩북 모델 모집")
                                .content("무신사 가을 신상 의류 룩북 촬영을 위한 모델을 모집합니다.")
                                .category(Category.CLOTHING)
                                .region(Region.DAEGU)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.F)
                                .ageMin(18)
                                .ageMax(25)
                                .heightMin(165)
                                .payment(new BigDecimal("400000"))
                                .payType(PayType.CASH)
                                .shootDate(LocalDateTime.of(2025, 7, 20, 14, 0))
                                .build();

                JobPosting job5 = JobPosting.builder()
                                .clientId(client2Id)
                                .title("핸드크림 신제품 핸드 모델 모집")
                                .content("지그재그 핸드크림 신제품 촬영을 위한 핸드 모델을 모집합니다.")
                                .category(Category.HAND)
                                .region(Region.INCHEON)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.ANY)
                                .payType(PayType.FREE)
                                .shootDate(LocalDateTime.of(2025, 11, 3, 10, 0))
                                .build();

                JobPosting job6 = JobPosting.builder()
                                .clientId(client3Id)
                                .title("신메뉴 음식 화보 모델 모집")
                                .content("에이블리 신메뉴 음식 화보 촬영을 위한 모델을 모집합니다.")
                                .category(Category.FOOD)
                                .region(Region.GWANGJU)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.M)
                                .ageMin(25)
                                .ageMax(35)
                                .payment(new BigDecimal("200000"))
                                .payType(PayType.CASH)
                                .shootDate(LocalDateTime.of(2025, 6, 15, 9, 0))
                                .build();

                JobPosting job7 = JobPosting.builder()
                                .clientId(client1Id)
                                .title("가전제품 광고 모델 모집")
                                .content("무신사 가전제품 광고 촬영을 위한 제품 모델을 모집합니다.")
                                .category(Category.PRODUCT)
                                .region(Region.DAEJEON)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.ANY)
                                .heightMin(170)
                                .heightMax(185)
                                .weightMin(60)
                                .weightMax(75)
                                .payment(new BigDecimal("600000"))
                                .payType(PayType.CASH)
                                .shootDate(LocalDateTime.of(2025, 9, 25, 15, 0))
                                .build();

                JobPosting job8 = JobPosting.builder()
                                .clientId(client2Id)
                                .title("브랜드 홍보 영상 출연 모델 모집")
                                .content("지그재그 브랜드 홍보 영상 출연을 위한 모델을 모집합니다.")
                                .category(Category.ETC)
                                .region(Region.ULSAN)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.F)
                                .minCareerMonths(6)
                                .payType(PayType.SERVICE)
                                .shootDate(LocalDateTime.of(2025, 12, 1, 13, 0))
                                .build();

                JobPosting job9 = JobPosting.builder()
                                .clientId(client3Id)
                                .title("제주 화보 헤어 모델 모집")
                                .content("에이블리 제주 로케이션 화보 촬영을 위한 헤어 모델을 모집합니다.")
                                .category(Category.HAIR)
                                .region(Region.JEJU)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.M)
                                .ageMin(23)
                                .ageMax(29)
                                .payment(new BigDecimal("450000"))
                                .payType(PayType.CASH)
                                .shootDate(LocalDateTime.of(2025, 8, 30, 10, 0))
                                .build();

                JobPosting job10 = JobPosting.builder()
                                .clientId(client1Id)
                                .title("강원 워크웨어 룩북 모델 모집")
                                .content("무신사 워크웨어 룩북 촬영을 위한 모델을 모집합니다.")
                                .category(Category.CLOTHING)
                                .region(Region.GANGWON)
                                .status(JobPostingStatus.RECRUITING)
                                .requiredSex(RequiredSex.ANY)
                                .ageMin(19)
                                .ageMax(26)
                                .heightMin(158)
                                .heightMax(168)
                                .payType(PayType.FREE)
                                .shootDate(LocalDateTime.of(2025, 10, 15, 11, 0))
                                .build();

                jobPostingRepository.save(job1);
                jobPostingRepository.save(job2);
                jobPostingRepository.save(job3);
                jobPostingRepository.save(job4);
                jobPostingRepository.save(job5);
                jobPostingRepository.save(job6);
                jobPostingRepository.save(job7);
                jobPostingRepository.save(job8);
                jobPostingRepository.save(job9);
                jobPostingRepository.save(job10);
        }

        // 추천 테스트용 모델 500개 생성
        @Transactional
        public void work8() {
                Category[] categories = Category.values();
                Region[] regions = Region.values();

                for (int i = 1; i <= 500; i++) {
                        String email = "testmodel%03d@modle.com".formatted(i);
                        if (userRepository.existsByEmail(email)) {
                                continue;
                        }

                        Category category = categories[(i - 1) % categories.length];
                        Region region = regions[(i - 1) % regions.length];
                        Sex sex = i % 3 == 0 ? Sex.M : Sex.F;
                        int age = 19 + (i % 17);
                        int height = 155 + (i % 36);
                        int weight = 45 + (i % 36);
                        LocalDate careerStartDate = i % 5 == 0
                                        ? null
                                        : LocalDate.of(2018 + (i % 7), (i % 12) + 1, 1);
                        List<String> categoryNames = distinctNames(List.of(
                                        category.name(),
                                        categories[i % categories.length].name(),
                                        i % 3 == 0 ? Category.HAIR.name() : category.name(),
                                        i % 5 == 0 ? Category.CLOTHING.name() : category.name()));
                        List<String> activeRegionNames = distinctNames(List.of(
                                        region.name(),
                                        regions[i % regions.length].name(),
                                        i % 3 == 0 ? Region.SEOUL.name() : region.name(),
                                        i % 5 == 0 ? Region.GYEONGGI.name() : region.name()));

                        User user = User.createLocal(
                                        email,
                                        passwordEncoder.encode("model1234"),
                                        region.getDisplayName(),
                                        Role.MODEL);
                        userRepository.save(user);

                        String name = "테스트모델%03d".formatted(i);
                        Model model = modelService.create(user, name, height, weight, sex, age);
                        modelService.update(
                                        model,
                                        name,
                                        height,
                                        weight,
                                        sex,
                                        age,
                                        categoryNames,
                                        List.of(
                                                        "seed",
                                                        "test",
                                                        category.name().toLowerCase(),
                                                        region.name().toLowerCase()),
                                        "%s 지역의 %s 카테고리 추천 테스트용 모델입니다.".formatted(
                                                        region.getDisplayName(),
                                                        category.name()),
                                        region.getDisplayName(),
                                        "",
                                        careerStartDate,
                                        activeRegionNames);
                }
        }

        private List<String> distinctNames(List<String> names) {
                List<String> result = new ArrayList<>();
                for (String name : names) {
                        if (!result.contains(name)) {
                                result.add(name);
                        }
                }
                return result;
        }

}
