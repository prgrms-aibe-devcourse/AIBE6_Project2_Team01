package com.modle.domain.profile.entity;

import com.modle.domain.user.entity.Model;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

//id	BIGINT PK	고유 식별자
//model_id	BIGINT FK	MODEL 참조
//img_url	VARCHAR(500)	파일 URL
//created_at	DATETIME	등록일시
@Entity
public class Portfolio extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "model_id")
    Model model;
    String img_url;
}
