package com.modle.domain.profile.entity;

import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.user.entity.Model;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class Portfolio extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 권장
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;
    @Column(length = 500, nullable = false)
    private String imgUrl;
    private Category category;
    public Portfolio(Model model, String imgUrl, Category category) {
        this.model = model;
        this.imgUrl = imgUrl;
        this.category = category;
    }
    @Column(nullable = false)
    private Integer displayOrder = 0; // 정렬 순서 (초기값 0)
    public void updateDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

}
