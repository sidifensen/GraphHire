package com.graphhire.web.converter;

import com.graphhire.domain.model.Job;
import com.graphhire.web.dto.response.JobDetailResponse;
import com.graphhire.web.dto.response.SkillTagResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JobConverter {
    public JobDetailResponse toDetailResponse(Job job) {
        if (job == null) {
            return null;
        }
        JobDetailResponse response = new JobDetailResponse();
        response.setId(job.getId());
        response.setJobTitle(job.getJobTitle());
        response.setDepartment(job.getDepartment());
        response.setHeadcount(job.getHeadcount());
        response.setCity(job.getCity());
        response.setAddress(job.getAddress());
        response.setSalaryMin(job.getSalaryMin());
        response.setSalaryMax(job.getSalaryMax());
        response.setSalaryUnit(job.getSalaryUnit());
        response.setEducationRequired(job.getEducationRequired());
        response.setExperienceRequired(job.getExperienceRequired());
        response.setJobType(job.getJobType());
        response.setJobStatus(job.getJobStatus() != null ? job.getJobStatus().getCode() : null);
        response.setParseStatus(job.getParseStatus() != null ? job.getParseStatus().getCode() : null);
        response.setPublishedAt(job.getPublishedAt());
        response.setCreatedAt(job.getCreatedAt());
        return response;
    }

    public JobDetailResponse toDetailResponse(Job job, List<SkillTagResponse> skills) {
        JobDetailResponse response = toDetailResponse(job);
        if (response != null) {
            response.setSkills(skills != null ? skills : Collections.emptyList());
        }
        return response;
    }
}
