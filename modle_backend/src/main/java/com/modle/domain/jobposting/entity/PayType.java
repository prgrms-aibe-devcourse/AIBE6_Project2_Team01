package com.modle.domain.jobposting.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PayType {
    CASH("현금"),
    SERVICE("서비스"),
    FREE("재능기부");

    private final String displayName;
}
