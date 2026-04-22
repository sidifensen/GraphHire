package com.graphhire.admin.interfaces.dto.request;

import java.util.ArrayList;
import java.util.List;

public class AdminBatchRetryTaskRequest {
    private List<Long> taskIds = new ArrayList<>();

    public List<Long> getTaskIds() {
        return taskIds;
    }

    public void setTaskIds(List<Long> taskIds) {
        this.taskIds = taskIds;
    }
}
