package com.modle.domain.user.entity.type;

public enum Role {
    MODEL,
    CLIENT,
    ADMIN;

    public boolean isSelectable() {
        return this == MODEL || this == CLIENT;
    }
}
