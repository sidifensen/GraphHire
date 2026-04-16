package com.graphhire.admin.application.command;

import java.util.List;

/**
 * 批量用户操作命令
 * 【模块说明】封装批量操作用户所需的参数
 */
public class BatchUserCmd {

    /** 待操作用户ID列表 */
    private List<Long> userIds;

    public BatchUserCmd() {
    }

    public BatchUserCmd(List<Long> userIds) {
        this.userIds = userIds;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}
