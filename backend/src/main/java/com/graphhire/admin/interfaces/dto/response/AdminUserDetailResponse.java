package com.graphhire.admin.interfaces.dto.response;

/**
 * 管理端用户详情响应DTO
 * 包含用户基本信息和个人信息
 */
public class AdminUserDetailResponse {
    private UserItem user;
    private PersonInfoDetail personInfo;

    public UserItem getUser() {
        return user;
    }

    public void setUser(UserItem user) {
        this.user = user;
    }

    public PersonInfoDetail getPersonInfo() {
        return personInfo;
    }

    public void setPersonInfo(PersonInfoDetail personInfo) {
        this.personInfo = personInfo;
    }

    /**
     * 用户基本信息项
     */
    public static class UserItem {
        private Long id;
        private String username;
        private String email;
        private String phone;
        private String type;
        private String status;
        private String createdAt;
        private String lastLoginAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }

        public String getLastLoginAt() {
            return lastLoginAt;
        }

        public void setLastLoginAt(String lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }
    }

    /**
     * 个人信息详情
     */
    public static class PersonInfoDetail {
        private Long id;
        private Long userId;
        private String realName;
        private Integer gender;
        private Integer age;
        private String phone;
        private String email;
        private String education;
        private String city;
        private String targetCity;
        private Integer expectedSalary;

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

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
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
    }
}