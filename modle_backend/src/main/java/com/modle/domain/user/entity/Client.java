package com.modle.domain.user.entity;

import com.modle.domain.user.entity.type.ClientType;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "client")
@Getter
@NoArgsConstructor
public class Client extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientType clientType;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 20)
    private String companyNumber;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(nullable = false)
    private double avgRating = 0.0;

    @Column(nullable = false)
    private int reviewCount = 0;

    public static Client create(
            User user, ClientType clientType,
            String name, String number) {
        Client client = new Client();
        client.user = user;
        client.clientType = clientType;
        client.companyName = name;
        client.companyNumber = number;
        return client;
    }

    public void update(String companyName, String companyNumber, ClientType clientType, String introduction, String profileImageUrl) {
        if (companyName != null) this.companyName = companyName;
        if (companyNumber != null) this.companyNumber = companyNumber;
        if (clientType != null) this.clientType = clientType;
        if (introduction != null) this.introduction = introduction;
        if (profileImageUrl != null) this.profileImageUrl = profileImageUrl;
    }

    public void updateRating(int newRating) {
        this.avgRating = Math.round(
                ((this.avgRating * this.reviewCount) + newRating) / (this.reviewCount + 1.0) * 10
        ) / 10.0;
        this.reviewCount++;
    }
}
