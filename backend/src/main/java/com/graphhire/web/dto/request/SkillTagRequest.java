package com.graphhire.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SkillTagRequest {
    @NotBlank(message = "标签名称不能为空")
    private String tagName;
    @NotBlank(message = "分类不能为空")
    private String category;
}
