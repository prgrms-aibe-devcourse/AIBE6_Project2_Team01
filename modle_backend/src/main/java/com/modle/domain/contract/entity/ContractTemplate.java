package com.modle.domain.contract.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "contract_template")
public class ContractTemplate extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    public static ContractTemplate create(String title, String content) {
        ContractTemplate template = new ContractTemplate();
        template.title = title;
        template.content = content;
        return template;
    }
}
