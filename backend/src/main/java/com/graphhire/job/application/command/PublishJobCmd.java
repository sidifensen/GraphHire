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
 * - 选填字段：department、headcount、location、salaryRange、skills、description、filePath
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
    /** 必填技能列表 */
    private List<String> requiredSkills;
    /** 优先技能列表 */
    private List<String> preferredSkills;
    /** 职位描述 */
    private String description;
    /** 职位文档存储路径（RustFS） */
    private String filePath;

    public PublishJobCmd() {
    }

    public PublishJobCmd(String title, String department, Integer headcount,
                        Location location, SalaryRange salaryRange,
                        List<String> requiredSkills, List<String> preferredSkills,
                        String description) {
        this.title = title;
        this.department = department;
        this.headcount = headcount;
        this.location = location;
        this.salaryRange = salaryRange;
        this.requiredSkills = requiredSkills;
        this.preferredSkills = preferredSkills;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
