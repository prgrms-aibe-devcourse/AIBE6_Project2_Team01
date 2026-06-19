package com.modle.domain.jobposting.entity.type;

public enum ViewerType {
    MODEL,   // 모델: 공고 정보·지원하기·즐겨찾기 버튼 노출
    CLIENT,  // 의뢰인: 공고 정보·AI 추천 모델 섹션 노출
    OTHER    // 기업 사용자: 공고 정보만 노출
}
