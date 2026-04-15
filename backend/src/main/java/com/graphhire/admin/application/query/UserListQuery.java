package com.graphhire.admin.application.query;

/**
 * Query for user list with pagination.
 */
public class UserListQuery {

    private Integer page = 1;
    private Integer pageSize = 20;
    private String userType;
    private String status;

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
}
