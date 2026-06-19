package com.modle.domain.profile.service;

import com.modle.domain.profile.dto.response.CareerResponse;
import com.modle.domain.profile.entity.Career;
import com.modle.domain.profile.repository.CareerRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CareerService {
    private final CareerRepository careerRepository;
    private final ModelRepository modelRepository;

    // 내 전체 경력 조회 (마이페이지)
    public List<CareerResponse> getMyCareer(Long userId) {
        Model model = modelRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
        return careerRepository.findByModelIdOrderByCompletedDateDesc(model.getId())
                .stream()
                .map(CareerResponse::from)
                .toList();
    }

    // 공개 경력 조회 (모델 프로필)
    public List<CareerResponse> getPublicCareer(Long modelId) {
        return careerRepository.findByModelIdAndIsPublicTrueOrderByCompletedDateDesc(modelId)
                .stream()
                .map(CareerResponse::from)
                .toList();
    }

    // 공개 여부 변경
    @Transactional
    public CareerResponse updatePublic(Long userId, Long careerId, boolean isPublic) {
        Model model = modelRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new CustomException(ErrorCode.DATA_NOT_FOUND));

        // 본인 경력인지 확인
        if (!career.getModelId().equals(model.getId())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        career.setPublic(isPublic);
        return CareerResponse.from(career);
    }
}
