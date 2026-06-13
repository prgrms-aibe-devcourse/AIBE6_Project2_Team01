package com.modle.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.modle.global.auth.JwtAuthenticationFilter;
import com.modle.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 허용
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/signup/model",
                                "/api/v1/auth/signup/client",
                                "/api/v1/auth/email/verify/send",
                                "/api/v1/auth/email/verify/confirm",
                                "/api/v1/auth/login",
                                "/api/v1/auth/reissue"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/models",
                                "/api/v1/models/**",
                                "/api/v1/models/my"
                        ).permitAll()
                        .requestMatchers(HttpMethod.PUT,
                                "/api/v1/models/my"
                        ).permitAll()
                        // 관리자만
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        // Swagger UI 및 API Docs 허용
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // 나머지 인증 필요
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception
                        // 인증 실패 (토큰 없음)
                        .authenticationEntryPoint((request, response, e) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(401);
                            response.getWriter().write(
                                    objectMapper.writeValueAsString(
                                            ApiResponse.fail("401-1", "로그인 후 이용해주세요.")
                                    )
                            );
                        })
                        // 권한 없음
                        .accessDeniedHandler((request, response, e) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(403);
                            response.getWriter().write(
                                    objectMapper.writeValueAsString(
                                            ApiResponse.fail("403-1", "권한이 없습니다.")
                                    )
                            );
                        })
                );
        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
