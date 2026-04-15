package com.graphhire.web.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompanyRegisterRequest {
    @NotBlank(message = "企业名称不能为空")
    private String companyName;
    @NotBlank(message = "统一社会信用代码不能为空")
    private String unifiedSocialCreditCode;
    @NotBlank(message = "管理员用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 20, message = "密码8-20位")
    private String password;
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    private String licensePath;
}
