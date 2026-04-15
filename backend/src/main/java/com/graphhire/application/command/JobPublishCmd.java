package com.graphhire.application.command;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
public class JobPublishCmd {
    @NotBlank(message = "职位名称不能为空")
    private String jobTitle;

    private String department;
    private Integer headcount;

    @NotBlank(message = "工作城市不能为空")
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
