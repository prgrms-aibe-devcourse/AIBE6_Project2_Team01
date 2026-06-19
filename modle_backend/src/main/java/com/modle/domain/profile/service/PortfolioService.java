package com.modle.domain.profile.service;

import com.modle.domain.profile.entity.Portfolio;
import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.profile.repository.PortfolioRepository;
import com.modle.domain.user.entity.Model;
import com.modle.global.gcs.GcsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final GcsService gcsService;
    // 포트폴리오 추가 로직
    @Transactional
    public List<Portfolio> addPortfolios(Model model, List<MultipartFile> files, Category category) throws IOException {
        List<Portfolio> savedPortfolios = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue; // 빈 파일 방어 로직

            // GCS 업로드 후 DB 저장
            String imgUrl = gcsService.uploadImage(file);
            Portfolio portfolio = new Portfolio(model, imgUrl, category);
            savedPortfolios.add(portfolioRepository.save(portfolio));
        }

        return savedPortfolios;
    }
    // 포트폴리오 삭제 로직
    @Transactional
    public void deletePortfolio(Long portfolioId, Model currentModel) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 포트폴리오입니다."));
        // 권한 체크: 다른 사람의 포트폴리오를 지울 수 없도록 방어
        if (!portfolio.getModel().getId().equals(currentModel.getId())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
        // 1. GCS 스토리지에서 실제 이미지 파일 삭제
        gcsService.deleteImage(portfolio.getImgUrl());

        // 2. DB에서 포트폴리오 데이터 삭제
        portfolioRepository.delete(portfolio);
    }

   //
    @Transactional
    public void reorderPortfolios(List<Long> portfolioIds, Model currentModel) {
        for (int i = 0; i < portfolioIds.size(); i++) {
            Long id = portfolioIds.get(i);
            Portfolio portfolio = portfolioRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 포트폴리오입니다."));

            // 본인의 포트폴리오인지 검증 (방어 로직)
            if (!portfolio.getModel().getId().equals(currentModel.getId())) {
                throw new IllegalArgumentException("수정 권한이 없습니다.");
            }

            portfolio.updateDisplayOrder(i);
        }
    }
    @Transactional
    public void update(long id, Model model, Category category) {
        //포트폴리오 유무 체크
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(
                ()-> new IllegalArgumentException("존재하지 않는 포트폴리오입니다.")
        );
        // 2. 권한 체크 (내 포트폴리오가 맞는지 확인)
        if (!portfolio.getModel().getId().equals(model.getId())) {
            throw new IllegalArgumentException("해당 포트폴리오를 수정할 권한이 없습니다.");
        }
        portfolio.setCategory(category);
    }
}
