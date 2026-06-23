package com.modle.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        // JWT 액세스 토큰을 Authorization: Bearer {token} 헤더로 받는 인증 스킴
        SecurityScheme bearerAuthScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        return new OpenAPI()
                .info(new Info()
                        .title("Modle API")
                        .version("v1")
                        .description("모델·의뢰인 매칭 플랫폼 Modle 백엔드 API 문서"))
                // 전역 보안 요구사항 → Swagger UI 상단에 Authorize 버튼 노출.
                // 토큰을 한 번 입력하면 모든 API 요청에 Authorization 헤더가 자동 첨부됩니다.
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, bearerAuthScheme));
    }
}
