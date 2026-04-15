package com.graphhire.application.command;

import lombok.Data;

@Data
public class UpdateProfileCmd {
    private String realName;
    private Integer gender;
    private Integer age;
    private String phone;
    private String education;
    private String city;
    private String targetCity;
    private Integer expectedSalary;
}
