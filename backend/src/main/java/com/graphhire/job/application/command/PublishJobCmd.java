package com.graphhire.job.application.command;

import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;

import java.util.List;

public class PublishJobCmd {
    private String title;
    private String department;
    private Integer headcount;
    private Location location;
    private SalaryRange salaryRange;
    private List<String> requiredSkills;
    private List<String> preferredSkills;
    private String description;
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
