package com.graphhire.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SkillLevel {
    BEGINNER(1, "初级"),
    INTERMEDIATE(2, "中级"),
    ADVANCED(3, "高级"),
    EXPERT(4, "专家");

    private final Integer code;
    private final String desc;
}
