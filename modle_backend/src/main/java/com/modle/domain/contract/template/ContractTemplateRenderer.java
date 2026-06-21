package com.modle.domain.contract.template;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ContractTemplateRenderer {

    private static final Pattern TEMPLATE_PATTERN = Pattern.compile("\\{\\{(\\w+)}}");

    public String render(String content, ContractTemplateContext context) {
        Map<String, String> values = buildTemplateValues(context);

        Matcher matcher = TEMPLATE_PATTERN.matcher(content);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String replacement = values.getOrDefault(matcher.group(1), "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }

        matcher.appendTail(result);
        return result.toString();
    }

    private Map<String, String> buildTemplateValues(ContractTemplateContext context) {
        Map<String, String> values = new HashMap<>();

        values.put("client_company_name", defaultValue(context.clientCompanyName()));
        values.put("client_email", defaultValue(context.clientEmail()));
        values.put("model_name", defaultValue(context.modelName()));
        values.put("model_email", defaultValue(context.modelEmail()));
        values.put("post_content", defaultValue(context.postContent()));
        values.put("post_category", defaultValue(context.postCategory()));

        values.put("shoot_start_at", defaultValue(context.shootStartAt()));
        values.put("shootStartAt", defaultValue(context.shootStartAt()));
        values.put("shoot_end_at", defaultValue(context.shootEndAt()));
        values.put("shootEndAt", defaultValue(context.shootEndAt()));

        values.put("location", defaultValue(context.location()));
        values.put("payment", defaultValue(context.payment()));

        values.put("pay_type", defaultValue(context.payType()));
        values.put("payType", defaultValue(context.payType()));

        values.put("usage_scope", defaultValue(context.usageScope()));
        values.put("usageScope", defaultValue(context.usageScope()));

        values.put("memo", defaultMemo(context.memo()));

        values.put("client_signature_text", defaultValue(context.clientSignatureText()));
        values.put("client_signed_at", defaultValue(context.clientSignedAt()));
        values.put("model_signature_text", defaultValue(context.modelSignatureText()));
        values.put("model_signed_at", defaultValue(context.modelSignedAt()));

        return values;
    }

    private String defaultValue(String value) {
        return value == null ? "" : value;
    }

    private String defaultMemo(String value) {
        return value == null || value.isBlank() ? "없음" : value;
    }
}