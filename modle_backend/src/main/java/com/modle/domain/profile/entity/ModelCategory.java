package com.modle.domain.profile.entity;

import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.user.entity.Model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//id	BIGINT PK	고유 식별자
//model_id	BIGINT FK	MODEL 참조
//category	ENUM	HAIR / MAKEUP / HAND / FITTING / CLOTHING / ETC
@Entity
@Getter
@Setter
@NoArgsConstructor

public class ModelCategory{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    @ManyToOne
    @JoinColumn(name = "model_id")
    Model model;
    Category category;
}
