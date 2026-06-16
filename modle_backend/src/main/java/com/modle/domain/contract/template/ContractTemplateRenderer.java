package com.modle.domain.contract.template;

import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.PayType;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ContractTemplateRenderer {

    private static final DateTimeFormatter CONTRACT_DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final Pattern TEMPLATE_PATTERN = Pattern.compile("\\{\\{(\\w+)}}");

    public String render(String content, Contract contract) {
        Map<String, String> values = buildTemplateValues(contract);

        Matcher matcher = TEMPLATE_PATTERN.matcher(content);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String replacement = values.getOrDefault(matcher.group(1), "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }

        matcher.appendTail(result);
        return result.toString();
    }

    private Map<String, String> buildTemplateValues(Contract contract) {
        Map<String, String> values = new HashMap<>();

        values.put("shoot_start_at", contract.getShootStartAt().format(CONTRACT_DATE_TIME_FORMATTER));
        values.put("shootStartAt", contract.getShootStartAt().format(CONTRACT_DATE_TIME_FORMATTER));

        values.put("shoot_end_at", contract.getShootEndAt().format(CONTRACT_DATE_TIME_FORMATTER));
        values.put("shootEndAt", contract.getShootEndAt().format(CONTRACT_DATE_TIME_FORMATTER));

        values.put("location", contract.getLocation());
        values.put("payment", formatPayment(contract));

        values.put("pay_type", getPayTypeLabel(contract.getPayType()));
        values.put("payType", getPayTypeLabel(contract.getPayType()));

        values.put("usage_scope", contract.getUsageScope());
        values.put("usageScope", contract.getUsageScope());

        values.put("memo", contract.getMemo() == null || contract.getMemo().isBlank()
                ? "없음"
                : contract.getMemo());

        return values;
    }

    private String formatPayment(Contract contract) {
        if (contract.getPayType() == PayType.FREE) {
            return "0원";
        }
        return NumberFormat.getNumberInstance(Locale.KOREA).format(contract.getPayment()) + "원";
    }

    private String getPayTypeLabel(PayType payType) {
        return switch (payType) {
            case CASH -> "현금";
            case SERVICE -> "서비스";
            case FREE -> "무료";
        };
    }
}
