package com.modle.domain.profile.entity;

import com.modle.domain.user.entity.Model;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//id	BIGINT PK	고유 식별자
//model_id	BIGINT FK	MODEL 참조
//img_url	VARCHAR(500)	파일 URL
//created_at	DATETIME	등록일시
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
    public Portfolio(Model model, String imgUrl) {
        this.model = model;
        this.imgUrl = imgUrl;
    }
    @Column(nullable = false)
    private Integer displayOrder = 0; // 정렬 순서 (초기값 0)
    public void updateDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

}