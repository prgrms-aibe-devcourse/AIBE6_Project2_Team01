package com.modle.domain.profile.dto;

import com.modle.domain.profile.entity.Portfolio;
import com.modle.domain.profile.entity.type.Category;

public record PortfolioDto(
        Long id,
        String imgUrl,
        Category category
) {
    public PortfolioDto(Portfolio portfolio) {
        this(portfolio.getId(), portfolio.getImgUrl(), portfolio.getCategory());
    }
}
