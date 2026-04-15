package com.graphhire.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ParseStatus {
    PENDING(0, "待解析"),
    PARSING(1, "解析中"),
    SUCCESS(2, "解析成功"),
    FAILED(3, "解析失败");

    private final Integer code;
    private final String desc;
}
