package com.graphhire.job.domain.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobDomainService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(Long companyId, String title, String department, Integer headcount,
                         String city, String district, String detailAddress,
                         Integer salaryMin, Integer salaryMax, String salaryUnit,
                         List<String> requiredSkills, List<String> preferredSkills,
                         String description) {
        Job job = new Job();
        job.setCompanyId(companyId);
        job.setTitle(title);
        job.setDepartment(department);
        job.setHeadcount(headcount);
        job.setStatus(JobStatus.DRAFT);
        return job;
    }

    public boolean canPublish(Job job) {
        return job.getStatus() == JobStatus.DRAFT || job.getStatus() == JobStatus.CLOSED;
    }

    public boolean canClose(Job job) {
        return job.getStatus() == JobStatus.PUBLISHED;
    }

    public List<Job> findPublishedJobs() {
        return jobRepository.findByStatus(JobStatus.PUBLISHED);
    }

    public List<Job> findJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId);
    }
}
