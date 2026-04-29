package com.graphhire.job.application.service;

import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyAppServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyStaffRepository companyStaffRepository;

    @InjectMocks
    private CompanyAppService companyAppService;

    @Test
    @DisplayName("创建企业时初始化为待审核状态")
    void createCompany_ShouldSetPendingVerifyStatus() {
        when(companyRepository.findByName("GraphHire")).thenReturn(Optional.empty());
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Company company = companyAppService.createCompany(
            "GraphHire",
            "911100000000000000",
            "license-path",
            "Alice",
            "13800138000",
            "alice@graphhire.com"
        );

        assertEquals(AuthStatus.PENDING_VERIFY, company.getAuthStatus());
        assertEquals("GraphHire", company.getName());
        verify(companyRepository).save(any(Company.class));
    }

    @Test
    @DisplayName("通过用户读取企业时若企业记录缺失则抛业务异常")
    void getCompanyByUserId_WhenCompanyMissing_ThrowsBusinessException() {
        CompanyStaff staff = new CompanyStaff();
        staff.setUserId(99L);
        staff.setCompanyId(100L);

        when(companyStaffRepository.findByUserId(99L)).thenReturn(Optional.of(staff));
        when(companyRepository.findById(100L)).thenReturn(Optional.empty());

        Exceptions.BusinessException exception = assertThrows(
            Exceptions.BusinessException.class,
            () -> companyAppService.getCompanyByUserId(99L)
        );

        assertEquals("企业不存在", exception.getMessage());
    }

    @Test
    @DisplayName("更新企业头像路径时返回持久化后的企业")
    void updateCompanyAvatarPath_ShouldPersistAvatarPath() {
        Company company = new Company();
        company.setId(1L);
        company.setAvatarPath("old-path");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(company)).thenReturn(company);

        Company updated = companyAppService.updateCompanyAvatarPath(1L, "avatar/new-path.png");

        assertSame(company, updated);
        assertEquals("avatar/new-path.png", updated.getAvatarPath());
        verify(companyRepository).save(company);
    }
}
