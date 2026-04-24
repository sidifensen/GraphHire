package com.graphhire.job.infrastructure.persistence.repository;

import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.infrastructure.persistence.mapper.CompanyMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyPO;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyRepositoryImplTest {

    @Mock
    private CompanyMapper companyMapper;

    @InjectMocks
    private CompanyRepositoryImpl companyRepository;

    @Nested
    @DisplayName("findById tests")
    class FindByIdTests {

        @Test
        @DisplayName("Should return Company when found")
        void findById_WhenExists_ReturnsCompany() {
            // Given
            Long id = 1L;
            CompanyPO po = createCompanyPO(id, "Test Company", "91110000XXXXXXXX", 1);
            when(companyMapper.selectById(id)).thenReturn(po);

            // When
            Optional<Company> result = companyRepository.findById(id);

            // Then
            assertTrue(result.isPresent());
            assertEquals(id, result.get().getId());
            assertEquals("Test Company", result.get().getName());
            assertEquals("91110000XXXXXXXX", result.get().getUnifiedSocialCreditCode());
        }

        @Test
        @DisplayName("Should return empty when not found")
        void findById_WhenNotExists_ReturnsEmpty() {
            // Given
            Long id = 999L;
            when(companyMapper.selectById(id)).thenReturn(null);

            // When
            Optional<Company> result = companyRepository.findById(id);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findByUnifiedSocialCreditCode tests")
    class FindByUnifiedSocialCreditCodeTests {

        @Test
        @DisplayName("Should return Company when code matches")
        void findByUnifiedSocialCreditCode_WhenExists_ReturnsCompany() {
            // Given
            String code = "91110000XXXXXXXX";
            CompanyPO po = createCompanyPO(1L, "Test Company", code, 1);
            when(companyMapper.selectOne(any())).thenReturn(po);

            // When
            Optional<Company> result = companyRepository.findByUnifiedSocialCreditCode(code);

            // Then
            assertTrue(result.isPresent());
            assertEquals(code, result.get().getUnifiedSocialCreditCode());
        }

        @Test
        @DisplayName("Should return empty when no match")
        void findByUnifiedSocialCreditCode_WhenNotExists_ReturnsEmpty() {
            // Given
            String code = "99999999XXXXXXXX";
            when(companyMapper.selectOne(any())).thenReturn(null);

            // When
            Optional<Company> result = companyRepository.findByUnifiedSocialCreditCode(code);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findByAuthStatus tests")
    class FindByAuthStatusTests {

        @Test
        @DisplayName("Should return list of Companies with matching status")
        void findByAuthStatus_WhenExists_ReturnsCompanies() {
            // Given
            List<CompanyPO> pos = Arrays.asList(
                    createCompanyPO(1L, "Company A", "91110000A", 0),
                    createCompanyPO(2L, "Company B", "91110000B", 0)
            );
            when(companyMapper.selectList(any())).thenReturn(pos);

            // When
            List<Company> result = companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY);

            // Then
            assertEquals(2, result.size());
            assertEquals(AuthStatus.PENDING_VERIFY, result.get(0).getAuthStatus());
        }

        @Test
        @DisplayName("Should return empty list when no match")
        void findByAuthStatus_WhenNotExists_ReturnsEmptyList() {
            // Given
            when(companyMapper.selectList(any())).thenReturn(Collections.emptyList());

            // When
            List<Company> result = companyRepository.findByAuthStatus(AuthStatus.VERIFIED);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("save tests")
    class SaveTests {

        @Test
        @DisplayName("Should insert new Company when id is null")
        void save_WhenNew_InsertsAndSetsId() {
            // Given
            Company company = new Company();
            company.setName("New Company");
            company.setUnifiedSocialCreditCode("91110000XXXXXXXX");
            company.setAuthStatus(AuthStatus.PENDING_VERIFY);

            doAnswer(invocation -> {
                CompanyPO po = invocation.getArgument(0);
                po.setId(1L);
                return 1;
            }).when(companyMapper).insert(any(CompanyPO.class));

            // When
            Company result = companyRepository.save(company);

            // Then
            assertNotNull(result.getId());
            verify(companyMapper).insert(any(CompanyPO.class));
        }

        @Test
        @DisplayName("Should update existing Company when id is not null")
        void save_WhenExisting_Updates() {
            // Given
            Company company = new Company();
            company.setId(1L);
            company.setName("Updated Company");
            company.setUnifiedSocialCreditCode("91110000XXXXXXXX");
            company.setAuthStatus(AuthStatus.VERIFIED);

            // When
            Company result = companyRepository.save(company);

            // Then
            assertEquals(1L, result.getId());
            verify(companyMapper).updateById(any(CompanyPO.class));
        }
    }

    @Nested
    @DisplayName("delete tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete Company when id is not null")
        void delete_WhenIdNotNull_Deletes() {
            // Given
            Company company = new Company();
            company.setId(1L);

            // When
            companyRepository.delete(company);

            // Then
            verify(companyMapper).deleteById(1L);
        }

        @Test
        @DisplayName("Should not delete when id is null")
        void delete_WhenIdNull_DoesNothing() {
            // Given
            Company company = new Company();

            // When
            companyRepository.delete(company);

            // Then
            verify(companyMapper, never()).deleteById(any(Long.class));
        }
    }

    @Nested
    @DisplayName("countByAuthStatus tests")
    class CountByAuthStatusTests {

        @Test
        @DisplayName("Should return count of Companies with matching status")
        void countByAuthStatus_WhenExists_ReturnsCount() {
            // Given
            when(companyMapper.selectCount(any())).thenReturn(5L);

            // When
            long result = companyRepository.countByAuthStatus(AuthStatus.VERIFIED);

            // Then
            assertEquals(5L, result);
        }

        @Test
        @DisplayName("Should return zero when no match")
        void countByAuthStatus_WhenNotExists_ReturnsZero() {
            // Given
            when(companyMapper.selectCount(any())).thenReturn(0L);

            // When
            long result = companyRepository.countByAuthStatus(AuthStatus.LOCKED);

            // Then
            assertEquals(0L, result);
        }
    }

    private CompanyPO createCompanyPO(Long id, String companyName, String unifiedSocialCreditCode, Integer authStatus) {
        CompanyPO po = new CompanyPO();
        po.setId(id);
        po.setCompanyName(companyName);
        po.setUnifiedSocialCreditCode(unifiedSocialCreditCode);
        po.setAuthStatus(authStatus);
        return po;
    }
}
