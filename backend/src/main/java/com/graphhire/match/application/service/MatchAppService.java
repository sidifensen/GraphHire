package com.graphhire.match.application.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.match.application.command.TriggerMatchCmd;
import com.graphhire.match.application.query.MatchDetailQuery;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.service.MatchDomainService;
import com.graphhire.match.iface.dto.response.MatchDetailResponse;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchAppService {

    @Autowired
    private MatchRecordRepository matchRecordRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private MatchDomainService matchDomainService;

    @Autowired
    private NotificationAppService notificationAppService;

    @Transactional
    public MatchRecord triggerMatch(TriggerMatchCmd cmd) {
        MatchRecord matchRecord = matchDomainService.calculateMatch(cmd.getResumeId(), cmd.getJobId());
        return matchRecordRepository.save(matchRecord);
    }

    /**
     * Trigger matching for a resume against all published jobs.
     * Called when a person uploads/updates their resume.
     * Creates notifications of type JOB_RECOMMENDATION for the user.
     */
    @Transactional
    public void triggerMatchForResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Get all published jobs
        List<Job> jobs = jobRepository.findByStatus(JobStatus.PUBLISHED);

        for (Job job : jobs) {
            // Check if match already exists
            if (!matchRecordRepository.findByResumeIdAndJobId(resumeId, job.getId()).isEmpty()) {
                continue; // Skip if already matched
            }

            // Calculate match using domain service
            MatchRecord record = matchDomainService.calculateMatch(resume, job);
            record.setMatchDirection(MatchRecord.DIRECTION_COMPANY_RECOMMENDS); // 2=company recommends candidate to person
            matchRecordRepository.save(record);

            // Create notification for user (type=2: new job recommendation)
            createJobRecommendationNotification(resume.getUserId(), job.getId(), BigDecimal.valueOf(record.getScore().getTotal()));
        }
    }

    /**
     * Trigger matching for a job against all successfully parsed resumes.
     * Called when a company publishes/updates a job.
     * Creates notifications of type CANDIDATE_RECOMMENDATION for the company.
     */
    @Transactional
    public void triggerMatchForJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        // Query all resumes with parse_status=SUCCESS
        List<Resume> resumes = resumeRepository.findByParseStatus(ParseStatus.SUCCESS);

        for (Resume resume : resumes) {
            // Check if match already exists
            if (!matchRecordRepository.findByResumeIdAndJobId(resume.getId(), jobId).isEmpty()) {
                continue;
            }

            // Calculate match using domain service
            MatchRecord record = matchDomainService.calculateMatch(resume, job);
            record.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES); // 1=person applies to job
            matchRecordRepository.save(record);

            // Create notification for company (type=3: candidate recommendation)
            createCandidateRecommendationNotification(job.getCompanyId(), resume.getId(), BigDecimal.valueOf(record.getScore().getTotal()));
        }
    }

    public MatchDetailResponse getMatchDetail(MatchDetailQuery query) {
        MatchRecord record = matchRecordRepository.findById(query.getMatchId())
            .orElseThrow(() -> new RuntimeException("Match record not found"));
        Resume resume = resumeRepository.findById(record.getResumeId())
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        Job job = jobRepository.findById(record.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));
        return new MatchDetailResponse(record, resume, job);
    }

    public List<MatchDetailResponse> getMatchListForResume(Long resumeId) {
        List<MatchRecord> records = matchRecordRepository.findByResumeId(resumeId);
        return records.stream()
            .map(r -> {
                Job job = jobRepository.findById(r.getJobId()).orElse(null);
                Resume resume = resumeRepository.findById(r.getResumeId()).orElse(null);
                return new MatchDetailResponse(r, resume, job);
            })
            .toList();
    }

    public List<MatchDetailResponse> getMatchListForJob(Long jobId) {
        List<MatchRecord> records = matchRecordRepository.findByJobId(jobId);
        return records.stream()
            .map(r -> {
                Job job = jobRepository.findById(r.getJobId()).orElse(null);
                Resume resume = resumeRepository.findById(r.getResumeId()).orElse(null);
                return new MatchDetailResponse(r, resume, job);
            })
            .toList();
    }

    public List<MatchDetailResponse> getRecommendedJobsForPerson(Long userId) {
        // Get all resumes for the user
        List<Resume> resumes = resumeRepository.findByUserId(userId);
        if (resumes.isEmpty()) {
            return new ArrayList<>();
        }

        // Get all match records for these resumes
        List<MatchDetailResponse> recommendations = new ArrayList<>();
        for (Resume resume : resumes) {
            List<MatchRecord> records = matchRecordRepository.findByResumeId(resume.getId());
            for (MatchRecord record : records) {
                Job job = jobRepository.findById(record.getJobId()).orElse(null);
                if (job != null) {
                    recommendations.add(new MatchDetailResponse(record, resume, job));
                }
            }
        }
        return recommendations;
    }

    /**
     * Get recommended resumes for a company based on their published jobs.
     * Returns match records sorted by match score.
     */
    public List<MatchDetailResponse> getRecommendedResumesForCompany(Long companyId) {
        // Get all published jobs for the company
        List<Job> companyJobs = jobRepository.findByCompanyId(companyId).stream()
            .filter(j -> j.getStatus() == JobStatus.PUBLISHED)
            .toList();
        if (companyJobs.isEmpty()) {
            return new ArrayList<>();
        }

        // Collect all match records for company's jobs
        List<MatchDetailResponse> recommendations = new ArrayList<>();
        for (Job job : companyJobs) {
            List<MatchRecord> records = matchRecordRepository.findByJobId(job.getId());
            for (MatchRecord record : records) {
                Resume resume = resumeRepository.findById(record.getResumeId()).orElse(null);
                if (resume != null) {
                    recommendations.add(new MatchDetailResponse(record, resume, job));
                }
            }
        }
        return recommendations;
    }

    public MatchDetailResponse getMatchDetailForPersonAndJob(Long userId, Long jobId) {
        // Get user's resumes
        List<Resume> resumes = resumeRepository.findByUserId(userId);
        if (resumes.isEmpty()) {
            throw new RuntimeException("用户没有简历");
        }

        // Find match record for any of user's resumes with the job
        for (Resume resume : resumes) {
            List<MatchRecord> records = matchRecordRepository.findByResumeIdAndJobId(resume.getId(), jobId);
            if (!records.isEmpty()) {
                MatchRecord record = records.get(0);
                Job job = jobRepository.findById(jobId).orElse(null);
                return new MatchDetailResponse(record, resume, job);
            }
        }
        throw new RuntimeException("匹配记录不存在");
    }

    /**
     * Get match detail for company viewing candidate resume.
     * Sends notification type=5 (RESUME_VIEWED) on first view from this company.
     */
    @Transactional
    public MatchDetailResponse getMatchDetailForCompany(Long resumeId, Long jobId, Long companyId) {
        // Find match record
        List<MatchRecord> records = matchRecordRepository.findByResumeIdAndJobId(resumeId, jobId);
        if (records.isEmpty()) {
            throw new RuntimeException("Match record not found");
        }
        MatchRecord record = records.get(0);

        // Verify company owns this job
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getCompanyId().equals(companyId)) {
            throw new RuntimeException("无权查看该匹配记录");
        }

        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Check if already viewed by this company (status 0=unviewed, 1=viewed)
        // We use isRead field which maps to status in database
        if (record.getIsRead() == null || !record.getIsRead()) {
            // First time being viewed - mark as read and send notification
            record.setIsRead(true);
            matchRecordRepository.save(record);

            // Create notification type=5 (RESUME_VIEWED) for the resume owner
            notificationAppService.create(
                resume.getUserId(),
                NotificationType.RESUME_VIEWED,
                "简历被查看",
                "您的简历被企业查看"
            );
        }

        return new MatchDetailResponse(record, resume, job);
    }

    /**
     * Create notification for job recommendation to person (type=2).
     * This is called when a new job is published that matches a person's resume.
     */
    private void createJobRecommendationNotification(Long userId, Long jobId, BigDecimal score) {
        notificationAppService.create(
            userId,
            NotificationType.JOB_RECOMMENDATION,
            "新职位推荐",
            String.format("根据您的简历，我们为您推荐了一个匹配度%.0f%%的职位", score.doubleValue()),
            jobId
        );
    }

    /**
     * Create notification for candidate recommendation to company (type=3).
     * This is called when a new resume is uploaded that matches a company's job.
     */
    private void createCandidateRecommendationNotification(Long companyId, Long resumeId, BigDecimal score) {
        notificationAppService.create(
            companyId,
            NotificationType.CANDIDATE_RECOMMENDATION,
            "收到候选人推荐",
            String.format("有一位匹配度%.0f%%的候选人，请查看", score.doubleValue()),
            resumeId
        );
    }
}
