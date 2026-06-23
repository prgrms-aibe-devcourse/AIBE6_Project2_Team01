package com.modle.domain.user.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

import com.modle.domain.profile.entity.ModelCategory;
import com.modle.domain.profile.entity.ModelTag;
import com.modle.domain.profile.entity.Portfolio;
import com.modle.domain.user.entity.type.Sex;
import com.modle.global.entity.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @Column(length = 100)
    private String experience;

    @Column(length = 50)
    private String topSize;

    @Column(length = 50)
    private String bottomSize;

    private Integer shoeSize;

    @Column(length = 100)
    private String availableDays;
    @BatchSize(size = 100)
    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.modle.domain.profile.entity.ModelRegion> modelRegions = new ArrayList<>();

    // 태그 매핑 리스트
    @BatchSize(size = 100)
    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModelTag> modelTags = new ArrayList<>();

    // 카테고리 매핑 리스트
    @BatchSize(size = 100)
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

    @BatchSize(size = 100)
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
            String experience,
            String topSize, String bottomSize, Integer shoeSize, String availableDays) {
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.sex = sex;
        this.age = age;
        this.introduction = introduction;
        this.profileImageUrl = profileImageUrl;
        this.experience = experience;
        this.topSize = topSize;
        this.bottomSize = bottomSize;
        this.shoeSize = shoeSize;
        this.availableDays = availableDays;
    }

    public void updateRating(int newRating) {
        this.avgRating = Math.round(
                ((this.avgRating * this.reviewCount) + newRating) / (this.reviewCount + 1.0) * 10) / 10.0;
        this.reviewCount++;
    }
}
