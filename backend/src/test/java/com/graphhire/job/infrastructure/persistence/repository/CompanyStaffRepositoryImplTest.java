package com.graphhire.job.infrastructure.persistence.repository;

import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.infrastructure.persistence.mapper.CompanyStaffMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyStaffPO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyStaffRepositoryImplTest {

    @Mock
    private CompanyStaffMapper companyStaffMapper;

    @InjectMocks
    private CompanyStaffRepositoryImpl companyStaffRepository;

    @Nested
    @DisplayName("findByUserId tests")
    class FindByUserIdTests {

        @Test
        @DisplayName("Should return CompanyStaff when found")
        void findByUserId_WhenExists_ReturnsCompanyStaff() {
            // Given
            Long userId = 1L;
            CompanyStaffPO po = createCompanyStaffPO(1L, 10L, userId, "OWNER");
            when(companyStaffMapper.selectOne(any())).thenReturn(po);

            // When
            Optional<CompanyStaff> result = companyStaffRepository.findByUserId(userId);

            // Then
            assertTrue(result.isPresent());
            assertEquals(userId, result.get().getUserId());
            assertEquals(10L, result.get().getCompanyId());
            assertEquals("OWNER", result.get().getPost());
        }

        @Test
        @DisplayName("Should return empty when not found")
        void findByUserId_WhenNotExists_ReturnsEmpty() {
            // Given
            Long userId = 999L;
            when(companyStaffMapper.selectOne(any())).thenReturn(null);

            // When
            Optional<CompanyStaff> result = companyStaffRepository.findByUserId(userId);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findByCompanyId tests")
    class FindByCompanyIdTests {

        @Test
        @DisplayName("Should return list of CompanyStaff when found")
        void findByCompanyId_WhenExists_ReturnsCompanyStaffs() {
            // Given
            Long companyId = 10L;
            List<CompanyStaffPO> pos = Arrays.asList(
                    createCompanyStaffPO(1L, companyId, 1L, "OWNER"),
                    createCompanyStaffPO(2L, companyId, 2L, "HR")
            );
            when(companyStaffMapper.selectList(any())).thenReturn(pos);

            // When
            List<CompanyStaff> result = companyStaffRepository.findByCompanyId(companyId);

            // Then
            assertEquals(2, result.size());
            assertEquals(companyId, result.get(0).getCompanyId());
            assertEquals("OWNER", result.get(0).getPost());
        }

        @Test
        @DisplayName("Should return empty list when not found")
        void findByCompanyId_WhenNotExists_ReturnsEmptyList() {
            // Given
            Long companyId = 999L;
            when(companyStaffMapper.selectList(any())).thenReturn(Collections.emptyList());

            // When
            List<CompanyStaff> result = companyStaffRepository.findByCompanyId(companyId);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("save tests")
    class SaveTests {

        @Test
        @DisplayName("Should insert new CompanyStaff when id is null")
        void save_WhenNew_InsertsAndSetsId() {
            // Given
            CompanyStaff staff = new CompanyStaff();
            staff.setCompanyId(10L);
            staff.setUserId(1L);
            staff.setPost("HR");

            // 模拟 MyBatis-Plus AUTO strategy 的 ID 回填行为
            doAnswer(invocation -> {
                CompanyStaffPO po = invocation.getArgument(0);
                po.setId(1L);
                return 1;
            }).when(companyStaffMapper).insert(any(CompanyStaffPO.class));

            // When
            CompanyStaff result = companyStaffRepository.save(staff);

            // Then
            assertNotNull(result.getId());
            assertEquals(1L, result.getId());
            verify(companyStaffMapper).insert(any(CompanyStaffPO.class));
        }

        @Test
        @DisplayName("Should update existing CompanyStaff when id is not null")
        void save_WhenExisting_Updates() {
            // Given
            CompanyStaff staff = new CompanyStaff();
            staff.setId(1L);
            staff.setCompanyId(10L);
            staff.setUserId(1L);
            staff.setPost("HR");

            // When
            CompanyStaff result = companyStaffRepository.save(staff);

            // Then
            assertEquals(1L, result.getId());
            verify(companyStaffMapper).updateById(any(CompanyStaffPO.class));
        }
    }

    @Nested
    @DisplayName("delete tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete CompanyStaff when id is not null")
        void delete_WhenIdNotNull_Deletes() {
            // Given
            CompanyStaff staff = new CompanyStaff();
            staff.setId(1L);

            // When
            companyStaffRepository.delete(staff);

            // Then
            verify(companyStaffMapper).deleteById(1L);
        }

        @Test
        @DisplayName("Should not delete when id is null")
        void delete_WhenIdNull_DoesNothing() {
            // Given
            CompanyStaff staff = new CompanyStaff();

            // When
            companyStaffRepository.delete(staff);

            // Then
            verify(companyStaffMapper, never()).deleteById(any(Long.class));
        }
    }

    private CompanyStaffPO createCompanyStaffPO(Long id, Long companyId, Long userId, String post) {
        CompanyStaffPO po = new CompanyStaffPO();
        po.setId(id);
        po.setCompanyId(companyId);
        po.setUserId(userId);
        po.setPost(post);
        return po;
    }
}
