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
import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolios")
@RequiredArgsConstructor
public class PortfolioController {
    private final PortfolioService portfolioService;
    private final ModelService modelService; // 내 모델 정보 조회를 위해 사용


    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RsData<List<PortfolioDto>> uploadPortfolios(
            @RequestParam("files") List<MultipartFile> files, // ⭐ List로 받기
            @AuthenticationPrincipal SecurityUser currentUser) throws IOException {

        Model model = modelService.findByUserId(currentUser.getId());

        // 다건 저장 로직 호출
        List<Portfolio> portfolios = portfolioService.addPortfolios(model, files);
        // 엔티티 리스트를 DTO 리스트로 변환
        List<PortfolioDto> portfolioDtos = portfolios.stream()
                .map(PortfolioDto::new)
                .toList();
        return new RsData<>(
                "201-1",
                files.size() + "장의 포트폴리오 이미지가 추가되었습니다.",
                portfolioDtos
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
