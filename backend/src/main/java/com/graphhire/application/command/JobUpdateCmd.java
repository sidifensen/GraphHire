package com.graphhire.application.command;

import lombok.Data;

import java.util.List;

@Data
public class JobUpdateCmd {
    private String jobTitle;
    private String department;
    private Integer headcount;
    private String city;
    private String address;
    private Integer salaryMin;
    private Integer salaryMax;
    private String salaryUnit;
    private String educationRequired;
    private String experienceRequired;
    private String jobType;
    private String descriptionFilePath;
    private List<Long> skillTagIds;
}
