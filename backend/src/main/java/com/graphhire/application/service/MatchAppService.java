package com.graphhire.application.service;

import com.graphhire.application.dto.MatchDetailResponse;
import com.graphhire.application.dto.MatchListResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.MatchRecord;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.MatchRecordRepository;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.service.MatchDomainService;
import com.graphhire.domain.vo.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchAppService {
    private final MatchRecordRepository matchRecordRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final PersonRepository personRepository;
    private final CompanyRepository companyRepository;
    private final NotificationRepository notificationRepository;
    private final MatchDomainService matchDomainService;

    public PageResult<MatchListResponse> recommendJobs(Long userId, Integer page, Integer pageSize) {
        log.info("Recommending jobs for userId: {}, page: {}, pageSize: {}", userId, page, pageSize);

        // Get person's default resume
        Resume defaultResume = resumeRepository.findDefaultByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("请先上传简历"));

        // Get all published jobs
        List<Job> publishedJobs = jobRepository.findByJobStatus(
                com.graphhire.domain.vo.JobStatus.PUBLISHED, 1, Integer.MAX_VALUE);

        List<MatchListResponse> matches = new ArrayList<>();

        for (Job job : publishedJobs) {
            // Calculate match score
            MatchRecord record = calculateMatch(defaultResume, job);
            if (record != null && record.getOverallScore().doubleValue() > 50) {
                Company company = companyRepository.findByIdOptional(job.getCompanyId()).orElse(null);

                matches.add(MatchListResponse.builder()
                        .matchRecordId(record.getId())
                        .resumeId(defaultResume.getId())
                        .jobId(job.getId())
                        .jobTitle(job.getJobTitle())
                        .companyName(company != null ? company.getCompanyName() : "")
                        .overallScore(record.getOverallScore())
                        .matchReason(record.getMatchReport())
                        .createdAt(record.getCreatedAt())
                        .build());
            }
        }

        // Sort by score and paginate
        matches.sort((a, b) -> b.getOverallScore().compareTo(a.getOverallScore()));

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, matches.size());

        List<MatchListResponse> pagedList = start < matches.size()
                ? matches.subList(start, end) : new ArrayList<>();

        int totalPages = (int) Math.ceil((double) matches.size() / pageSize);

        return PageResult.<MatchListResponse>builder()
                .records(pagedList)
                .total((long) matches.size())
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    public PageResult<MatchListResponse> recommendCandidates(Long userId, Long jobId, Integer page, Integer pageSize) {
        log.info("Recommending candidates for jobId: {}, page: {}, pageSize: {}", jobId, page, pageSize);

        // Get job
        Job job = jobRepository.findByIdOptional(jobId)
                .orElseThrow(() -> new RuntimeException("职位不存在"));

        // Verify ownership
        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));
        if (!job.getCompanyId().equals(company.getId())) {
            throw new RuntimeException("无权限查看此职位的候选人");
        }

        // Get all default resumes
        List<Resume> resumes = resumeRepository.findAllDefaultResumes();

        List<MatchListResponse> matches = new ArrayList<>();

        for (Resume resume : resumes) {
            MatchRecord record = calculateMatch(resume, job);
            if (record != null && record.getOverallScore().doubleValue() > 50) {
                Person person = personRepository.findByUserIdOptional(resume.getUserId()).orElse(null);

                matches.add(MatchListResponse.builder()
                        .matchRecordId(record.getId())
                        .resumeId(resume.getId())
                        .jobId(job.getId())
                        .jobTitle(job.getJobTitle())
                        .companyName(company.getCompanyName())
                        .overallScore(record.getOverallScore())
                        .matchReason(record.getMatchReport())
                        .createdAt(record.getCreatedAt())
                        .build());
            }
        }

        // Sort by score and paginate
        matches.sort((a, b) -> b.getOverallScore().compareTo(a.getOverallScore()));

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, matches.size());

        List<MatchListResponse> pagedList = start < matches.size()
                ? matches.subList(start, end) : new ArrayList<>();

        int totalPages = (int) Math.ceil((double) matches.size() / pageSize);

        return PageResult.<MatchListResponse>builder()
                .records(pagedList)
                .total((long) matches.size())
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    public MatchDetailResponse getMatchDetail(Long matchRecordId) {
        log.info("Getting match detail: matchRecordId={}", matchRecordId);

        MatchRecord record = matchRecordRepository.findByIdOptional(matchRecordId)
                .orElseThrow(() -> new RuntimeException("匹配记录不存在"));

        return MatchDetailResponse.builder()
                .matchRecordId(record.getId())
                .resumeId(record.getResumeId())
                .jobId(record.getJobId())
                .overallScore(record.getOverallScore())
                .skillScore(record.getSkillScore())
                .experienceScore(record.getExperienceScore())
                .cityScore(record.getCityScore())
                .educationScore(record.getEducationScore())
                .salaryScore(record.getSalaryScore())
                .matchReport(record.getMatchReport())
                .createdAt(record.getCreatedAt())
                .build();
    }

    @Transactional
    public void markAsRead(Long matchRecordId) {
        log.info("Marking match as read: matchRecordId={}", matchRecordId);

        MatchRecord record = matchRecordRepository.findByIdOptional(matchRecordId)
                .orElseThrow(() -> new RuntimeException("匹配记录不存在"));

        record.setStatus(1); // Read status
        matchRecordRepository.save(record);

        log.info("Match marked as read");
    }

    private MatchRecord calculateMatch(Resume resume, Job job) {
        // Get person profile
        Person person = personRepository.findByUserIdOptional(resume.getUserId()).orElse(null);
        if (person == null) {
            return null;
        }

        // Get job skills
        List<String> personSkills = extractSkillsFromParseResult(resume.getParseResult());
        List<String> jobSkills = extractSkillsFromJob(job);

        // Calculate individual scores
        java.math.BigDecimal skillScore = matchDomainService.calculateSkillScore(personSkills, jobSkills);
        java.math.BigDecimal experienceScore = matchDomainService.calculateExperienceScore(
                person.getAge() != null ? person.getAge() - 22 : null, job.getExperienceRequired());
        java.math.BigDecimal cityScore = matchDomainService.calculateCityScore(
                person.getTargetCity(), job.getCity());
        java.math.BigDecimal educationScore = matchDomainService.calculateEducationScore(
                person.getEducation(), job.getEducationRequired());
        java.math.BigDecimal salaryScore = matchDomainService.calculateSalaryScore(
                person.getExpectedSalary(), job.getSalaryMin(), job.getSalaryMax());

        // Calculate overall score
        java.math.BigDecimal overallScore = matchDomainService.calculateOverallScore(
                skillScore, experienceScore, cityScore, educationScore, salaryScore);

        // Build match report
        String matchReport = buildMatchReport(skillScore, experienceScore, cityScore,
                educationScore, salaryScore, personSkills, jobSkills);

        // Save match record
        MatchRecord record = MatchRecord.builder()
                .resumeId(resume.getId())
                .jobId(job.getId())
                .overallScore(overallScore)
                .skillScore(skillScore)
                .experienceScore(experienceScore)
                .cityScore(cityScore)
                .educationScore(educationScore)
                .salaryScore(salaryScore)
                .matchReport(matchReport)
                .status(0) // Unread
                .createdAt(LocalDateTime.now())
                .build();
        matchRecordRepository.save(record);

        return record;
    }

    private List<String> extractSkillsFromParseResult(String parseResult) {
        // In production, parse the JSON result to extract skills
        // For now, return empty list
        return new ArrayList<>();
    }

    private List<String> extractSkillsFromJob(Job job) {
        // In production, get skills from job_skills table
        return new ArrayList<>();
    }

    private String buildMatchReport(java.math.BigDecimal skillScore, java.math.BigDecimal experienceScore,
                                    java.math.BigDecimal cityScore, java.math.BigDecimal educationScore,
                                    java.math.BigDecimal salaryScore,
                                    List<String> personSkills, List<String> jobSkills) {
        StringBuilder sb = new StringBuilder();
        sb.append("技能匹配度: ").append(skillScore.intValue()).append("%");
        sb.append("\n经验匹配度: ").append(experienceScore.intValue()).append("%");
        sb.append("\n城市匹配度: ").append(cityScore.intValue()).append("%");
        sb.append("\n学历匹配度: ").append(educationScore.intValue()).append("%");
        sb.append("\n薪资匹配度: ").append(salaryScore.intValue()).append("%");
        return sb.toString();
    }
}
