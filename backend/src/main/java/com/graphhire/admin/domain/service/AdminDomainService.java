package com.graphhire.admin.domain.service;

import com.graphhire.job.domain.model.Company;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import org.springframework.stereotype.Service;

/**
 * 管理员领域服务
 * 【模块说明】提供管理员操作相关的领域逻辑：权限校验、企业认证审批验证、通知内容构建
 * 【业务规则】
 * - 企业认证审批：只能审批待审核状态的企业
 * - 企业认证拒绝：必须提供拒绝原因
 */
@Service
public class AdminDomainService {
    private final UserRepository userRepository;

    public AdminDomainService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 校验用户是否具有管理员权限
     * 【功能说明】验证指定用户是否具备管理员特权
     * @param userId 待校验的用户ID
     * @return true-具有管理员权限，false-不具有
     */
    public boolean hasAdminPrivileges(Long userId) {
        if (userId == null) {
            return false;
        }
        return userRepository.findById(userId)
                .map(user -> user.getUserType() == UserType.ADMIN)
                .orElse(false);
    }

    /**
     * 校验企业认证操作的有效性
     * 【功能说明】验证企业认证审批的参数是否符合业务规则
     * 【业务步骤】
     * 步骤1：校验企业是否存在，不存在则抛异常
     * 步骤2：若审批通过，校验企业必须是待审核状态
     * 步骤3：若审批拒绝，校验拒绝原因不能为空
     * @param company 待审批企业
     * @param approved 是否通过
     * @param reason 拒绝原因（拒绝时必填）
     * @throws IllegalArgumentException 企业不存在
     * @throws IllegalStateException 业务状态校验失败
     */
    public void validateCompanyAuth(Company company, boolean approved, String reason) {
        // 步骤1：校验企业是否存在
        if (company == null) {
            throw new IllegalArgumentException("企业不存在");
        }

        if (approved) {
            // 步骤2：审批通过时，企业必须是待审核状态
            if (company.getAuthStatus() != com.graphhire.auth.domain.vo.AuthStatus.PENDING_VERIFY) {
                throw new IllegalStateException("只能审批待审核的企业");
            }
        } else {
            // 步骤3：审批拒绝时，拒绝原因不能为空
            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException("拒绝原因不能为空");
            }
        }
    }

    /**
     * 构建企业认证结果通知文本
     * 【功能说明】根据认证结果生成友好的通知消息
     * @param company 相关企业
     * @param approved 认证结果
     * @param reason 拒绝原因（认证拒绝时）
     * @return 通知文本内容
     */
    public String buildAuthNotificationText(Company company, boolean approved, String reason) {
        if (approved) {
            return "您注册的企业「" + company.getName() + "」已通过认证审核。";
        } else {
            return "您注册的企业「" + company.getName() + "」未通过认证审核，原因：" + reason;
        }
    }
}
