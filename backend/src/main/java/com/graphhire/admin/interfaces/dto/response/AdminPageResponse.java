package com.graphhire.admin.interfaces.dto.response;

import java.util.Collections;
import java.util.List;

/**
 * 管理端分页响应
 */
public class AdminPageResponse<T> {
    private List<T> list;
    private long total;
    private int page;
    private int pageSize;

    public AdminPageResponse() {
        this(Collections.emptyList(), 0, 1, 10);
    }

    public AdminPageResponse(List<T> list, long total, int page, int pageSize) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<T> getList() {
        return list;
    }

    public void setList(List<T> list) {
        this.list = list;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}
