package com.modle.domain.jobposting.dto.request.validation;

import com.modle.domain.jobposting.entity.type.PayType;

import java.math.BigDecimal;

// 공고 생성/수정 요청이 공유하는 cross-field 검증 대상 필드.
// record accessor 이름과 일치하므로 record가 그대로 구현한다.
public interface JobPostingFields {
    Integer ageMin();
    Integer ageMax();
    Integer heightMin();
    Integer heightMax();
    Integer weightMin();
    Integer weightMax();
    PayType payType();
    BigDecimal payment();
    String serviceDetail();
}
