package com.graphhire.admin.interfaces.dto.response;

import java.util.ArrayList;
import java.util.List;

public class AdminTaskListResponse {
    private AdminTaskSummaryResponse summary = new AdminTaskSummaryResponse();
    private List<AdminTaskItemResponse> list = new ArrayList<>();
    private long total;
    private int page;
    private int pageSize;

    public AdminTaskSummaryResponse getSummary() { return summary; }
    public void setSummary(AdminTaskSummaryResponse summary) { this.summary = summary; }
    public List<AdminTaskItemResponse> getList() { return list; }
    public void setList(List<AdminTaskItemResponse> list) { this.list = list; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
