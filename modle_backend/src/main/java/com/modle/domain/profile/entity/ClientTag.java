package com.modle.domain.profile.entity;

import com.modle.domain.user.entity.Client;
import jakarta.persistence.*;

//id	BIGINT PK	고유 식별자
//client_id	BIGINT FK	CLIENT 참조
//tag_id	BIGINT FK	TAG 참조
@Entity
public class ClientTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    @ManyToOne
    @JoinColumn(name = "model_id")
    Client client;
    @ManyToOne
    @JoinColumn(name = "tag_id")
    Tag tag;

}
