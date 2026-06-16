package com.modle.domain.profile.service;

import com.modle.domain.profile.dto.response.ModelBookmarkResponse;
import com.modle.domain.profile.entity.ModelBookmark;
import com.modle.domain.profile.repository.ModelBookmarkRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModelBookmarkService {
    private final ModelBookmarkRepository bookmarkRepository;
    private final ModelRepository modelRepository;

    // 북마크 추가
    @Transactional
    public boolean add(Long clientId, Long modelId) {
        // 모델 존재 여부 확인
        modelRepository.findById(modelId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (bookmarkRepository.existsByClientIdAndModelId(clientId, modelId)) {
            return true;
        }

        bookmarkRepository.save(ModelBookmark.create(clientId, modelId));
        return true;
    }

    // 북마크 삭제
    @Transactional
    public boolean remove(Long clientId, Long modelId) {
        bookmarkRepository.findByClientIdAndModelId(clientId, modelId)
                .ifPresent(bookmarkRepository::delete);
        return false;
    }

    // 내 북마크 목록
    public List<ModelBookmarkResponse> getMyBookmarks(Long clientId) {
        List<ModelBookmark> bookmarks =
                bookmarkRepository.findByClientIdOrderByCreatedDateDesc(clientId);

        List<Long> modelIds = bookmarks.stream()
                .map(ModelBookmark::getModelId)
                .toList();

        Map<Long, Model> modelMap = modelRepository.findAllById(modelIds)
                .stream()
                .collect(Collectors.toMap(Model::getId, Function.identity()));

        return bookmarks.stream()
                .filter(b -> modelMap.containsKey(b.getModelId()))
                .map(b -> ModelBookmarkResponse.from(b, modelMap.get(b.getModelId())))
                .toList();
    }

    // 북마크 여부 확인
    public boolean isBookmarked(Long clientId, Long modelId) {
        return bookmarkRepository.existsByClientIdAndModelId(clientId, modelId);
    }
}
