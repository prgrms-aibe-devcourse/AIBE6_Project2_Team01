package com.modle.domain.profile.dto.response;

import com.modle.domain.profile.entity.ModelBookmark;
import com.modle.domain.user.entity.Model;

import java.time.LocalDateTime;

public record ModelBookmarkResponse(
        Long modelId,
        String name,
        String profileImageUrl,
        LocalDateTime createdDate
) {
    public static ModelBookmarkResponse from(ModelBookmark bookmark, Model model) {
        return new ModelBookmarkResponse(
                bookmark.getModelId(),
                model.getName(),
                model.getProfileImageUrl(),
                bookmark.getCreatedDate()
        );
    }
}
