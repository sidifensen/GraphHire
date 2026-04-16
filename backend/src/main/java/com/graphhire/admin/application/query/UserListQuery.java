package com.graphhire.admin.application.query;

/**
 * 用户列表查询参数
 * 【模块说明】封装用户分页查询条件：页码、页大小、用户类型、账号状态
 */
public class UserListQuery {

    /** 当前页码，从1开始 */
    private Integer page = 1;
    /** 每页记录数，默认20 */
    private Integer pageSize = 20;
    /** 用户类型筛选：PERSON-个人用户，COMPANY-企业用户 */
    private String userType;
    /** 账号状态筛选 */
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
