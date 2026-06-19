package com.modle.domain.user.dto;

import lombok.Getter;

import java.util.List;

//순서 변경용
@Getter
public class PortfolioReorderRequest {
    private List<Long> portfolioIds;
}