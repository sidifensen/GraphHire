package com.graphhire.resume.interfaces.dto.request;

public class PersonUpdateRequest {
    private String realName;
    private Integer gender;
    private Integer age;
    private String phone;
    private String email;
    private String education;
    private String school;
    private String city;
    private String targetCity;
    private Integer expectedSalary;
    private java.util.List<Long> expectedPositionTypeIds;
    private Long defaultPositionTypeId;

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

    public java.util.List<Long> getExpectedPositionTypeIds() {
        return expectedPositionTypeIds;
    }

    public void setExpectedPositionTypeIds(java.util.List<Long> expectedPositionTypeIds) {
        this.expectedPositionTypeIds = expectedPositionTypeIds;
    }

    public Long getDefaultPositionTypeId() {
        return defaultPositionTypeId;
    }

    public void setDefaultPositionTypeId(Long defaultPositionTypeId) {
        this.defaultPositionTypeId = defaultPositionTypeId;
    }
}
