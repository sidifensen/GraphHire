package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.admin.interfaces.dto.response.AdminUserDetailResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 管理端用户管理Controller
 * 提供用户相关的管理操作
 */
@RestController
@RequestMapping("/admin/user")
public class AdminUserController {

    @Autowired
    private AdminAppService adminAppService;

    /**
     * 获取用户详情
     * 包含用户基本信息和person_info表中的个人信息
     *
     * @param userId 用户ID
     * @return 用户详情
     */
    @GetMapping("/{userId}/detail")
    public Result<AdminUserDetailResponse> getUserDetail(@PathVariable Long userId) {
        return Result.success(adminAppService.getUserDetail(userId));
    }
}