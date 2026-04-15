package com.graphhire.web.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class PageResponse<T> {
    private List<T> records;
    private Long total;
    private Integer page;
    private Integer pageSize;
    private Integer totalPages;

    public static <T> PageResponse<T> of(List<T> records, Long total, Integer page, Integer pageSize) {
        PageResponse<T> response = new PageResponse<>();
        response.setRecords(records);
        response.setTotal(total);
        response.setPage(page);
        response.setPageSize(pageSize);
        response.setTotalPages((int) Math.ceil((double) total / pageSize));
        return response;
    }
}
