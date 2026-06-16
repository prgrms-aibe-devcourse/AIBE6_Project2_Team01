package com.modle.domain.profile.entity;

import com.modle.domain.jobposting.entity.Region;
import com.modle.domain.user.entity.Model;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "model_region")
@Getter
@Setter
@NoArgsConstructor
public class ModelRegion extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Region region;
}
