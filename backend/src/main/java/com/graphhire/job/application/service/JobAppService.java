package com.graphhire.job.application.service;

import com.graphhire.job.application.command.PublishJobCmd;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.infrastructure.mq.JobMQProducer;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobAppService {

    private static final Logger log = LoggerFactory.getLogger(JobAppService.class);

    @Autowired
    private JobRepository jobRepository;

    @Autowired(required = false)
    private JobMQProducer jobMQProducer;

    @Autowired
    private SkillTagRepository skillTagRepository;

    // =====================================================
    // 【第一部分】职位 CRUD 操作
    // =====================================================

    /**
     * 创建职位
     * 【功能说明】构建新职位领域模型，设置初始状态为草稿，并持久化到数据库。
     * 【业务步骤】
     * 步骤1：构建职位领域模型并填充基础信息
     * 步骤2：设置职位初始状态为草稿（DRAFT）
     * 步骤3：保存职位信息到数据库
     *
     * @param companyId      公司ID
     * @param title          职位标题
     * @param department     部门
     * @param headcount      招聘人数
     * @param location       工作地点
     * @param salaryRange    薪资范围
     * @param skills        岗位技能列表
     * @param description    职位描述
     * @return 保存后的职位领域模型
     */
    @Transactional
    public Job createJob(Long companyId, String title, String department, Integer headcount,
                         Location location, SalaryRange salaryRange,
                         List<String> skills,
                         String description,
                         Integer education,
                         Long positionTypeId) {
        List<String> normalizedSkills = validateAndNormalizeSkills(skills);
        // 步骤1：构建职位领域模型并填充基础信息
        Job job = new Job();
        job.setCompanyId(companyId);
        job.setTitle(title);
        job.setDepartment(department);
        job.setHeadcount(headcount);
        job.setLocation(location);
        job.setSalaryRange(salaryRange);
        job.setSkills(normalizedSkills);
        job.setDescription(description);
        validateEducationCode(education);
        job.setEducation(education);
        job.setPositionTypeId(positionTypeId);

        // 步骤2：设置职位初始状态为草稿（DRAFT）
        job.setStatus(JobStatus.DRAFT);

        // 步骤3：保存职位信息到数据库
        log.info("创建职位: companyId={}, title={}, skillCount={}", companyId, title, normalizedSkills.size());
        return saveJob(job, "创建职位完成");
    }

    /**
     * 更新职位信息
     * 【功能说明】根据传入的更新指令修改职位各项属性，保留原有审核状态。
     * 【业务步骤】
     * 步骤1：根据职位ID查询职位领域模型
     * 步骤2：调用领域模型更新方法修改信息
     * 步骤3：保存更新后的职位信息
     *
     * @param jobId 职位ID
     * @param cmd   更新指令（包含标题、部门、人数、地点、薪资、技能、描述等）
     * @return 更新后的职位领域模型
     */
    @Transactional
    public Job updateJobInfo(Long jobId, PublishJobCmd cmd) {
        // 步骤1：根据职位ID查询职位领域模型
        Job job = requireJob(jobId);
        List<String> normalizedSkills = validateAndNormalizeSkills(cmd.getSkills());

        // 步骤2：调用领域模型更新方法修改信息
        job.updateInfo(cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                cmd.getLocation(), cmd.getSalaryRange(),
                normalizedSkills,
                cmd.getDescription());
        validateEducationCode(cmd.getEducation());
        job.setEducation(cmd.getEducation());
        job.setPositionTypeId(cmd.getPositionTypeId());

        // 步骤3：保存更新后的职位信息
        log.info("更新职位: jobId={}, title={}, skillCount={}", jobId, cmd.getTitle(), normalizedSkills.size());
        return saveJob(job, "更新职位完成");
    }

    /**
     * 删除职位
     * 【功能说明】根据职位ID删除指定的职位记录。
     * 【业务步骤】
     * 步骤1：根据职位ID查询确认职位存在
     * 步骤2：执行职位删除操作
     *
     * @param jobId 职位ID
     */
    @Transactional
    public void deleteJob(Long jobId) {
        // 步骤1：根据职位ID查询确认职位存在
        Job job = requireJob(jobId);

        // 步骤2：执行职位删除操作
        log.info("删除职位: jobId={}, companyId={}", jobId, job.getCompanyId());
        jobRepository.delete(job);
    }

    // =====================================================
    // 【第二部分】职位状态管理
    // =====================================================

    /**
     * 发布职位
     * 【功能说明】将职位状态变更为已发布，发送职位发布事件消息，并触发简历解析流程。
     * 【业务步骤】
     * 步骤1：根据职位ID查询职位领域模型
     * 步骤2：根据更新指令修改职位信息（如有）
     * 步骤3：变更职位状态为已发布
     * 步骤4：保存发布时间并持久化
     * 步骤5：发送职位发布事件消息
     * 步骤6：发布完成后等待候选人投递
     *
     * @param jobId 职位ID
     * @param cmd   更新指令（发布时可选择性更新部分字段，为null则仅发布）
     * @return 发布后的职位领域模型
     */
    @Transactional
    public Job publishJob(Long jobId, PublishJobCmd cmd) {
        // 步骤1：根据职位ID查询职位领域模型
        Job job = requireJob(jobId);

        // 步骤2：根据更新指令修改职位信息（如有）
        if (cmd != null) {
            List<String> normalizedSkills = validateAndNormalizeSkills(cmd.getSkills());
            job.updateInfo(cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                    cmd.getLocation(), cmd.getSalaryRange(),
                    normalizedSkills,
                    cmd.getDescription());
            validateEducationCode(cmd.getEducation());
            job.setEducation(cmd.getEducation());
            job.setPositionTypeId(cmd.getPositionTypeId());
        }

        // 步骤3：变更职位状态为已发布
        job.publish();

        // 步骤4：保存发布时间并持久化
        job.setPublishedAt(LocalDateTime.now());
        Job savedJob = saveJob(job, "发布职位完成");

        // 步骤5：发送职位发布事件消息
        if (jobMQProducer != null) {
            jobMQProducer.sendJobPublishedEvent(savedJob);
        }
        log.info("发布职位: jobId={}, companyId={}", savedJob.getId(), savedJob.getCompanyId());

        return savedJob;
    }

    /**
     * 关闭职位
     * 【功能说明】将职位状态变更为已关闭，停止招聘流程。
     * 【业务步骤】
     * 步骤1：根据职位ID查询职位领域模型
     * 步骤2：变更职位状态为已关闭
     * 步骤3：保存更新后的职位状态
     *
     * @param jobId 职位ID
     * @return 关闭后的职位领域模型
     */
    @Transactional
    public Job closeJob(Long jobId) {
        // 步骤1：根据职位ID查询职位领域模型
        Job job = requireJob(jobId);

        // 步骤2：变更职位状态为已关闭
        job.close();

        // 步骤3：保存更新后的职位状态
        log.info("关闭职位: jobId={}, companyId={}", jobId, job.getCompanyId());
        return saveJob(job, "关闭职位完成");
    }

    /**
     * 更新薪资
     * 【功能说明】修改职位的薪资范围信息。
     * 【业务步骤】
     * 步骤1：根据职位ID查询职位领域模型
     * 步骤2：调用领域模型方法更新薪资范围
     * 步骤3：保存更新后的职位信息
     *
     * @param jobId        职位ID
     * @param newSalaryRange 新的薪资范围
     * @return 更新后的职位领域模型
     */
    @Transactional
    public Job updateSalary(Long jobId, SalaryRange newSalaryRange) {
        // 步骤1：根据职位ID查询职位领域模型
        Job job = requireJob(jobId);

        // 步骤2：调用领域模型方法更新薪资范围
        job.updateSalary(newSalaryRange);

        // 步骤3：保存更新后的职位信息
        log.info("更新职位薪资: jobId={}, salaryMin={}, salaryMax={}",
                jobId,
                newSalaryRange == null ? null : newSalaryRange.getMin(),
                newSalaryRange == null ? null : newSalaryRange.getMax());
        return saveJob(job, "更新职位薪资完成");
    }

    // =====================================================
    // 【第三部分】查询方法
    // =====================================================

    /**
     * 根据ID获取职位
     * 【功能说明】根据职位唯一标识查询并返回职位详情。
     * 【业务步骤】
     * 步骤1：根据职位ID查询职位领域模型
     *
     * @param jobId 职位ID
     * @return 职位领域模型
     */
    public Job getJobById(Long jobId) {
        // 步骤1：根据职位ID查询职位领域模型
        return requireJob(jobId);
    }

    /**
     * 获取公司职位列表
     * 【功能说明】查询指定公司下的所有职位记录。
     * 【业务步骤】
     * 步骤1：根据公司ID查询该公司的所有职位
     *
     * @param companyId 公司ID
     * @return 职位领域模型列表
     */
    public List<Job> getJobsByCompany(Long companyId) {
        // 步骤1：根据公司ID查询该公司的所有职位
        return jobRepository.findByCompanyId(companyId);
    }

    /**
     * 获取已发布职位
     * 【功能说明】查询所有状态为已发布的职位列表，用于前端展示。
     * 【业务步骤】
     * 步骤1：查询状态为已发布的所有职位
     *
     * @return 已发布职位领域模型列表
     */
    public List<Job> getPublishedJobs() {
        // 步骤1：查询状态为已发布的所有职位
        return jobRepository.findByStatus(JobStatus.PUBLISHED);
    }

    private List<String> validateAndNormalizeSkills(List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return List.of();
        }
        List<String> normalized = skills.stream()
                .filter(StrUtil::isNotBlank)
                .map(StrUtil::trim)
                .distinct()
                .collect(Collectors.toList());
        if (CollUtil.isEmpty(normalized)) {
            return List.of();
        }
        List<String> allowed = skillTagRepository.findByNames(normalized).stream()
                .map(tag -> StrUtil.trim(tag.getName()))
                .filter(StrUtil::isNotBlank)
                .collect(Collectors.toSet())
                .stream()
                .toList();
        if (allowed.size() != normalized.size()) {
            List<String> invalid = normalized.stream().filter(s -> !allowed.contains(s)).toList();
            throw new IllegalArgumentException("存在未在技能标签库中的技能: " + String.join(", ", invalid));
        }
        return normalized;
    }

    private Job requireJob(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
    }

    private Job saveJob(Job job, String action) {
        Job savedJob = jobRepository.save(job);
        log.info("{}: jobId={}, status={}", action, savedJob.getId(), savedJob.getStatus());
        return savedJob;
    }

    private void validateEducationCode(Integer education) {
        if (education == null) {
            return;
        }
        if (education < 1 || education > 5) {
            throw new IllegalArgumentException("学历编码非法");
        }
    }
}
