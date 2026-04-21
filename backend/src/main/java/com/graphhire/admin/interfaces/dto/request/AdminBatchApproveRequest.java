package com.graphhire.admin.interfaces.dto.request;

import java.util.ArrayList;
import java.util.List;

public class AdminBatchApproveRequest {
    private List<Long> ids = new ArrayList<>();

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }
}
