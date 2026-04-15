package com.graphhire.domain.model;

import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.ParseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job implements Serializable {
    private Long id;
    private Long companyId;
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
    private String parseResult;
    private ParseStatus parseStatus;
    private JobStatus jobStatus;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
