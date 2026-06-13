package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.PortfolioDto;
import com.modle.domain.profile.entity.Portfolio;
import com.modle.domain.profile.service.ModelService;
import com.modle.domain.profile.service.PortfolioService;
import com.modle.domain.user.entity.Model;
import com.modle.global.auth.SecurityUser;
import com.modle.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/portfolios")
@RequiredArgsConstructor
public class PortfolioController {
    private final PortfolioService portfolioService;
    private final ModelService modelService; // 내 모델 정보 조회를 위해 사용
    // [추가] 포트폴리오 사진 업로드 (JSON이 아닌 Multipart-form data로 받음)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RsData<PortfolioDto> uploadPortfolio(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal SecurityUser currentUser) throws IOException {

        // 현재 로그인한 사용자의 모델 프로필을 찾음
        Model model = modelService.findByUserId(currentUser.getId());

        // 사진 업로드 및 DB 저장 처리
        Portfolio portfolio = portfolioService.addPortfolio(model, file);
        return new RsData<>(
                "201-1",
                "포트폴리오 이미지가 추가되었습니다.",
                new PortfolioDto(portfolio)
        );
    }
    // [삭제] 특정 포트폴리오 지우기
    @DeleteMapping("/{id}")
    public RsData<Void> deletePortfolio(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Model model = modelService.findByUserId(currentUser.getId());

        portfolioService.deletePortfolio(id, model);
        return new RsData<>(
                "200-1",
                "포트폴리오 이미지가 삭제되었습니다."
        );
    }
}
