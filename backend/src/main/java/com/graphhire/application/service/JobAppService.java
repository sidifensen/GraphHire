package com.graphhire.application.service;

import com.graphhire.application.command.JobPublishCmd;
import com.graphhire.application.command.JobUpdateCmd;
import com.graphhire.application.dto.JobDetailResponse;
import com.graphhire.application.dto.JobPublishResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.application.dto.SkillTagDto;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.JobSkill;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.model.SkillTag;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.JobSkillRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.SkillTagRepository;
import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.ParseStatus;
import com.graphhire.domain.vo.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobAppService {
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final CompanyStaffRepository companyStaffRepository;
    private final JobSkillRepository jobSkillRepository;
    private final SkillTagRepository skillTagRepository;
    private final ParseTaskRepository parseTaskRepository;

    @Transactional
    public JobPublishResponse publish(Long userId, JobPublishCmd cmd) {
        log.info("Publishing job for userId: {}, jobTitle: {}", userId, cmd.getJobTitle());

        // Get company by userId
        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        // Create job record
        Job job = Job.builder()
                .companyId(company.getId())
                .jobTitle(cmd.getJobTitle())
                .department(cmd.getDepartment())
                .headcount(cmd.getHeadcount())
                .city(cmd.getCity())
                .address(cmd.getAddress())
                .salaryMin(cmd.getSalaryMin())
                .salaryMax(cmd.getSalaryMax())
                .salaryUnit(cmd.getSalaryUnit())
                .educationRequired(cmd.getEducationRequired())
                .experienceRequired(cmd.getExperienceRequired())
                .jobType(cmd.getJobType())
                .descriptionFilePath(cmd.getDescriptionFilePath())
                .parseStatus(ParseStatus.PENDING)
                .jobStatus(JobStatus.PENDING_REVIEW)
                .createdAt(LocalDateTime.now())
                .build();
        jobRepository.save(job);

        // Save job skills
        if (cmd.getSkillTagIds() != null && !cmd.getSkillTagIds().isEmpty()) {
            for (Long skillTagId : cmd.getSkillTagIds()) {
                SkillTag skillTag = skillTagRepository.findByIdOptional(skillTagId)
                        .orElseThrow(() -> new RuntimeException("技能标签不存在: " + skillTagId));

                JobSkill jobSkill = JobSkill.builder()
                        .jobId(job.getId())
                        .skillTagId(skillTagId)
                        .isRequired(true)
                        .build();
                jobSkillRepository.save(jobSkill);
            }
        }

        // Create parse task for job description
        ParseTask parseTask = ParseTask.builder()
                .jobId(job.getId())
                .taskType("JOB_PARSE")
                .status(TaskStatus.PENDING)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();
        parseTaskRepository.save(parseTask);

        log.info("Job published successfully: jobId={}, parseTaskId={}", job.getId(), parseTask.getId());

        return JobPublishResponse.builder()
                .jobId(job.getId())
                .parseTaskId(parseTask.getId())
                .message("职位发布成功，等待审核")
                .build();
    }

    public JobDetailResponse getDetail(Long jobId) {
        log.info("Getting job detail: jobId={}", jobId);

        Job job = jobRepository.findByIdOptional(jobId)
                .orElseThrow(() -> new RuntimeException("职位不存在"));

        Company company = companyRepository.findByIdOptional(job.getCompanyId())
                .orElseThrow(() -> new RuntimeException("企业不存在"));

        // Get job skills
        List<JobSkill> jobSkills = jobSkillRepository.findByJobId(jobId);
        List<SkillTagDto> skillTags = new ArrayList<>();
        for (JobSkill js : jobSkills) {
            SkillTag tag = skillTagRepository.findByIdOptional(js.getSkillTagId()).orElse(null);
            if (tag != null) {
                skillTags.add(SkillTagDto.builder()
                        .id(tag.getId())
                        .tagName(tag.getTagName())
                        .category(tag.getCategory())
                        .build());
            }
        }

        return JobDetailResponse.builder()
                .id(job.getId())
                .jobTitle(job.getJobTitle())
                .department(job.getDepartment())
                .headcount(job.getHeadcount())
                .city(job.getCity())
                .address(job.getAddress())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryUnit(job.getSalaryUnit())
                .educationRequired(job.getEducationRequired())
                .experienceRequired(job.getExperienceRequired())
                .jobType(job.getJobType())
                .jobStatus(job.getJobStatus())
                .parseStatus(job.getParseStatus())
                .publishedAt(job.getPublishedAt())
                .createdAt(job.getCreatedAt())
                .skills(skillTags)
                .build();
    }

    @Transactional
    public void update(Long userId, Long jobId, JobUpdateCmd cmd) {
        log.info("Updating job: jobId={}, userId={}", jobId, userId);

        Job job = jobRepository.findByIdOptional(jobId)
                .orElseThrow(() -> new RuntimeException("职位不存在"));

        // Verify ownership
        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));
        if (!job.getCompanyId().equals(company.getId())) {
            throw new RuntimeException("无权限修改此职位");
        }

        // Update job fields
        if (cmd.getJobTitle() != null) {
            job.setJobTitle(cmd.getJobTitle());
        }
        if (cmd.getDepartment() != null) {
            job.setDepartment(cmd.getDepartment());
        }
        if (cmd.getHeadcount() != null) {
            job.setHeadcount(cmd.getHeadcount());
        }
        if (cmd.getCity() != null) {
            job.setCity(cmd.getCity());
        }
        if (cmd.getAddress() != null) {
            job.setAddress(cmd.getAddress());
        }
        if (cmd.getSalaryMin() != null) {
            job.setSalaryMin(cmd.getSalaryMin());
        }
        if (cmd.getSalaryMax() != null) {
            job.setSalaryMax(cmd.getSalaryMax());
        }
        if (cmd.getSalaryUnit() != null) {
            job.setSalaryUnit(cmd.getSalaryUnit());
        }
        if (cmd.getEducationRequired() != null) {
            job.setEducationRequired(cmd.getEducationRequired());
        }
        if (cmd.getExperienceRequired() != null) {
            job.setExperienceRequired(cmd.getExperienceRequired());
        }
        if (cmd.getJobType() != null) {
            job.setJobType(cmd.getJobType());
        }
        if (cmd.getDescriptionFilePath() != null) {
            job.setDescriptionFilePath(cmd.getDescriptionFilePath());
        }

        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);

        // Update skills if provided
        if (cmd.getSkillTagIds() != null) {
            // Delete existing skills
            List<JobSkill> existingSkills = jobSkillRepository.findByJobId(jobId);
            for (JobSkill js : existingSkills) {
                jobSkillRepository.delete(js.getId());
            }

            // Add new skills
            for (Long skillTagId : cmd.getSkillTagIds()) {
                JobSkill jobSkill = JobSkill.builder()
                        .jobId(jobId)
                        .skillTagId(skillTagId)
                        .isRequired(true)
                        .build();
                jobSkillRepository.save(jobSkill);
            }
        }

        log.info("Job updated successfully");
    }

    @Transactional
    public void changeStatus(Long userId, Long jobId, JobStatus status) {
        log.info("Changing job status: jobId={}, status={}", jobId, status);

        Job job = jobRepository.findByIdOptional(jobId)
                .orElseThrow(() -> new RuntimeException("职位不存在"));

        // Verify ownership
        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));
        if (!job.getCompanyId().equals(company.getId())) {
            throw new RuntimeException("无权限修改此职位");
        }

        job.setJobStatus(status);
        if (status == JobStatus.PUBLISHED) {
            job.setPublishedAt(LocalDateTime.now());
        }
        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);

        log.info("Job status changed successfully");
    }

    @Transactional
    public void delete(Long userId, Long jobId) {
        log.info("Deleting job: jobId={}, userId={}", jobId, userId);

        Job job = jobRepository.findByIdOptional(jobId)
                .orElseThrow(() -> new RuntimeException("职位不存在"));

        // Verify ownership
        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));
        if (!job.getCompanyId().equals(company.getId())) {
            throw new RuntimeException("无权限删除此职位");
        }

        // Delete associated skills
        List<JobSkill> skills = jobSkillRepository.findByJobId(jobId);
        for (JobSkill js : skills) {
            jobSkillRepository.delete(js.getId());
        }

        // Delete associated parse tasks
        List<ParseTask> tasks = parseTaskRepository.findByJobId(jobId);
        for (ParseTask task : tasks) {
            parseTaskRepository.delete(task.getId());
        }

        // Delete the job
        jobRepository.delete(jobId);

        log.info("Job deleted successfully");
    }

    public PageResult<Job> list(Long userId, Integer page, Integer pageSize) {
        log.info("Listing jobs for userId: {}, page: {}, pageSize: {}", userId, page, pageSize);

        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        List<Job> jobs = jobRepository.findByCompanyId(company.getId(), page, pageSize);
        Long total = jobRepository.countByCompanyId(company.getId());

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Job>builder()
                .records(jobs)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    public PageResult<Job> listPublished(Integer page, Integer pageSize) {
        log.info("Listing published jobs: page: {}, pageSize: {}", page, pageSize);

        List<Job> jobs = jobRepository.findByJobStatus(JobStatus.PUBLISHED, page, pageSize);
        Long total = jobRepository.countByJobStatus(JobStatus.PUBLISHED);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Job>builder()
                .records(jobs)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }
}
