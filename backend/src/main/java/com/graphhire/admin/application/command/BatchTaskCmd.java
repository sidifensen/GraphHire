package com.graphhire.admin.application.command;

import java.util.List;

/**
 * 批量任务操作命令
 * 【模块说明】封装批量操作任务所需的参数
 */
public class BatchTaskCmd {

    /** 待操作任务ID列表 */
    private List<Long> taskIds;

    public BatchTaskCmd() {
    }

    public BatchTaskCmd(List<Long> taskIds) {
        this.taskIds = taskIds;
    }

    public List<Long> getTaskIds() {
        return taskIds;
    }

    public void setTaskIds(List<Long> taskIds) {
        this.taskIds = taskIds;
    }
}
