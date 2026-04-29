package com.graphhire.job.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.interfaces.dto.response.CompanyGraphResponse;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyGraphAppServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private SkillGraphClient skillGraphClient;

    @InjectMocks
    private CompanyGraphAppService companyGraphAppService;

    @Test
    @DisplayName("未传 companyId 时返回当前企业图谱并先同步图数据库")
    void getCompanyGraph_WhenRequestedCompanyIdIsNull_UsesCurrentCompany() {
        Company company = new Company();
        company.setId(1L);
        company.setName("GraphHire");

        Job job = new Job();
        job.setId(101L);
        job.setCompanyId(1L);
        job.setTitle("Java工程师");
        job.setSkills(List.of("Java", "Spring Boot"));

        CompanyGraphResponse expected = new CompanyGraphResponse();
        expected.setCompanyId(1L);
        expected.setCompanyName("GraphHire");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(jobRepository.findByCompanyId(1L)).thenReturn(List.of(job));
        when(skillGraphClient.getCompanyGraph(company, List.of(job))).thenReturn(expected);

        CompanyGraphResponse actual = companyGraphAppService.getCompanyGraph(1L, null);

        assertSame(expected, actual);
        verify(skillGraphClient).syncCompanyGraph(company, List.of(job));
        verify(skillGraphClient).getCompanyGraph(company, List.of(job));
    }

    @Test
    @DisplayName("传入其他企业 ID 时拒绝访问")
    void getCompanyGraph_WhenRequestedCompanyIdMismatchesCurrent_ThrowsForbidden() {
        Exceptions.ForbiddenException exception = assertThrows(
            Exceptions.ForbiddenException.class,
            () -> companyGraphAppService.getCompanyGraph(1L, 2L)
        );

        assertEquals("无权访问其他企业图谱", exception.getMessage());
    }

    @Test
    @DisplayName("企业不存在时抛出参数异常")
    void getCompanyGraph_WhenCompanyMissing_ThrowsIllegalArgumentException() {
        when(companyRepository.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> companyGraphAppService.getCompanyGraph(1L, 1L)
        );

        assertEquals("企业不存在", exception.getMessage());
    }
}
