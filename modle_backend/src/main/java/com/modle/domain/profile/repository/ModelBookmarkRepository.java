package com.modle.domain.profile.repository;

import com.modle.domain.profile.entity.ModelBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModelBookmarkRepository extends JpaRepository<ModelBookmark, Long> {
    boolean existsByClientIdAndModelId(Long clientId, Long modelId);

    Optional<ModelBookmark> findByClientIdAndModelId(Long clientId, Long modelId);

    List<ModelBookmark> findByClientIdOrderByCreatedDateDesc(Long clientId);
}
