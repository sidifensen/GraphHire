package com.graphhire.admin.application.command;

import java.util.List;

/**
 * 批量公司操作命令
 * 【模块说明】封装批量操作公司所需的参数
 */
public class BatchCompanyCmd {

    /** 待操作公司ID列表 */
    private List<Long> ids;

    public BatchCompanyCmd() {
    }

    public BatchCompanyCmd(List<Long> ids) {
        this.ids = ids;
    }

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }
}
