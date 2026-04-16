package com.graphhire.common.vo;

import java.util.List;

/**
 * 分页响应结果
 * 【模块说明】封装分页查询结果，包含记录列表、总数、页码信息、总页数
 * @param <T> 记录数据类型
 */
public class PageResult<T> {
    /** 当前页数据列表 */
    private List<T> records;
    /** 总记录数 */
    private Long total;
    /** 当前页码 */
    private Integer page;
    /** 每页记录数 */
    private Integer pageSize;
    /** 总页数 */
    private Integer totalPages;

    public PageResult() {
    }

    /**
     * 构造分页结果
     * @param records 当前页数据
     * @param total 总记录数
     * @param page 当前页码
     * @param pageSize 每页大小
     */
    public PageResult(List<T> records, Long total, Integer page, Integer pageSize) {
        this.records = records;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = (int) Math.ceil((double) total / pageSize);
    }

    public List<T> getRecords() {
        return records;
    }

    public void setRecords(List<T> records) {
        this.records = records;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
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

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
}
