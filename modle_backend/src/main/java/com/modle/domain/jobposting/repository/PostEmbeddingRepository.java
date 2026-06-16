package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.PostEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostEmbeddingRepository extends JpaRepository<PostEmbedding, Long> {

    Optional<PostEmbedding> findByPostId(Long postId);
}
