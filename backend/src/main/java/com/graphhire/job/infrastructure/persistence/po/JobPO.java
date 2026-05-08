package com.graphhire.job.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.graphhire.job.infrastructure.persistence.typehandler.StringListArrayTypeHandler;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 职位持久化对象
 *
 * 【模块说明】与数据库job表结构一一对应，用于MyBatis-Plus CRUD操作。
 * 【数据表】job
 */
@TableName(value = "job", autoResultMap = true)
public class JobPO {
    /** 职位ID（主键，自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 所属企业ID */
    private Long companyId;
    /** 岗位负责人用户ID */
    @TableField("owner_user_id")
    private Long ownerUserId;
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
    /** 岗位技能数组 */
    @TableField(value = "skills", typeHandler = StringListArrayTypeHandler.class)
    private List<String> skills;
    /** 职位状态：0=草稿/下架 1=上架（发布中） */
    @TableField("status")
    private Integer status;
    /** 职位描述 */
    @TableField("description")
    private String description;
    /** 经验要求 */
    @TableField("experience")
    private String experience;
    /** 学历要求编码：1=中专 2=大专 3=本科 4=硕士 5=博士 */
    @TableField("education")
    private Integer education;
    /** 职位类型ID（关联 position_type.id） */
    @TableField("position_type_id")
    private Long positionTypeId;
    /** 工作类型：1=全职 2=兼职 3=实习 */
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
    @TableLogic
    private Integer deleted;

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

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(Long ownerUserId) {
        this.ownerUserId = ownerUserId;
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

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
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

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public Integer getEducation() {
        return education;
    }

    public void setEducation(Integer education) {
        this.education = education;
    }

    public Long getPositionTypeId() {
        return positionTypeId;
    }

    public void setPositionTypeId(Long positionTypeId) {
        this.positionTypeId = positionTypeId;
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

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }
}
