package com.graphhire.web.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuthCompanyRequest {
    @NotNull(message = "审批结果不能为空")
    private Boolean approved;
    private String reason;
}
