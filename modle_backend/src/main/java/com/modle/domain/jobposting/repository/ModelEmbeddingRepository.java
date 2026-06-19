package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.ModelEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ModelEmbeddingRepository extends JpaRepository<ModelEmbedding, Long> {

    Optional<ModelEmbedding> findByModelId(Long modelId);

    List<ModelEmbedding> findByModelIdIn(Collection<Long> modelIds);
}
