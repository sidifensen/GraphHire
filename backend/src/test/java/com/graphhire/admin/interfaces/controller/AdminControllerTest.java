package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.admin.interfaces.dto.request.AdminBatchApproveRequest;
import com.graphhire.admin.interfaces.dto.request.AdminBatchDisableUserRequest;
import com.graphhire.admin.interfaces.dto.request.AdminBatchRejectRequest;
import com.graphhire.admin.interfaces.dto.request.AdminBatchRetryTaskRequest;
import com.graphhire.admin.interfaces.dto.request.AdminCompanyAuthUpdateRequest;
import com.graphhire.admin.interfaces.dto.request.AdminIndustryMoveRequest;
import com.graphhire.admin.interfaces.dto.request.AdminPositionTypeMoveRequest;
import com.graphhire.admin.interfaces.dto.request.AdminSkillTagUpsertRequest;
import com.graphhire.admin.interfaces.dto.request.UpdateUserStatusRequest;
import com.graphhire.admin.interfaces.dto.response.*;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.interfaces.dto.request.LoginRequest;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.industryskill.application.service.IndustrySkillProfileBootstrapService;
import com.graphhire.skill.domain.model.SkillTag;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminAppService adminAppService;

    @Mock
    private AuthAppService authAppService;

    @Mock
    private IndustrySkillProfileBootstrapService industrySkillProfileBootstrapService;

    @InjectMocks
    private AdminController adminController;

    @Nested
    @DisplayName("登录")
    class LoginTests {
        @Test
        @DisplayName("管理员登录成功")
        void adminLoginSuccess() {
            LoginRequest request = new LoginRequest();
            request.setUsername("admin");
            request.setPassword("password123");
            when(authAppService.adminLogin("admin", "password123"))
                .thenReturn(new LoginResponse("token", null, 3600L, UserType.ADMIN, 1L));

            var result = adminController.adminLogin(request);

            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("token", result.getData().getAccessToken());
        }
    }

    @Nested
    @DisplayName("仪表盘")
    class DashboardTests {
        @Test
        @DisplayName("返回新统计结构")
        void dashboardStatsSuccess() {
            DashboardStatsResponse response = new DashboardStatsResponse();
            response.setTotalUsers(10);
            response.setTotalCompanies(3);
            response.setTaskSuccessRate(95.0);
            when(adminAppService.getDashboardStats()).thenReturn(response);

            var result = adminController.getDashboardStats();

            assertEquals(200, result.getCode());
            assertEquals(10, result.getData().getTotalUsers());
            assertEquals(3, result.getData().getTotalCompanies());
            assertEquals(95.0, result.getData().getTaskSuccessRate());
        }

        @Test
        @DisplayName("按维度返回趋势数据")
        void dashboardTrendSuccess() {
            DashboardStatsResponse.TrendPoint point = new DashboardStatsResponse.TrendPoint("2026-04", 12, 3);
            when(adminAppService.getDashboardTrend("MONTH")).thenReturn(List.of(point));

            var result = adminController.getDashboardTrend("MONTH");

            assertEquals(200, result.getCode());
            assertEquals(1, result.getData().size());
            assertEquals("2026-04", result.getData().get(0).getDate());
        }
    }

    @Nested
    @DisplayName("企业审核")
    class CompanyAuthTests {
        @Test
        @DisplayName("分页列表")
        void companyAuthListSuccess() {
            AdminCompanyAuthItemResponse item = new AdminCompanyAuthItemResponse();
            item.setId(1L);
            item.setCompanyName("星河科技");
            AdminPageResponse<AdminCompanyAuthItemResponse> page = new AdminPageResponse<>(List.of(item), 1, 1, 10);
            when(adminAppService.getCompanyAuthList(any(), any(), anyInt(), anyInt())).thenReturn(page);

            var result = adminController.getCompanyAuthList("PENDING", "星河", 1, 10);

            assertEquals(200, result.getCode());
            assertEquals(1, result.getData().getTotal());
            verify(adminAppService).getCompanyAuthList("PENDING", "星河", 1, 10);
        }

        @Test
        @DisplayName("单个审核通过")
        void updateCompanyAuthApprove() {
            AdminCompanyAuthUpdateRequest request = new AdminCompanyAuthUpdateRequest();
            request.setStatus("APPROVED");

            var result = adminController.updateCompanyAuth(1L, request);

            assertEquals(200, result.getCode());
            verify(adminAppService).authCompany(eq(1L), any());
        }

        @Test
        @DisplayName("批量拒绝")
        void batchRejectSuccess() {
            AdminBatchRejectRequest request = new AdminBatchRejectRequest();
            request.setIds(List.of(1L, 2L));
            request.setReason("资料不完整");

            var result = adminController.batchRejectCompany(request);

            assertEquals(200, result.getCode());
            verify(adminAppService).batchRejectCompany(List.of(1L, 2L), "资料不完整");
        }
    }

    @Nested
    @DisplayName("行业")
    class IndustryTests {
        @Test
        @DisplayName("行业列表透传排序参数")
        void getIndustryListWithSortParams() {
            AdminPageResponse<AdminIndustryItemResponse> page = new AdminPageResponse<>(List.of(), 0, 1, 10);
            when(adminAppService.getIndustryList(any(), any(), any(), any(), anyInt(), anyInt())).thenReturn(page);

            var result = adminController.getIndustryList(1, "互联", "name", "desc", 1, 10);

            assertEquals(200, result.getCode());
            verify(adminAppService).getIndustryList(1, "互联", "name", "desc", 1, 10);
        }

        @Test
        @DisplayName("行业移动调用应用服务")
        void moveIndustrySuccess() {
            AdminIndustryMoveRequest request = new AdminIndustryMoveRequest();
            request.setDirection("UP");
            AdminIndustryItemResponse response = new AdminIndustryItemResponse();
            response.setId(1L);
            when(adminAppService.moveIndustry(1L, "UP")).thenReturn(response);

            var result = adminController.moveIndustry(1L, request);

            assertEquals(200, result.getCode());
            assertEquals(1L, result.getData().getId());
            verify(adminAppService).moveIndustry(1L, "UP");
        }
    }

    @Nested
    @DisplayName("职位类型")
    class PositionTypeTests {
        @Test
        @DisplayName("职位类型树查询参数透传")
        void getPositionTypeTreeSuccess() {
            AdminPositionTypeTreeItemResponse item = new AdminPositionTypeTreeItemResponse();
            item.setId(1000000L);
            item.setName("技术");
            when(adminAppService.getPositionTypeTree("Java", 1, 3)).thenReturn(List.of(item));

            var result = adminController.getPositionTypeTree("Java", 1, 3);

            assertEquals(200, result.getCode());
            assertEquals(1, result.getData().size());
            verify(adminAppService).getPositionTypeTree("Java", 1, 3);
        }

        @Test
        @DisplayName("职位类型移动调用应用服务")
        void movePositionTypeSuccess() {
            AdminPositionTypeMoveRequest request = new AdminPositionTypeMoveRequest();
            request.setDirection("UP");
            AdminPositionTypeTreeItemResponse response = new AdminPositionTypeTreeItemResponse();
            response.setId(1001000L);
            when(adminAppService.movePositionType(1001000L, "UP")).thenReturn(response);

            var result = adminController.movePositionType(1001000L, request);

            assertEquals(200, result.getCode());
            assertEquals(1001000L, result.getData().getId());
            verify(adminAppService).movePositionType(1001000L, "UP");
        }
    }

    @Nested
    @DisplayName("用户")
    class UserTests {
        @Test
        @DisplayName("分页列表")
        void userListSuccess() {
            AdminUserItemResponse item = new AdminUserItemResponse();
            item.setId(1L);
            item.setUsername("alice");
            AdminPageResponse<AdminUserItemResponse> page = new AdminPageResponse<>(List.of(item), 1, 1, 10);
            when(adminAppService.getUserList(any())).thenReturn(page);

            var result = adminController.getUserList("PERSON", "ACTIVE", "ali", 1, 10);

            assertEquals(200, result.getCode());
            assertEquals(1, result.getData().getList().size());
        }

        @Test
        @DisplayName("更新用户状态")
        void updateUserStatusSuccess() {
            UpdateUserStatusRequest request = new UpdateUserStatusRequest();
            request.setStatus("DISABLED");

            var result = adminController.modifyUserStatus(1L, request);

            assertEquals(200, result.getCode());
            verify(adminAppService).modifyUserStatus(1L, "DISABLED");
        }

        @Test
        @DisplayName("批量禁用")
        void batchDisableUsersSuccess() {
            AdminBatchDisableUserRequest request = new AdminBatchDisableUserRequest();
            request.setUserIds(List.of(1L, 2L));

            var result = adminController.batchDisableUser(request);

            assertEquals(200, result.getCode());
            verify(adminAppService).batchDisableUser(List.of(1L, 2L));
        }
    }

    @Nested
    @DisplayName("技能")
    class SkillTests {
        @Test
        @DisplayName("技能分页列表")
        void skillListSuccess() {
            AdminSkillItemResponse item = new AdminSkillItemResponse();
            item.setId(1L);
            item.setName("Java");
            AdminPageResponse<AdminSkillItemResponse> page = new AdminPageResponse<>(List.of(item), 1, 1, 10);
            when(adminAppService.getSkillList(any(), any(), anyInt(), anyInt())).thenReturn(page);

            var result = adminController.getSkillList("技术技能", "Java", 1, 10);

            assertEquals(200, result.getCode());
            assertEquals(1, result.getData().getTotal());
        }
    }

    @Nested
    @DisplayName("管理端标签")
    class AdminSkillTagManagementTests {
        @Test
        @DisplayName("创建标签")
        void createSkillTagSuccess() {
            AdminSkillTagUpsertRequest request = new AdminSkillTagUpsertRequest();
            request.setName("Go");
            request.setSynonyms(List.of("golang"));
            SkillTag tag = new SkillTag("Go");
            tag.setId(1L);
            when(adminAppService.createSkillTag(any())).thenReturn(tag);

            var result = adminController.createSkillTag(request);

            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals(1L, result.getData().getId());
            verify(adminAppService).createSkillTag(any());
        }

        @Test
        @DisplayName("更新标签")
        void updateSkillTagSuccess() {
            AdminSkillTagUpsertRequest request = new AdminSkillTagUpsertRequest();
            request.setName("GoLang");
            SkillTag tag = new SkillTag("GoLang");
            tag.setId(1L);
            when(adminAppService.updateSkillTag(eq(1L), any())).thenReturn(tag);

            var result = adminController.updateSkillTag(1L, request);

            assertEquals(200, result.getCode());
            assertEquals("GoLang", result.getData().getName());
            verify(adminAppService).updateSkillTag(eq(1L), any());
        }

        @Test
        @DisplayName("删除标签")
        void deleteSkillTagSuccess() {
            var result = adminController.deleteSkillTag(1L);

            assertEquals(200, result.getCode());
            verify(adminAppService).deleteSkillTag(1L);
        }

        @Test
        @DisplayName("添加同义词")
        void addSkillTagSynonymSuccess() {
            SkillTag tag = new SkillTag("Go");
            tag.setId(1L);
            when(adminAppService.addSkillTagSynonym(1L, "golang")).thenReturn(tag);

            var result = adminController.addSkillTagSynonym(1L, "golang");

            assertEquals(200, result.getCode());
            verify(adminAppService).addSkillTagSynonym(1L, "golang");
        }

        @Test
        @DisplayName("删除同义词")
        void removeSkillTagSynonymSuccess() {
            var result = adminController.removeSkillTagSynonym(1L, "golang");

            assertEquals(200, result.getCode());
            verify(adminAppService).removeSkillTagSynonym(1L, "golang");
        }
    }

    @Nested
    @DisplayName("任务")
    class TaskTests {
        @Test
        @DisplayName("任务列表带summary")
        void taskListSuccess() {
            AdminTaskListResponse response = new AdminTaskListResponse();
            AdminTaskSummaryResponse summary = new AdminTaskSummaryResponse();
            summary.setFailed(1);
            response.setSummary(summary);
            when(adminAppService.getTaskList(any(), any(), anyInt(), anyInt())).thenReturn(response);

            var result = adminController.getTaskList("RESUME_PARSE", "FAILED", 1, 10);

            assertEquals(200, result.getCode());
            assertEquals(1, result.getData().getSummary().getFailed());
        }

        @Test
        @DisplayName("单任务重试")
        void retryTaskSuccess() {
            var result = adminController.retryTask(10L);
            assertEquals(200, result.getCode());
            verify(adminAppService).retryTask(10L);
        }

        @Test
        @DisplayName("批量任务重试")
        void batchRetryTaskSuccess() {
            AdminBatchRetryTaskRequest request = new AdminBatchRetryTaskRequest();
            request.setTaskIds(List.of(10L, 11L));

            var result = adminController.batchRetryTask(request);
            assertEquals(200, result.getCode());
            verify(adminAppService).batchRetryTask(List.of(10L, 11L));
        }
    }

    @Test
    @DisplayName("批量通过公司")
    void batchApproveCompanySuccess() {
        AdminBatchApproveRequest request = new AdminBatchApproveRequest();
        request.setIds(List.of(1L, 2L));

        var result = adminController.batchApproveCompany(request);

        assertEquals(200, result.getCode());
        verify(adminAppService).batchApproveCompany(List.of(1L, 2L));
    }

    @Test
    @DisplayName("行业技能分类配置全量初始化")
    void bootstrapIndustrySkillProfilesSuccess() {
        when(industrySkillProfileBootstrapService.bootstrapAllLeafIndustries()).thenReturn(61);

        var result = adminController.bootstrapIndustrySkillProfiles();

        assertEquals(200, result.getCode());
        assertEquals(61, result.getData());
        verify(industrySkillProfileBootstrapService).bootstrapAllLeafIndustries();
    }

    @Test
    @DisplayName("行业技能分类配置单行业初始化")
    void bootstrapIndustrySkillProfileByIndustrySuccess() {
        var result = adminController.bootstrapIndustrySkillProfileByIndustry(12L);

        assertEquals(200, result.getCode());
        verify(industrySkillProfileBootstrapService).bootstrapByIndustryId(12L);
    }
}

