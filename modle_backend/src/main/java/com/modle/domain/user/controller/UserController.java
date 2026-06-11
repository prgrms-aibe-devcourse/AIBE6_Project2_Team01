package com.modle.domain.user.controller;

import com.modle.domain.user.dto.request.ClientRegisterRequest;
import com.modle.domain.user.dto.request.ModelRegisterRequest;
import com.modle.domain.user.service.UserService;
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class UserController {
    private final UserService userService;

    @PostMapping("/signup/model")
    public ResponseEntity<ApiResponse<Void>> registerModel(
            @Valid @RequestBody ModelRegisterRequest request
    ) {
        userService.registerModel(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("모델 회원가입이 완료됐습니다."));
    }

    @PostMapping("/signup/client")
    public ResponseEntity<ApiResponse<Void>> registerClient(
            @Valid @RequestBody ClientRegisterRequest request
    ) {
        userService.registerClient(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("의뢰인 회원가입이 완료됐습니다. 관리자 승인 후 이용 가능합니다."));
    }
}
