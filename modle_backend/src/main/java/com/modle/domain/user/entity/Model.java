package com.modle.domain.user.entity;

import com.modle.domain.profile.entity.ModelCategory;
import com.modle.domain.profile.entity.ModelTag;
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

    @Column(nullable = false)
    private boolean gender;

    @Column(nullable = false)
    private int age;

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

    public static Model create(User user, String name, int height,
                               int weight, boolean gender, int age) {
        Model model = new Model();
        model.user = user;
        model.name = name;
        model.height = height;
        model.weight = weight;
        model.gender = gender;
        model.age = age;
        return model;
    }

    public void update(String name, int height, int weight, boolean gender,
                       int age, String introduction, String profileImageUrl) {
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.gender = gender;
        this.age = age;
        this.introduction = introduction;
        this.profileImageUrl = profileImageUrl;
    }
}
