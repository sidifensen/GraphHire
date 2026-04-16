package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.command.BatchCompanyCmd;
import com.graphhire.admin.application.command.BatchTaskCmd;
import com.graphhire.admin.application.command.BatchUserCmd;
import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 批量操作接口
 * 提供管理员批量审批企业、批量禁用用户、批量重试任务等功能
 */
@RestController
@RequestMapping("/admin")
public class BatchOperationController {

    @Autowired
    private AdminAppService adminAppService;

    /**
     * 批量审批通过公司
     * @param cmd 批量公司操作命令（包含公司ID列表）
     * @return 操作结果
     */
    @PostMapping("/company/batch/approve")
    public Result<Void> batchApproveCompany(@RequestBody BatchCompanyCmd cmd) {
        adminAppService.batchApproveCompany(cmd.getIds());
        return Result.success();
    }

    /**
     * 批量拒绝公司
     * @param cmd 批量公司操作命令（包含公司ID列表）
     * @return 操作结果
     */
    @PostMapping("/company/batch/reject")
    public Result<Void> batchRejectCompany(@RequestBody BatchCompanyCmd cmd) {
        adminAppService.batchRejectCompany(cmd.getIds());
        return Result.success();
    }

    /**
     * 批量禁用用户
     * @param cmd 批量用户操作命令（包含用户ID列表）
     * @return 操作结果
     */
    @PostMapping("/user/batch/disable")
    public Result<Void> batchDisableUser(@RequestBody BatchUserCmd cmd) {
        adminAppService.batchDisableUser(cmd.getUserIds());
        return Result.success();
    }

    /**
     * 批量重试任务
     * @param cmd 批量任务操作命令（包含任务ID列表）
     * @return 操作结果
     */
    @PostMapping("/task/batch/retry")
    public Result<Void> batchRetryTask(@RequestBody BatchTaskCmd cmd) {
        adminAppService.batchRetryTask(cmd.getTaskIds());
        return Result.success();
    }
}
