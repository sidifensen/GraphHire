package com.graphhire.application.command;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class SkillTagCreateCmd {
    @NotBlank(message = "标签名称不能为空")
    private String tagName;

    @NotBlank(message = "分类不能为空")
    private String category;
}
