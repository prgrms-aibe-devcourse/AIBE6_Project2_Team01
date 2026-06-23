package com.modle.domain.contract.init;

import com.modle.domain.contract.entity.ContractTemplate;
import com.modle.domain.contract.repository.ContractTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ContractTemplateInitializer {
    private final ContractTemplateRepository contractTemplateRepository;

    @Bean
    public ApplicationRunner contractTemplateInitRunner() {
        return args -> {
            if (contractTemplateRepository.count() > 0) return;
            contractTemplateRepository.save(ContractTemplate.create(
                    "기본 촬영 계약서",
                    """
                    촬영 시작: {{shoot_start_at}}
                    촬영 종료: {{shoot_end_at}}
                    촬영 장소: {{location}}
                    보수 금액: {{payment}}
                    보수 방식: {{pay_type}}
                    사용 범위: {{usage_scope}}
                    기타 메모: {{memo}}
                    """
            ));
        };
    }
}
