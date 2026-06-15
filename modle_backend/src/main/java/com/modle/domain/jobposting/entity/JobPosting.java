package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "job_posting")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPosting extends BaseEntity {

    // TODO(인증/회원): user 도메인 확정 후 연관관계 검토. 현재는 작성자 식별자만 보관 (가정)
    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Region region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobPostingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequiredSex requiredSex;

    @Column
    private Integer ageMin;

    @Column
    private Integer ageMax;

    @Column
    private Integer heightMin;

    @Column
    private Integer heightMax;

    @Column
    private Integer weightMin;

    @Column
    private Integer weightMax;

    @Column
    private Integer minCareerMonths;

    @Column(precision = 10, scale = 2)
    private BigDecimal payment;

    @Enumerated(EnumType.STRING)
    @Column
    private PayType payType;

    @Column
    private LocalDateTime shootDate;

    @Builder
    private JobPosting(Long clientId, String title, String content, Category category, Region region,
                       JobPostingStatus status, RequiredSex requiredSex,
                       Integer ageMin, Integer ageMax,
                       Integer heightMin, Integer heightMax,
                       Integer weightMin, Integer weightMax,
                       Integer minCareerMonths,
                       BigDecimal payment, PayType payType, LocalDateTime shootDate) {
        this.clientId = clientId;
        this.title = title;
        this.content = content;
        this.category = category;
        this.region = region;
        this.status = status;
        this.requiredSex = requiredSex != null ? requiredSex : RequiredSex.ANY;
        this.ageMin = ageMin;
        this.ageMax = ageMax;
        this.heightMin = heightMin;
        this.heightMax = heightMax;
        this.weightMin = weightMin;
        this.weightMax = weightMax;
        this.minCareerMonths = minCareerMonths;
        this.payment = payment;
        this.payType = payType;
        this.shootDate = shootDate;
    }

    public void update(String title, String content, Category category, Region region,
                       RequiredSex requiredSex,
                       Integer ageMin, Integer ageMax,
                       Integer heightMin, Integer heightMax,
                       Integer weightMin, Integer weightMax,
                       Integer minCareerMonths,
                       BigDecimal payment, PayType payType, LocalDateTime shootDate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.region = region;
        this.requiredSex = requiredSex != null ? requiredSex : RequiredSex.ANY;
        this.ageMin = ageMin;
        this.ageMax = ageMax;
        this.heightMin = heightMin;
        this.heightMax = heightMax;
        this.weightMin = weightMin;
        this.weightMax = weightMax;
        this.minCareerMonths = minCareerMonths;
        this.payment = payment;
        this.payType = payType;
        this.shootDate = shootDate;
    }

}
