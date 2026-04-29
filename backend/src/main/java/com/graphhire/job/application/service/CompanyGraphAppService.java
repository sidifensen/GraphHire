package com.graphhire.job.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.interfaces.dto.response.CompanyGraphResponse;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 企业图谱应用服务
 */
@Service
public class CompanyGraphAppService {

    private static final Logger log = LoggerFactory.getLogger(CompanyGraphAppService.class);

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillGraphClient skillGraphClient;

    public CompanyGraphResponse getCompanyGraph(Long currentCompanyId, Long requestedCompanyId) {
        Long targetCompanyId = resolveTargetCompanyId(currentCompanyId, requestedCompanyId);
        Company company = requireCompany(targetCompanyId);
        List<Job> jobs = jobRepository.findByCompanyId(targetCompanyId);

        log.info("查询企业图谱: currentCompanyId={}, targetCompanyId={}, jobCount={}",
            currentCompanyId, targetCompanyId, jobs.size());

        skillGraphClient.syncCompanyGraph(company, jobs);
        return skillGraphClient.getCompanyGraph(company, jobs);
    }

    private Long resolveTargetCompanyId(Long currentCompanyId, Long requestedCompanyId) {
        if (requestedCompanyId == null) {
            return currentCompanyId;
        }
        if (!requestedCompanyId.equals(currentCompanyId)) {
            throw new Exceptions.ForbiddenException("无权访问其他企业图谱");
        }
        return requestedCompanyId;
    }

    private Company requireCompany(Long companyId) {
        return companyRepository.findById(companyId)
            .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
    }
}
