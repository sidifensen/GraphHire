package com.graphhire.common.vo;

/**
 * 分页查询参数
 * 【模块说明】提供分页查询所需的通用参数：页码、页大小、排序字段、排序方向
 */
public class PageQuery {
    /** 当前页码，从1开始 */
    private Integer page = 1;
    /** 每页记录数，默认10 */
    private Integer pageSize = 10;
    /** 排序字段名 */
    private String sortBy;
    /** 排序方向：asc-升序，desc-降序 */
    private String sortOrder = "asc";

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

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Long getOffset() {
        return (long) (page - 1) * pageSize;
    }
}
