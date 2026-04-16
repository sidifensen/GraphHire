package com.graphhire.job.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 职位持久化对象
 *
 * 【模块说明】与数据库job表结构一一对应，用于MyBatis-Plus CRUD操作。
 * 【数据表】job
 */
@TableName("job")
public class JobPO {
    /** 职位ID（主键，自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 所属企业ID */
    private Long companyId;
    /** 职位名称 */
    private String title;
    /** 所属部门（数据库中不存在） */
    @TableField(exist = false)
    private String department;
    /** 招聘人数（数据库中不存在） */
    @TableField(exist = false)
    private Integer headcount;
    /** 工作城市 */
    @TableField("city")
    private String locationCity;
    /** 工作区县（数据库中不存在） */
    @TableField(exist = false)
    private String locationDistrict;
    /** 工作详细地址（数据库中不存在） */
    @TableField(exist = false)
    private String locationDetail;
    /** 最低薪资 */
    @TableField("salary_min")
    private Integer salaryMin;
    /** 最高薪资 */
    @TableField("salary_max")
    private Integer salaryMax;
    /** 薪资单位：月/小时/年 */
    @TableField("salary_unit")
    private String salaryUnit;
    /** 必填技能（JSON数组字符串，数据库中不存在） */
    @TableField(exist = false)
    private String requiredSkills;
    /** 优先技能（JSON数组字符串，数据库中不存在） */
    @TableField(exist = false)
    private String preferredSkills;
    /** 职位状态：0=下架 1=上架 */
    @TableField("status")
    private Integer status;
    /** 职位描述（数据库中不存在） */
    @TableField(exist = false)
    private String description;
    /** 文件路径 */
    @TableField("file_path")
    private String filePath;
    /** 解析状态 */
    @TableField("parse_status")
    private Integer parseStatus;
    /** AI解析结果 */
    @TableField("parse_result")
    private String parseResult;
    /** 经验要求 */
    @TableField("experience")
    private String experience;
    /** 学历要求 */
    @TableField("education")
    private String education;
    /** 工作类型 */
    @TableField("job_type")
    private Integer jobType;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;
    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;
    /** 逻辑删除标记 */
    @TableField("deleted")
    private Boolean deleted;

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

    public String getLocationCity() {
        return locationCity;
    }

    public void setLocationCity(String locationCity) {
        this.locationCity = locationCity;
    }

    public String getLocationDistrict() {
        return locationDistrict;
    }

    public void setLocationDistrict(String locationDistrict) {
        this.locationDistrict = locationDistrict;
    }

    public String getLocationDetail() {
        return locationDetail;
    }

    public void setLocationDetail(String locationDetail) {
        this.locationDetail = locationDetail;
    }

    public Integer getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Integer salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Integer getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Integer salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getSalaryUnit() {
        return salaryUnit;
    }

    public void setSalaryUnit(String salaryUnit) {
        this.salaryUnit = salaryUnit;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(String preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}
