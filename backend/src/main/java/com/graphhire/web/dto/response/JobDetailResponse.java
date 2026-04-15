package com.graphhire.web.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobDetailResponse {
    private Long id;
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
    private Integer jobStatus;
    private Integer parseStatus;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private List<SkillTagResponse> skills;
}
