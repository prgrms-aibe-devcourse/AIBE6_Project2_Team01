package com.modle.domain.profile.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;

//id	BIGINT PK	고유 식별자
//user_id	BIGINT FK	USER 참조
//name	VARCHAR(50)	활동명
//age	INT	나이
//sex	VARCHAR(2)	성별
//height	INT	키 (cm)
//weight	INT	체중 (kg)
//introduction	TEXT	자기소개
//profile_image_url	VARCHAR(500)	프로필 사진 URL (S3)
//avg_rating	DECIMAL(3,2)	누적 평균 별점
//review_count	INT	리뷰 수
//created_at	DATETIME	등록일시
@Entity
@NoArgsConstructor
@Getter
public class Model extends BaseEntity {
    private String name;
    private int age;
    private int height;
    private int weight;
    private String introduction;
    private String profile_image_url;
    private double avg_rating;
    private int review_count;


    int user_id; // 유저 id 참조

    public String getProfileImageUrl() {
        return profile_image_url;
    }

    public double getAvgRating() {
        return avg_rating;
    }

    public int getReviewCount() {
        return review_count;
    }

    public Model(
            String  name,
            int age,
            int height,
            int weight,
            String introduction,
            String profile_image_url,
            double avg_rating,
            int review_count,
            int user_id
    ){
        this.name = name;
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.introduction = introduction;
        this.profile_image_url = profile_image_url;
        this.avg_rating =  avg_rating;
        this.review_count = review_count;
        this.user_id = user_id;
    }
    public void modify(
            int age,
            int height,
            int weight,
            String introduction,
            String profile_image_url,
            double avg_rating,
            int review_count,
            int user_id
    ){
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.introduction = introduction;
        this.profile_image_url = profile_image_url;
        this.avg_rating =  avg_rating;
        this.review_count = review_count;
        this.user_id = user_id;
    }
}
