package com.graphhire.job.application.service;

import com.graphhire.job.application.command.PublishJobCmd;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.ParseStatus;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.infrastructure.mq.JobMQProducer;
import com.graphhire.job.infrastructure.mq.JobParseMQProducer;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobAppService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobMQProducer jobMQProducer;

    @Autowired
    private JobParseMQProducer jobParseMQProducer;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Transactional
    public Job createJob(Long companyId, String title, String department, Integer headcount,
                         Location location, SalaryRange salaryRange,
                         List<String> requiredSkills, List<String> preferredSkills,
                         String description) {
        Job job = new Job();
        job.setCompanyId(companyId);
        job.setTitle(title);
        job.setDepartment(department);
        job.setHeadcount(headcount);
        job.setLocation(location);
        job.setSalaryRange(salaryRange);
        job.setRequiredSkills(requiredSkills);
        job.setPreferredSkills(preferredSkills);
        job.setDescription(description);
        job.setStatus(JobStatus.DRAFT);
        return jobRepository.save(job);
    }

    @Transactional
    public Job publishJob(Long jobId, PublishJobCmd cmd) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        if (cmd != null) {
            job.updateInfo(cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                    cmd.getLocation(), cmd.getSalaryRange(),
                    cmd.getRequiredSkills(), cmd.getPreferredSkills(),
                    cmd.getDescription());
            if (cmd.getFilePath() != null) {
                job.setFilePath(cmd.getFilePath());
            }
        }
        job.publish();
        job.setPublishedAt(LocalDateTime.now());
        Job savedJob = jobRepository.save(job);
        jobMQProducer.sendJobPublishedEvent(savedJob);

        if (savedJob.getFilePath() != null && !savedJob.getFilePath().isBlank()) {
            triggerJobParse(savedJob.getId());
        }

        return savedJob;
    }

    @Transactional
    public void triggerJobParse(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));

        ParseTask task = new ParseTask();
        task.setJobId(jobId);
        task.setTaskType("JOB_PARSE");
        task.setStatus(ParseTask.TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        ParseTask savedTask = parseTaskRepository.save(task);

        job.setParseStatus(ParseStatus.PENDING);
        jobRepository.save(job);

        jobParseMQProducer.sendJobParseTask(jobId, savedTask.getId());
    }

    @Transactional
    public Job updateJobInfo(Long jobId, PublishJobCmd cmd) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        job.updateInfo(cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                cmd.getLocation(), cmd.getSalaryRange(),
                cmd.getRequiredSkills(), cmd.getPreferredSkills(),
                cmd.getDescription());
        return jobRepository.save(job);
    }

    @Transactional
    public Job closeJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        job.close();
        return jobRepository.save(job);
    }

    @Transactional
    public Job updateSalary(Long jobId, SalaryRange newSalaryRange) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        job.updateSalary(newSalaryRange);
        return jobRepository.save(job);
    }

    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
    }

    public List<Job> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId);
    }

    public List<Job> getPublishedJobs() {
        return jobRepository.findByStatus(JobStatus.PUBLISHED);
    }

    @Transactional
    public void deleteJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        jobRepository.delete(job);
    }
}
