package com.modle.domain.profile.entity;

import com.modle.domain.user.entity.Model;
import jakarta.persistence.*;

//id	BIGINT PK	고유 식별자
//model_id	BIGINT FK	MODEL 참조
//tag_id	BIGINT FK	TAG 참조
@Entity
public class ModelTag  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    @ManyToOne
    @JoinColumn(name = "model_id")
    Model model;
    @ManyToOne
    @JoinColumn(name = "tag_id")
    Tag tag;

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }
}
