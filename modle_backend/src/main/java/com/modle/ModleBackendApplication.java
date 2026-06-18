package com.modle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing // 생성일, 수정일 자동화
@SpringBootApplication
@EnableScheduling
@EnableAsync
public class ModleBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ModleBackendApplication.class, args);
    }

}
