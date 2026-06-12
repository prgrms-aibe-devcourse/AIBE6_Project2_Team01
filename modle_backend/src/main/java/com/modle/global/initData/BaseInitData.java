package com.modle.global.initData;

import com.modle.domain.profile.entity.Model;
import com.modle.domain.profile.service.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Configuration
public class BaseInitData {
    @Autowired
    @Lazy
    private BaseInitData self;

    private final ModelService modelService;

    @Transactional
    public void work1() {
        Model model1 = modelService.create(
                "홍길동",
                25,
                180,
                70,
                "안녕하세요, 홍길동입니다.",
                "https://example.com/profile.jpg",
                4.5,
                10,
                1
        );
            Model model2 = modelService.create(
                    "김철수",
                    30,
                    175,
                    68,
                    "안녕하세요, 김철수입니다.",
                    "https://example.com/profile2.jpg",
                    4.0,
                    5,
                    2
            );
                Model model3 = modelService.create(
                        "이영희",
                        28,
                        165,
                        55,
                        "안녕하세요, 이영희입니다.",
                        "https://example.com/profile3.jpg",
                        4.8,
                        20,
                        3
                );
     }
     public void work2() {
     }
     @Bean
    ApplicationRunner baseInitDataApplicationRunner() {
        return args -> {
            self.work1();
        };

    }
}
