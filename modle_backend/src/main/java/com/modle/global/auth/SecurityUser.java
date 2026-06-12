package com.modle.global.auth;

import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;

@Getter
public class SecurityUser extends User {
    private final Long id;
    private final String role;

    public SecurityUser(Long id, String email, String role) {
        super(
                email,
                "",
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        this.id = id;
        this.role = role;
    }
}
