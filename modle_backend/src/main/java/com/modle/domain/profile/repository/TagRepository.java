package com.modle.domain.profile.repository;

import com.modle.domain.profile.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name); // 이름으로 태그 검색 기능
}
