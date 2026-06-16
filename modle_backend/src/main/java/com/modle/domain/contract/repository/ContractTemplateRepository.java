package com.modle.domain.contract.repository;

import com.modle.domain.contract.entity.ContractTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractTemplateRepository extends JpaRepository<ContractTemplate, Long> {
    // MVP 단계에서는 템플릿 1개만 제공하므로 첫 번째 템플릿을 조회한다.
    Optional<ContractTemplate> findFirstByOrderByIdAsc();
}
