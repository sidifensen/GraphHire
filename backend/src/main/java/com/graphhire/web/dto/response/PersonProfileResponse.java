package com.graphhire.web.dto.response;

import lombok.Data;

@Data
public class PersonProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String realName;
    private Integer gender;
    private Integer age;
    private String phone;
    private String education;
    private String city;
    private String targetCity;
    private Integer expectedSalary;
}
