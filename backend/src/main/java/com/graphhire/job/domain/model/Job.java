package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.job.domain.event.JobPublishedEvent;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;

import java.util.ArrayList;
import java.util.List;

public class Job extends BaseAggregateRoot {
    private Long id;
    private Long companyId;
    private String title;
    private String department;
    private Integer headcount;
    private Location location;
    private SalaryRange salaryRange;
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> preferredSkills = new ArrayList<>();
    private JobStatus status = JobStatus.DRAFT;
    private String description;

    public void publish() {
        if (this.status != JobStatus.DRAFT && this.status != JobStatus.CLOSED) {
            throw new IllegalStateException("只能发布草稿或已关闭的职位");
        }
        this.status = JobStatus.PUBLISHED;
        this.registerEvent(new JobPublishedEvent(this));
    }

    public void close() {
        if (this.status != JobStatus.PUBLISHED) {
            throw new IllegalStateException("只能关闭已发布的职位");
        }
        this.status = JobStatus.CLOSED;
    }

    public void updateSalary(SalaryRange newRange) {
        if (newRange.getMin() > newRange.getMax()) {
            throw new IllegalArgumentException("最低薪资不能大于最高薪资");
        }
        this.salaryRange = newRange;
    }

    public void updateInfo(String title, String department, Integer headcount, Location location,
                          SalaryRange salaryRange, List<String> requiredSkills, List<String> preferredSkills,
                          String description) {
        this.title = title;
        this.department = department;
        this.headcount = headcount;
        this.location = location;
        this.salaryRange = salaryRange;
        this.requiredSkills = requiredSkills != null ? new ArrayList<>(requiredSkills) : this.requiredSkills;
        this.preferredSkills = preferredSkills != null ? new ArrayList<>(preferredSkills) : this.preferredSkills;
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

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(List<String> preferredSkills) {
        this.preferredSkills = preferredSkills;
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
}
