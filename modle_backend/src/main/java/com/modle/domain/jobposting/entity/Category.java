package com.modle.domain.jobposting.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Category {
    HAIR("헤어"),
    MAKEUP("메이크업"),
    CLOTHING("의류"),
    FITTING("피팅"),
    HAND("손"),
    FOOD("푸드"),
    PRODUCT("제품"),
    ETC("기타");

    private final String displayName;
}
