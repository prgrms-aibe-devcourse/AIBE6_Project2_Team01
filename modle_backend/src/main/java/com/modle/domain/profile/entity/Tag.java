package com.modle.domain.profile.entity;

import com.modle.domain.profile.entity.type.TagType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//id	BIGINT PK	고유 식별자
//name	VARCHAR(50)	태그명
//type	ENUM	REGION / STYLE / BRAND / ETC (태그 분류 필드 추가)
//is_default	TINYINT(1)	플랫폼 기본 태그 여부
@Entity
@Getter
@Setter
@NoArgsConstructor

public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    String name;
    TagType type;
    int is_default;
}
