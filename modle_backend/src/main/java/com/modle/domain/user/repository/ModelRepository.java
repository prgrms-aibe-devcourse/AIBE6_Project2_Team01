package com.modle.domain.user.repository;

import com.modle.domain.user.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model,Long> {
    Optional<Model> findByUserId(Long userId);
}
