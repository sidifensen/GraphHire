package com.graphhire.application.application.service;

import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import com.graphhire.application.domain.repository.ApplicationRepository;
import com.graphhire.application.domain.repository.FavoriteRepository;
import com.graphhire.application.domain.repository.TalentPoolRepository;
import com.graphhire.application.interfaces.dto.response.PersonApplicationListItemResponse;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.resume.domain.repository.ResumeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationAppServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private FavoriteRepository favoriteRepository;
    @Mock
    private TalentPoolRepository talentPoolRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private NotificationAppService notificationAppService;

    @InjectMocks
    private ApplicationAppService applicationAppService;

    @Test
    @DisplayName("查询用户投递列表时返回职位名和企业名")
    void getUserApplicationList_shouldContainJobAndCompanyName() {
        Application application = new Application();
        application.setId(1L);
        application.setUserId(100L);
        application.setResumeId(10L);
        application.setJobId(20L);
        application.setCompanyId(30L);
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.of(2026, 4, 25, 16, 12, 32));

        Job job = new Job();
        job.setId(20L);
        job.setTitle("高级前端工程师");

        Company company = new Company();
        company.setId(30L);
        company.setName("图谱智聘科技");

        when(applicationRepository.findByUserId(100L)).thenReturn(List.of(application));
        when(jobRepository.findById(20L)).thenReturn(Optional.of(job));
        when(companyRepository.findById(30L)).thenReturn(Optional.of(company));

        List<PersonApplicationListItemResponse> list = applicationAppService.getUserApplicationList(100L);

        assertEquals(1, list.size());
        PersonApplicationListItemResponse item = list.get(0);
        assertEquals("高级前端工程师", item.getJobTitle());
        assertEquals("图谱智聘科技", item.getCompanyName());
        assertEquals("PENDING", item.getStatus());
    }

    @Test
    @DisplayName("职位或企业不存在时，投递列表字段允许为空")
    void getUserApplicationList_shouldAllowNullWhenReferencedDataMissing() {
        Application application = new Application();
        application.setId(2L);
        application.setUserId(101L);
        application.setResumeId(11L);
        application.setJobId(21L);
        application.setCompanyId(31L);

        when(applicationRepository.findByUserId(101L)).thenReturn(List.of(application));
        when(jobRepository.findById(21L)).thenReturn(Optional.empty());
        when(companyRepository.findById(31L)).thenReturn(Optional.empty());

        List<PersonApplicationListItemResponse> list = applicationAppService.getUserApplicationList(101L);

        assertEquals(1, list.size());
        PersonApplicationListItemResponse item = list.get(0);
        assertNull(item.getJobTitle());
        assertNull(item.getCompanyName());
    }
}
