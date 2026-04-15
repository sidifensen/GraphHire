package com.graphhire.web.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String realName;
    private Integer gender;
    private Integer age;
    private String phone;
    private String education;
    private String city;
    private String targetCity;
    private Integer expectedSalary;
}
