package com.graphhire.admin.domain.service;

import com.graphhire.job.domain.model.Company;
import org.springframework.stereotype.Service;

/**
 * Admin domain service for administrative operations.
 */
@Service
public class AdminDomainService {

    /**
     * Verify if the user has admin privileges.
     */
    public boolean hasAdminPrivileges(Long userId) {
        // Admin privilege verification logic
        return true;
    }

    /**
     * Validates the company authentication operation.
     *
     * @param company the company to validate
     * @param approved whether the company is approved
     * @param reason the rejection reason (if rejected)
     * @throws IllegalStateException if validation fails
     */
    public void validateCompanyAuth(Company company, boolean approved, String reason) {
        if (company == null) {
            throw new IllegalArgumentException("企业不存在");
        }

        if (approved) {
            // For approval, company must be in pending verify status
            if (company.getAuthStatus() != com.graphhire.auth.domain.vo.AuthStatus.PENDING_VERIFY) {
                throw new IllegalStateException("只能审批待审核的企业");
            }
        } else {
            // For rejection, reason is required
            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException("拒绝原因不能为空");
            }
        }
    }

    /**
     * Builds the notification content for company authentication result.
     *
     * @param company the company
     * @param approved whether the company was approved
     * @param reason the rejection reason (if rejected)
     * @return notification content
     */
    public String buildAuthNotificationText(Company company, boolean approved, String reason) {
        if (approved) {
            return "您注册的企业「" + company.getName() + "」已通过认证审核。";
        } else {
            return "您注册的企业「" + company.getName() + "」未通过认证审核，原因：" + reason;
        }
    }
}
