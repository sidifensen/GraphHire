package com.graphhire.application.dto;

import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.ParseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
    private JobStatus jobStatus;
    private ParseStatus parseStatus;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private List<SkillTagDto> skills;
}
