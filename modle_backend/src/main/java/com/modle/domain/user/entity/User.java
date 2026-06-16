package com.modle.domain.user.entity;

import com.modle.domain.user.entity.type.Provider;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor
public class User extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Enumerated(EnumType.STRING)
    @Column
    private Role role;

    @Column
    private String region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;  // LOCAL, GOOGLE, KAKAO

    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(nullable = false)
    private int warningCount = 0;

    @Column
    private LocalDateTime rejectedDate;

    @Column(length = 500)
    private String rejectReason;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Client client;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Model model;

    public static User createLocal(
            String email, String password,
            String region, Role role) {
        User user = new User();
        user.email = email;
        user.password = password;
        user.region = region;
        user.provider = Provider.LOCAL;
        user.role = role;
        user.status = (role == Role.MODEL) ? UserStatus.ACTIVE : UserStatus.PENDING;
        return user;
    }

    public static User createOAuth(String email, Provider provider, String providerId) {
        User user = new User();
        user.email = email;
        user.provider = provider;
        user.providerId = providerId;
        user.status = UserStatus.INCOMPLETE;
        return user;
    }

    public void completeOAuthSignup(Role role, String region) {
        this.role = role;
        this.region = region;
        this.status = (role == Role.MODEL) ? UserStatus.ACTIVE : UserStatus.PENDING;
    }

    public void reject(String reason) {
        this.status = UserStatus.REJECTED;
        this.rejectedDate = LocalDateTime.now();
        this.rejectReason = reason;
    }

    public void updateStatus(UserStatus userStatus) {
        this.status = userStatus;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void increaseWarningCount() {
        this.warningCount++;
    }
}
