package com.modle.domain.user.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
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

    @Column(nullable = false)
    private boolean gender;

    @Column(nullable = false)
    private int age;

    @Column(length = 100)
    private String field;

    @Column(length = 255)
    private String tags;

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
                       int age, String field, String tags,
                       String introduction, String profileImageUrl) {
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.gender = gender;
        this.age = age;
        this.field = field;
        this.tags = tags;
        this.introduction = introduction;
        this.profileImageUrl = profileImageUrl;
    }
}
