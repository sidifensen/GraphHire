package com.graphhire.admin.interfaces.dto.request;

import java.util.ArrayList;
import java.util.List;

public class AdminBatchRejectRequest {
    private List<Long> ids = new ArrayList<>();
    private String reason;

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
