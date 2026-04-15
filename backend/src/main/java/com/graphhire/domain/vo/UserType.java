package com.graphhire.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserType {
    PERSON(1, "个人用户"),
    COMPANY(2, "企业用户"),
    ADMIN(3, "管理员");

    private final Integer code;
    private final String desc;
}
