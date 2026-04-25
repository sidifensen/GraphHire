package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseEntity;

/**
 * 人员信息领域模型
 * 存储候选人的个人信息，包括基本信息、求职意向等
 */
public class PersonInfo extends BaseEntity {
    /** 人员信息ID */
    private Long id;
    /** 用户ID */
    private Long userId;
    /** 真实姓名 */
    private String realName;
    /** 性别（0：未知，1：男，2：女） */
    private Integer gender;
    /** 年龄 */
    private Integer age;
    /** 联系电话 */
    private String phone;
    /** 邮箱 */
    private String email;
    /** 学历 */
    private String education;
    /** 学校 */
    private String school;
    /** 所在城市 */
    private String city;
    /** 目标城市（求职意向） */
    private String targetCity;
    /** 期望薪资 */
    private Integer expectedSalary;
    /** 头像URL */
    private String avatarUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public Integer getGender() {
        return gender;
    }

    public void setGender(Integer gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getTargetCity() {
        return targetCity;
    }

    public void setTargetCity(String targetCity) {
        this.targetCity = targetCity;
    }

    public Integer getExpectedSalary() {
        return expectedSalary;
    }

    public void setExpectedSalary(Integer expectedSalary) {
        this.expectedSalary = expectedSalary;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
