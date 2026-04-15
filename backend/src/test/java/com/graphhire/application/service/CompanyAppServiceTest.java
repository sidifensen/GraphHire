package com.graphhire.application.service;

import com.graphhire.application.command.CreateStaffCmd;
import com.graphhire.application.command.UpdateCompanyProfileCmd;
import com.graphhire.application.dto.CompanyProfileResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.CompanyStaff;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.AuthStatus;
import com.graphhire.domain.vo.UserType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyAppServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyStaffRepository companyStaffRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private CompanyAppService companyAppService;

    @Nested
    @DisplayName("获取公司资料测试")
    class GetProfileTests {

        @Test
        @DisplayName("成功获取公司资料")
        void getProfile_Success() {
            // Given
            Long userId = 1L;
            User user = User.builder()
                    .id(userId)
                    .username("companyuser")
                    .email("company@example.com")
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .companyName("Test Company")
                    .unifiedSocialCreditCode("91110000XXXXXXXX")
                    .authStatus(AuthStatus.APPROVED)
                    .authTime(LocalDateTime.now())
                    .build();

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));

            // When
            CompanyProfileResponse response = companyAppService.getProfile(userId);

            // Then
            assertNotNull(response);
            assertEquals(1L, response.getId());
            assertEquals("companyuser", response.getUsername());
            assertEquals("Test Company", response.getCompanyName());
            assertEquals(AuthStatus.APPROVED, response.getAuthStatus());
        }

        @Test
        @DisplayName("公司信息不存在时失败")
        void getProfile_CompanyNotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> companyAppService.getProfile(userId));
            assertEquals("企业信息不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("更新公司资料测试")
    class UpdateProfileTests {

        @Test
        @DisplayName("成功更新公司资料")
        void updateProfile_Success() {
            // Given
            Long userId = 1L;
            UpdateCompanyProfileCmd cmd = new UpdateCompanyProfileCmd();
            cmd.setCompanyName("New Company Name");
            cmd.setLicensePath("/new/path/to/license.jpg");

            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .companyName("Old Company Name")
                    .build();

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(companyRepository.save(any(Company.class))).thenReturn(company);

            // When
            companyAppService.updateProfile(userId, cmd);

            // Then
            ArgumentCaptor<Company> companyCaptor = ArgumentCaptor.forClass(Company.class);
            verify(companyRepository).save(companyCaptor.capture());
            assertEquals("New Company Name", companyCaptor.getValue().getCompanyName());
            assertEquals("/new/path/to/license.jpg", companyCaptor.getValue().getLicensePath());
        }
    }

    @Nested
    @DisplayName("职位列表测试")
    class ListJobsTests {

        @Test
        @DisplayName("分页查询企业职位列表成功")
        void listJobs_Success() {
            // Given
            Long userId = 1L;
            Integer page = 1;
            Integer pageSize = 10;
            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();
            List<Job> jobs = Arrays.asList(
                    Job.builder().id(1L).jobTitle("Java Engineer").build(),
                    Job.builder().id(2L).jobTitle("Python Engineer").build()
            );

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(jobRepository.findByCompanyId(company.getId(), page, pageSize)).thenReturn(jobs);
            when(jobRepository.countByCompanyId(company.getId())).thenReturn(2L);

            // When
            PageResult<Job> result = companyAppService.listJobs(userId, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
            assertEquals(2L, result.getTotal());
        }
    }

    @Nested
    @DisplayName("创建员工测试")
    class CreateStaffTests {

        @Test
        @DisplayName("成功创建员工")
        void createStaff_Success() {
            // Given
            Long ownerUserId = 1L;
            CreateStaffCmd cmd = new CreateStaffCmd();
            cmd.setUsername("staff1");
            cmd.setPassword("password123");
            cmd.setEmail("staff1@company.com");
            cmd.setPost("Engineer");

            User owner = User.builder()
                    .id(ownerUserId)
                    .userType(UserType.COMPANY)
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .userId(ownerUserId)
                    .build();

            when(userRepository.findByIdOptional(ownerUserId)).thenReturn(Optional.of(owner));
            when(companyRepository.findByUserIdOptional(ownerUserId)).thenReturn(Optional.of(company));
            when(userRepository.existsByUsername("staff1")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(2L);
                return user;
            });
            when(companyStaffRepository.save(any(CompanyStaff.class))).thenAnswer(invocation -> {
                CompanyStaff staff = invocation.getArgument(0);
                staff.setId(1L);
                return staff;
            });

            // When
            companyAppService.createStaff(ownerUserId, cmd);

            // Then
            verify(userRepository).save(any(User.class));
            verify(companyStaffRepository).save(any(CompanyStaff.class));

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals("staff1", userCaptor.getValue().getUsername());
            assertEquals(UserType.COMPANY, userCaptor.getValue().getUserType());
        }

        @Test
        @DisplayName("非企业用户创建员工失败")
        void createStaff_NotCompanyUser_ThrowsException() {
            // Given
            Long ownerUserId = 1L;
            CreateStaffCmd cmd = new CreateStaffCmd();

            User owner = User.builder()
                    .id(ownerUserId)
                    .userType(UserType.PERSON)
                    .build();

            when(userRepository.findByIdOptional(ownerUserId)).thenReturn(Optional.of(owner));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> companyAppService.createStaff(ownerUserId, cmd));
            assertEquals("只有企业用户可以创建员工", exception.getMessage());
        }

        @Test
        @DisplayName("员工用户名已存在时失败")
        void createStaff_UsernameExists_ThrowsException() {
            // Given
            Long ownerUserId = 1L;
            CreateStaffCmd cmd = new CreateStaffCmd();
            cmd.setUsername("existinguser");

            User owner = User.builder()
                    .id(ownerUserId)
                    .userType(UserType.COMPANY)
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .userId(ownerUserId)
                    .build();

            when(userRepository.findByIdOptional(ownerUserId)).thenReturn(Optional.of(owner));
            when(companyRepository.findByUserIdOptional(ownerUserId)).thenReturn(Optional.of(company));
            when(userRepository.existsByUsername("existinguser")).thenReturn(true);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> companyAppService.createStaff(ownerUserId, cmd));
            assertEquals("用户名已存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("员工列表测试")
    class ListStaffTests {

        @Test
        @DisplayName("查询企业员工列表成功")
        void listStaff_Success() {
            // Given
            Long userId = 1L;
            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();
            List<CompanyStaff> staffList = Arrays.asList(
                    CompanyStaff.builder().id(1L).companyId(company.getId()).build(),
                    CompanyStaff.builder().id(2L).companyId(company.getId()).build()
            );

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(companyStaffRepository.findByCompanyId(company.getId())).thenReturn(staffList);

            // When
            PageResult<CompanyStaff> result = companyAppService.listStaff(userId);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
            assertEquals(2L, result.getTotal());
        }
    }
}
