package com.graphhire.job.application.command;

import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;

import java.util.List;

/**
 * 发布职位命令对象
 *
 * 【模块说明】封装发布职位所需的请求参数，作为应用层命令/命令处理器模式的输入对象。
 *            用于创建新职位或更新现有职位的场景。
 *
 * 【字段说明】
 * - 必填字段：title（职位名称）、companyId（通过上下文获取）
 * - 选填字段：department、headcount、location、salaryRange、skills、description
 */
public class PublishJobCmd {
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
    /** 岗位技能列表（仅允许 skill_tag.name） */
    private List<String> skills;
    /** 职位描述 */
    private String description;
    public PublishJobCmd() {
    }

    public PublishJobCmd(String title, String department, Integer headcount,
                        Location location, SalaryRange salaryRange,
                        List<String> skills,
                        String description) {
        this.title = title;
        this.department = department;
        this.headcount = headcount;
        this.location = location;
        this.salaryRange = salaryRange;
        this.skills = skills;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // 兼容旧前端字段
    public List<String> getRequiredSkills() {
        return skills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.skills = requiredSkills;
    }

    public List<String> getPreferredSkills() {
        return List.of();
    }

    public void setPreferredSkills(List<String> preferredSkills) {
        // no-op
    }
}
