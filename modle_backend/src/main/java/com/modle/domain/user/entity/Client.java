package com.modle.domain.user.entity;

import com.modle.domain.user.entity.type.ClientType;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private String logoUrl;

    @Column(nullable = false)
    private double avgRating = 0.0;

    @Column(nullable = false)
    private int reviewCount = 0;

    @Column
    private LocalDateTime rejectedDate;

    @Column(length = 500)
    private String rejectReason;

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

    public void reject(String reason) {
        this.rejectedDate = LocalDateTime.now();
        this.rejectReason = reason;
    }
}
