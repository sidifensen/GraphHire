package com.graphhire.admin.application.query;

/**
 * 用户列表查询参数
 */
public class UserListQuery {

    private Integer page = 1;
    private Integer pageSize = 20;
    /** PERSON / COMPANY / ADMIN */
    private String userType;
    /** ACTIVE / DISABLED / LOCKED 或 AuthStatus 名称 */
    private String status;
    /** 关键字：用户名/邮箱/手机号 */
    private String keyword;

    public UserListQuery() {
    }

    public UserListQuery(Integer page, Integer pageSize, String userType, String status) {
        this.page = page;
        this.pageSize = pageSize;
        this.userType = userType;
        this.status = status;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
