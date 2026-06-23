package com.modle.domain.jobposting.dto.request.validation;

import com.modle.domain.jobposting.entity.type.PayType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class JobPostingFieldsValidator
        implements ConstraintValidator<ValidJobPostingFields, JobPostingFields> {

    @Override
    public boolean isValid(JobPostingFields v, ConstraintValidatorContext ctx) {
        if (v == null) {
            return true;
        }
        boolean valid = true;
        ctx.disableDefaultConstraintViolation();

        if (v.ageMin() != null && v.ageMax() != null && v.ageMin() > v.ageMax()) {
            addViolation(ctx, "ageMax", "최소 나이는 최대 나이보다 클 수 없습니다.");
            valid = false;
        }
        if (v.heightMin() != null && v.heightMax() != null && v.heightMin() > v.heightMax()) {
            addViolation(ctx, "heightMax", "최소 키는 최대 키보다 클 수 없습니다.");
            valid = false;
        }
        if (v.weightMin() != null && v.weightMax() != null && v.weightMin() > v.weightMax()) {
            addViolation(ctx, "weightMax", "최소 몸무게는 최대 몸무게보다 클 수 없습니다.");
            valid = false;
        }
        if (v.payType() == PayType.CASH
                && (v.payment() == null || v.payment().signum() <= 0)) {
            addViolation(ctx, "payment", "현금 지급 시 보수 금액은 필수입니다.");
            valid = false;
        }
        if (v.payType() == PayType.SERVICE
                && (v.serviceDetail() == null || v.serviceDetail().isBlank())) {
            addViolation(ctx, "serviceDetail", "서비스 제공 시 상세 내용은 필수입니다.");
            valid = false;
        }
        return valid;
    }

    private void addViolation(ConstraintValidatorContext ctx, String property, String message) {
        ctx.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(property)
                .addConstraintViolation();
    }
}
