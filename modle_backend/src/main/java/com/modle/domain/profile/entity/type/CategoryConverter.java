package com.modle.domain.profile.entity.type;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CategoryConverter implements AttributeConverter<Category, String> {

    @Override
    public String convertToDatabaseColumn(Category attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public Category convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return Category.valueOf(dbData);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}
