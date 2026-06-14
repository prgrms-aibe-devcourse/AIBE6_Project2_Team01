package com.modle.domain.jobposting.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RequiredSex {
    M("남성"),
    F("여성"),
    ANY("무관");

    private final String displayName;
}
