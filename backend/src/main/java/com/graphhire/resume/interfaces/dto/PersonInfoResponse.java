package com.graphhire.resume.interfaces.dto;

public class PersonInfoResponse {
    private Long id;
    private Long userId;
    private String realName;
    private Integer gender;
    private Integer age;
    private String phone;
    private String education;
    private String city;
    private String targetCity;
    private Integer expectedSalary;
    private String avatarUrl;

    public PersonInfoResponse() {
    }

    public PersonInfoResponse(Long id, Long userId, String realName, Integer gender, Integer age,
                              String phone, String education, String city, String targetCity,
                              Integer expectedSalary, String avatarUrl) {
        this.id = id;
        this.userId = userId;
        this.realName = realName;
        this.gender = gender;
        this.age = age;
        this.phone = phone;
        this.education = education;
        this.city = city;
        this.targetCity = targetCity;
        this.expectedSalary = expectedSalary;
        this.avatarUrl = avatarUrl;
    }

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
