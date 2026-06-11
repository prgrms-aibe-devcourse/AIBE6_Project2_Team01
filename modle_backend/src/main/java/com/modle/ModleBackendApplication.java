package com.modle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ModleBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ModleBackendApplication.class, args);
    }

}
