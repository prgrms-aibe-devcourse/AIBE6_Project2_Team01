package com.modle.domain.jobposting.entity.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PayType {
    CASH("현금"),
    SERVICE("서비스"),
    FREE("무료");

    private final String displayName;
}
