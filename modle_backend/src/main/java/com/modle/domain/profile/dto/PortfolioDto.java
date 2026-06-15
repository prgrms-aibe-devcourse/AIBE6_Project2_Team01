package com.modle.domain.profile.dto;

import com.modle.domain.profile.entity.Portfolio;

public record PortfolioDto(
        Long id,
        String imgUrl
) {
    public PortfolioDto(Portfolio portfolio) {
        this(portfolio.getId(), portfolio.getImgUrl());
    }
}
