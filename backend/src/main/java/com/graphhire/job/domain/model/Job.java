package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.job.domain.event.JobPublishedEvent;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 职位领域模型
 *
 * 【模块说明】管理招聘职位的完整生命周期，包括创建、发布、关闭、解析状态流转。
 *
 * 【状态机】
 * - DRAFT：草稿状态，可编辑，可发布/可重新发布
 * - PUBLISHED：已发布状态，可接收投递，可关闭
 * - CLOSED：已关闭状态，不可编辑，可重新发布
 *
 * 【事件发布】
 * - publish()：发布 JobPublishedEvent 事件
 *
 * 【关联实体】
 * - companyId：所属企业ID
 * - location：工作地点（城市、区县、详细地址）
 * - salaryRange：薪资范围（最低、最高、单位）
 * - skills：岗位技能列表（仅允许选择 skill_tag 中存在的技能）
 */
public class Job extends BaseAggregateRoot {
    /** 职位ID（主键） */
    private Long id;
    /** 所属企业ID */
    private Long companyId;
    /** 职位名称 */
    private String title;
    /** 所属部门 */
    private String department;
    /** 招聘人数 */
    private Integer headcount;
    /** 工作地点 */
    private Location location;
    /** 薪资范围 */
    private SalaryRange salaryRange;
    /** 岗位技能列表 */
    private List<String> skills = new ArrayList<>();
    /** 职位状态：DRAFT/PUBLISHED/CLOSED */
    private JobStatus status = JobStatus.DRAFT;
    /** 职位描述 */
    private String description;
    /** 经验要求 */
    private String experience;
    /** 学历要求 */
    private String education;
    /** 工作类型（0=未知 1=全职 2=兼职 3=实习） */
    private Integer jobType;
    /** 创建时间 */
    private LocalDateTime createTime;
    /** 更新时间 */
    private LocalDateTime updateTime;
    /** 逻辑删除 */
    private Boolean deleted;
    /** 发布时间 */
    private LocalDateTime publishedAt;

    /**
     * 发布职位
     * 【功能说明】将职位状态变更为已发布，仅允许草稿或已关闭状态的职位发布。
     *            发布成功后发布 JobPublishedEvent 事件。
     */
    public void publish() {
        // 步骤1：校验状态，仅草稿或已关闭状态可发布
        if (this.status != JobStatus.DRAFT && this.status != JobStatus.CLOSED) {
            throw new IllegalStateException("只能发布草稿或已关闭的职位");
        }
        // 步骤2：更新状态为已发布
        this.status = JobStatus.PUBLISHED;
        // 步骤3：发布领域事件
        this.registerEvent(new JobPublishedEvent(this));
    }

    /**
     * 关闭职位
     * 【功能说明】将职位状态变更为已关闭，仅允许已发布状态的职位关闭。
     */
    public void close() {
        // 步骤1：校验状态，仅已发布状态可关闭
        if (this.status != JobStatus.PUBLISHED) {
            throw new IllegalStateException("只能关闭已发布的职位");
        }
        // 步骤2：更新状态为已关闭
        this.status = JobStatus.CLOSED;
    }

    /**
     * 更新薪资范围
     * 【功能说明】修改职位的薪资范围，校验最低薪资不超过最高薪资。
     */
    public void updateSalary(SalaryRange newRange) {
        // 校验：最低薪资不能大于最高薪资
        if (newRange.getMin() > newRange.getMax()) {
            throw new IllegalArgumentException("最低薪资不能大于最高薪资");
        }
        this.salaryRange = newRange;
    }

    /**
     * 更新职位信息
     * 【功能说明】批量更新职位的基本信息，支持部分更新（null值保持原值）。
     */
    public void updateInfo(String title, String department, Integer headcount, Location location,
                          SalaryRange salaryRange, List<String> skills,
                          String description) {
        this.title = title;
        this.department = department;
        this.headcount = headcount;
        this.location = location;
        this.salaryRange = salaryRange;
        // 非null时创建新的ArrayList副本，避免外部修改影响
        this.skills = skills != null ? new ArrayList<>(skills) : this.skills;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getHeadcount() {
        return headcount;
    }

    public void setHeadcount(Integer headcount) {
        this.headcount = headcount;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public SalaryRange getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(SalaryRange salaryRange) {
        this.salaryRange = salaryRange;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public Integer getJobType() {
        return jobType;
    }

    public void setJobType(Integer jobType) {
        this.jobType = jobType;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    // 兼容旧接口字段，统一映射到 skills
    public List<String> getRequiredSkills() {
        return getSkills();
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        setSkills(requiredSkills);
    }

    public List<String> getPreferredSkills() {
        return new ArrayList<>();
    }

    public void setPreferredSkills(List<String> preferredSkills) {
        // no-op
    }
}
