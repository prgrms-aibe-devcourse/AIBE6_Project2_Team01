package com.modle.domain.user.entity;

import com.modle.domain.user.entity.type.Provider;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
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
}
