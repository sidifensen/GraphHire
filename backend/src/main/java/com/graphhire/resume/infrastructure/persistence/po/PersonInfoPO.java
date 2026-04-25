package com.graphhire.resume.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 人员信息持久化对象
 * 对应数据库 person_info 表
 */
@TableName("person_info")
public class PersonInfoPO {
    /** 人员信息ID（自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 用户ID */
    @TableField("user_id")
    private Long userId;
    /** 真实姓名 */
    @TableField("real_name")
    private String realName;
    /** 性别（0：未知，1：男，2：女） */
    @TableField("gender")
    private Integer gender;
    /** 年龄 */
    @TableField("age")
    private Integer age;
    /** 学历 */
    @TableField("education")
    private String education;
    /** 所在城市 */
    @TableField("city")
    private String city;
    /** 目标城市（求职意向） */
    @TableField("target_city")
    private String targetCity;
    /** 联系电话 */
    @TableField("phone")
    private String phone;
    /** 邮箱 */
    @TableField("email")
    private String email;
    /** 学校 */
    @TableField("school")
    private String school;
    /** 期望薪资 */
    @TableField("expected_salary")
    private Integer expectedSalary;
    /** 头像存储路径 */
    @TableField("avatar_url")
    private String avatarUrl;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;
    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;
    /** 逻辑删除标记 */
    @TableField("deleted")
    private Boolean deleted;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRealName() { return realName; }
    public void setRealName(String realName) { this.realName = realName; }

    public Integer getGender() { return gender; }
    public void setGender(Integer gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getTargetCity() { return targetCity; }
    public void setTargetCity(String targetCity) { this.targetCity = targetCity; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public Integer getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(Integer expectedSalary) { this.expectedSalary = expectedSalary; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }

    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }
}
