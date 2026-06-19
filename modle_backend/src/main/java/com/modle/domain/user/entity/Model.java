package com.modle.domain.user.entity;

import com.modle.domain.profile.entity.ModelCategory;
import com.modle.domain.profile.entity.ModelTag;
import com.modle.domain.profile.entity.Portfolio;
import com.modle.domain.user.entity.type.Sex;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "model")
@Getter
@NoArgsConstructor
public class Model extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private int height;

    @Column(nullable = false)
    private int weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sex sex;

    @Column(nullable = false)
    private int age;

    private java.time.LocalDate careerStartDate;



    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.modle.domain.profile.entity.ModelRegion> modelRegions = new ArrayList<>();

    // 태그 매핑 리스트
    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModelTag> modelTags = new ArrayList<>();

    // 카테고리 매핑 리스트
    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModelCategory> modelCategories = new ArrayList<>();


    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(nullable = false)
    private double avgRating = 0.0;

    @Column(nullable = false)
    private int reviewCount = 0;

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id DESC") // 변경: 순서를 최우선, 없으면 최신순
    private List<Portfolio> portfolios = new ArrayList<>();


    public static Model create(User user, String name, int height,
                               int weight, Sex sex, int age) {
        Model model = new Model();
        model.user = user;
        model.name = name;
        model.height = height;
        model.weight = weight;
        model.sex = sex;
        model.age = age;
        return model;
    }

    public void update(String name, int height, int weight, Sex sex,
                       int age, String introduction, String profileImageUrl,
                       java.time.LocalDate careerStartDate) {
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.sex = sex;
        this.age = age;
        this.introduction = introduction;
        this.profileImageUrl = profileImageUrl;
        this.careerStartDate = careerStartDate;
    }

    public void updateRating(int newRating) {
        this.avgRating = Math.round(
                ((this.avgRating * this.reviewCount) + newRating) / (this.reviewCount + 1.0) * 10
        ) / 10.0;
        this.reviewCount++;
    }
}
