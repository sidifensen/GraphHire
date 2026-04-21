package com.graphhire.admin.interfaces.dto.request;

import java.util.ArrayList;
import java.util.List;

public class AdminBatchDisableUserRequest {
    private List<Long> userIds = new ArrayList<>();

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}
