package com.graphhire.match.application.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.match.application.command.TriggerMatchCmd;
import com.graphhire.match.application.query.MatchDetailQuery;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.service.MatchDomainService;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MatchAppService {

    private static final Logger log = LoggerFactory.getLogger(MatchAppService.class);
    private static final int RESUME_MATCH_CONCURRENCY = 4;
    private static final int RESUME_MATCH_MAX_ATTEMPTS = 3;

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

    @Autowired
    private PersonInfoRepository personInfoRepository;
    @Autowired
    private CompanyStaffRepository companyStaffRepository;

    /**
     * 触发匹配
     * 【功能说明】根据简历和职位ID计算匹配度并保存匹配记录。
     * 【业务步骤】
     * 步骤1：调用领域服务计算简历与职位的匹配度
     * 步骤2：将匹配记录持久化到数据库
     * 步骤3：返回保存的匹配记录
     */
    @Transactional
    public MatchRecord triggerMatch(TriggerMatchCmd cmd) {
        // 步骤1：优先复用已有匹配记录（作为已存在数据）
        List<MatchRecord> cachedRecords = matchRecordRepository.findByResumeIdAndJobId(cmd.getResumeId(), cmd.getJobId());
        if (!cachedRecords.isEmpty()) {
            return cachedRecords.get(0);
        }
        // 步骤2：无已存在数据时计算并持久化
        MatchRecord matchRecord = matchDomainService.calculateMatch(cmd.getResumeId(), cmd.getJobId());
        return matchRecordRepository.save(matchRecord);
    }

    @Transactional
    public MatchRecord triggerMatchForCurrentUser(Long currentUserId, UserType userType, TriggerMatchCmd cmd) {
        if (cmd == null || cmd.getResumeId() == null || cmd.getJobId() == null) {
            throw new com.graphhire.common.vo.Exceptions.ValidationException("简历ID和职位ID不能为空");
        }
        Resume resume = resumeRepository.findById(cmd.getResumeId())
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        Job job = jobRepository.findById(cmd.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (userType == UserType.PERSON) {
            if (!currentUserId.equals(resume.getUserId())) {
                throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权触发该简历的匹配");
            }
        } else if (userType == UserType.COMPANY) {
            CompanyStaff staff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new com.graphhire.common.vo.Exceptions.ForbiddenException("非企业成员"));
            if (!staff.getCompanyId().equals(job.getCompanyId())) {
                throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权触发该职位的匹配");
            }
        } else if (userType != UserType.ADMIN) {
            throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权执行匹配");
        }
        return triggerMatch(cmd);
    }

    /**
     * 为简历触发与所有已发布职位的匹配
     * 【功能说明】当用户上传/更新简历时调用，为简历匹配所有已发布职位并创建type=2的职位推荐通知。
     * 【业务步骤】
     * 步骤1：根据简历ID查询简历信息
     * 步骤2：获取所有已发布的职位列表
     * 步骤3：遍历职位，为用户创建职位推荐通知（MatchRecord由Application模块处理）
     */
    @Transactional
    public void triggerMatchForResume(Long resumeId) {
        long totalStartNanos = System.nanoTime();
        List<Job> publishedJobs = jobRepository.findPublished();
        List<MatchRecord> existingRecords = matchRecordRepository.findByResumeId(resumeId).stream()
            .filter(record -> record.getMatchDirection() == null
                || record.getMatchDirection().equals(MatchRecord.DIRECTION_PERSON_APPLIES))
            .toList();
        Map<Long, MatchRecord> existingByJobId = new HashMap<>();
        for (MatchRecord existing : existingRecords) {
            if (existing.getJobId() != null && !existingByJobId.containsKey(existing.getJobId())) {
                existingByJobId.put(existing.getJobId(), existing);
            }
        }

        Set<Long> publishedJobIds = new HashSet<>();
        List<Long> targetJobIds = new ArrayList<>();
        for (Job job : publishedJobs) {
            if (job.getId() == null) {
                continue;
            }
            publishedJobIds.add(job.getId());
            targetJobIds.add(job.getId());
        }

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger skippedCount = new AtomicInteger();
        long matchLoopStartNanos = System.nanoTime();

        ExecutorService executor = Executors.newFixedThreadPool(RESUME_MATCH_CONCURRENCY);
        try {
            List<CompletableFuture<Void>> futures = targetJobIds.stream()
                .map(jobId -> CompletableFuture.runAsync(() -> {
                    boolean success = calculateAndSaveWithRetry(resumeId, jobId, existingByJobId);
                    if (success) {
                        successCount.incrementAndGet();
                    } else {
                        skippedCount.incrementAndGet();
                    }
                }, executor))
                .toList();
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        } finally {
            shutdownExecutor(executor);
        }

        long matchLoopCostMs = elapsedMs(matchLoopStartNanos);

        for (MatchRecord existing : existingRecords) {
            Long oldJobId = existing.getJobId();
            if (oldJobId == null || !publishedJobIds.contains(oldJobId)) {
                matchRecordRepository.delete(existing);
            }
        }

        log.info(
            "简历全职位匹配完成：resumeId={}, 已发布职位数={}, 成功数={}, 跳过数={}, 匹配执行耗时={}ms, 总耗时={}ms",
            resumeId, targetJobIds.size(), successCount.get(), skippedCount.get(), matchLoopCostMs, elapsedMs(totalStartNanos)
        );
    }

    /**
     * 为职位触发与所有解析成功简历的匹配
     * 【功能说明】当企业发布/更新职位时调用，为职位匹配所有解析成功的简历并创建type=3的候选人推荐通知。
     * 【业务步骤】
     * 步骤1：根据职位ID查询职位信息
     * 步骤2：获取所有解析状态为成功的简历列表
     * 步骤3：遍历简历，为企业创建候选人推荐通知（MatchRecord由Application模块处理）
     */
    @Transactional
    public void triggerMatchForJob(Long jobId) {
        long totalStartNanos = System.nanoTime();
        log.info("企业一键匹配开始：jobId={}", jobId);

        long clearOldDataStartNanos = System.nanoTime();
        clearOldMatchDataForJob(jobId);
        long clearOldDataCostMs = elapsedMs(clearOldDataStartNanos);

        long queryResumeStartNanos = System.nanoTime();
        List<Resume> parsedResumes = resumeRepository.findByParseStatus(ParseStatus.SUCCESS);
        long queryResumeCostMs = elapsedMs(queryResumeStartNanos);

        int totalResumes = parsedResumes.size();
        int successCount = 0;
        long matchLoopStartNanos = System.nanoTime();
        for (Resume resume : parsedResumes) {
            MatchRecord record = matchDomainService.calculateMatch(resume.getId(), jobId);
            matchRecordRepository.save(record);
            successCount++;
        }
        long matchLoopCostMs = elapsedMs(matchLoopStartNanos);

        log.info(
            "企业一键匹配完成：jobId={}, 简历总数={}, 成功数={}, 清除旧数据耗时={}ms, 查询简历耗时={}ms, 匹配入库耗时={}ms, 总耗时={}ms",
            jobId, totalResumes, successCount, clearOldDataCostMs, queryResumeCostMs, matchLoopCostMs, elapsedMs(totalStartNanos)
        );
    }

    private static long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }

    private boolean calculateAndSaveWithRetry(Long resumeId, Long jobId, Map<Long, MatchRecord> existingByJobId) {
        for (int attempt = 1; attempt <= RESUME_MATCH_MAX_ATTEMPTS; attempt++) {
            try {
                MatchRecord record = matchDomainService.calculateMatch(resumeId, jobId);
                MatchRecord existing = existingByJobId.get(jobId);
                if (existing != null) {
                    record.setId(existing.getId());
                    if (record.getMatchDirection() == null) {
                        record.setMatchDirection(existing.getMatchDirection());
                    }
                }
                matchRecordRepository.save(record);
                return true;
            } catch (Exception ex) {
                if (attempt < RESUME_MATCH_MAX_ATTEMPTS) {
                    log.warn(
                        "简历匹配任务失败，准备重试：resumeId={}, jobId={}, attempt={}/{}, reason={}",
                        resumeId, jobId, attempt, RESUME_MATCH_MAX_ATTEMPTS, ex.getMessage()
                    );
                    continue;
                }
                log.error(
                    "简历匹配任务失败，达到重试上限后跳过：resumeId={}, jobId={}, attempts={}, reason={}",
                    resumeId, jobId, RESUME_MATCH_MAX_ATTEMPTS, ex.getMessage()
                );
            }
        }
        return false;
    }

    private void shutdownExecutor(ExecutorService executor) {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException ex) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    @Transactional
    public void clearOldMatchDataForResume(Long resumeId) {
        matchRecordRepository.deleteByResumeId(resumeId);
    }

    @Transactional
    public void clearOldMatchDataForJob(Long jobId) {
        matchRecordRepository.deleteByJobId(jobId);
    }

    /**
     * 获取匹配详情
     * 【功能说明】根据匹配ID查询匹配详情，包含简历和职位的完整信息。
     * 【业务步骤】
     * 步骤1：根据匹配ID查询匹配记录
     * 步骤2：根据匹配记录中的简历ID查询简历信息
     * 步骤3：根据匹配记录中的职位ID查询职位信息
     * 步骤4：组装并返回匹配详情响应
     */
    public MatchDetailResponse getMatchDetail(MatchDetailQuery query) {
        // 步骤1：根据匹配ID查询匹配记录
        MatchRecord record = matchRecordRepository.findById(query.getMatchId())
            .orElseThrow(() -> new RuntimeException("Match record not found"));
        // 步骤2：根据匹配记录中的简历ID查询简历信息
        Resume resume = resumeRepository.findById(record.getResumeId())
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        // 步骤3：根据匹配记录中的职位ID查询职位信息
        Job job = jobRepository.findById(record.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));
        // 步骤4：组装并返回匹配详情响应
        return new MatchDetailResponse(record, resume, job, resolvePersonInfo(resume));
    }

    public MatchDetailResponse getMatchDetailForCurrentUser(Long currentUserId, UserType userType, Long matchId) {
        MatchRecord record = matchRecordRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match record not found"));
        ensureRecordAccessible(currentUserId, userType, record);
        MatchDetailQuery query = new MatchDetailQuery(matchId);
        return getMatchDetail(query);
    }

    /**
     * 获取简历的匹配列表
     * 【功能说明】查询指定简历的所有匹配记录，返回包含职位信息的匹配详情列表。
     * 【业务步骤】
     * 步骤1：根据简历ID查询所有匹配记录
     * 步骤2：遍历匹配记录，查询对应的职位信息
     * 步骤3：组装匹配详情响应列表并返回
     */
    public List<MatchDetailResponse> getMatchListForResume(Long resumeId) {
        // 步骤1：根据简历ID查询所有匹配记录
        List<MatchRecord> records = matchRecordRepository.findByResumeId(resumeId);
        // 步骤2~3：遍历匹配记录，查询对应的职位信息并组装响应列表
        return records.stream()
            .map(r -> {
                Job job = jobRepository.findById(r.getJobId()).orElse(null);
                Resume resume = resumeRepository.findById(r.getResumeId()).orElse(null);
                return new MatchDetailResponse(r, resume, job, resolvePersonInfo(resume));
            })
            .toList();
    }

    public List<MatchDetailResponse> getMatchListForResumeCurrentUser(Long currentUserId, UserType userType, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        if (userType == UserType.PERSON) {
            if (!currentUserId.equals(resume.getUserId())) {
                throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该简历匹配");
            }
        } else if (userType == UserType.COMPANY) {
            CompanyStaff staff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new com.graphhire.common.vo.Exceptions.ForbiddenException("非企业成员"));
            List<MatchRecord> records = matchRecordRepository.findByResumeId(resumeId);
            for (MatchRecord record : records) {
                Job job = jobRepository.findById(record.getJobId()).orElse(null);
                if (job != null && job.getCompanyId().equals(staff.getCompanyId())) {
                    return getMatchListForResume(resumeId);
                }
            }
            throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该简历匹配");
        } else if (userType != UserType.ADMIN) {
            throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看匹配列表");
        }
        return getMatchListForResume(resumeId);
    }

    /**
     * 获取职位的匹配列表
     * 【功能说明】查询指定职位的所有匹配记录，返回包含简历信息的匹配详情列表。
     * 【业务步骤】
     * 步骤1：根据职位ID查询所有匹配记录
     * 步骤2：遍历匹配记录，查询对应的简历信息
     * 步骤3：组装匹配详情响应列表并返回
     */
    public List<MatchDetailResponse> getMatchListForJob(Long jobId) {
        // 步骤1：根据职位ID查询所有匹配记录
        List<MatchRecord> records = matchRecordRepository.findByJobId(jobId);
        // 步骤2~3：遍历匹配记录，查询对应的简历信息并组装响应列表
        return records.stream()
            .map(r -> {
                Job job = jobRepository.findById(r.getJobId()).orElse(null);
                Resume resume = resumeRepository.findById(r.getResumeId()).orElse(null);
                return new MatchDetailResponse(r, resume, job, resolvePersonInfo(resume));
            })
            .sorted(recommendationScoreDescComparator())
            .toList();
    }

    public List<MatchDetailResponse> getMatchListForJobCurrentUser(Long currentUserId, UserType userType, Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        if (userType == UserType.COMPANY) {
            CompanyStaff staff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new com.graphhire.common.vo.Exceptions.ForbiddenException("非企业成员"));
            if (!staff.getCompanyId().equals(job.getCompanyId())) {
                throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该职位匹配");
            }
        } else if (userType == UserType.PERSON) {
            List<MatchRecord> records = matchRecordRepository.findByJobId(jobId);
            for (MatchRecord record : records) {
                Resume resume = resumeRepository.findById(record.getResumeId()).orElse(null);
                if (resume != null && currentUserId.equals(resume.getUserId())) {
                    return getMatchListForJob(jobId);
                }
            }
            throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该职位匹配");
        } else if (userType != UserType.ADMIN) {
            throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看匹配列表");
        }
        return getMatchListForJob(jobId);
    }

    private void ensureRecordAccessible(Long currentUserId, UserType userType, MatchRecord record) {
        if (userType == UserType.ADMIN) {
            return;
        }
        Resume resume = resumeRepository.findById(record.getResumeId())
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        Job job = jobRepository.findById(record.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));
        if (userType == UserType.PERSON) {
            if (!currentUserId.equals(resume.getUserId())) {
                throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该匹配记录");
            }
            return;
        }
        if (userType == UserType.COMPANY) {
            CompanyStaff staff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new com.graphhire.common.vo.Exceptions.ForbiddenException("非企业成员"));
            if (!staff.getCompanyId().equals(job.getCompanyId())) {
                throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该匹配记录");
            }
            return;
        }
        throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权查看该匹配记录");
    }

    /**
     * 获取个人推荐职位列表
     * 【功能说明】根据用户ID获取其所有简历的匹配记录，返回推荐职位列表。
     * 【业务步骤】
     * 步骤1：根据用户ID查询该用户的所有简历
     * 步骤2：检查是否有简历，无简历则返回空列表
     * 步骤3：遍历用户的每个简历，查询其所有匹配记录
     * 步骤4：查询匹配记录对应的职位信息
     * 步骤5：组装推荐职位列表并返回
     */
    public List<MatchDetailResponse> getRecommendedJobsForPerson(Long userId) {
        // 步骤1：根据用户ID查询该用户的所有简历
        List<Resume> resumes = resumeRepository.findByUserId(userId);
        // 步骤2：检查是否有简历，无简历则返回空列表
        if (resumes.isEmpty()) {
            return new ArrayList<>();
        }

        // 步骤3~5：遍历用户的每个简历，查询其所有匹配记录并组装推荐职位列表
        List<MatchDetailResponse> recommendations = new ArrayList<>();
        for (Resume resume : resumes) {
            List<MatchRecord> records = matchRecordRepository.findByResumeId(resume.getId());
            for (MatchRecord record : records) {
                Job job = jobRepository.findById(record.getJobId()).orElse(null);
                if (job != null) {
                    recommendations.add(new MatchDetailResponse(record, resume, job, resolvePersonInfo(resume)));
                }
            }
        }
        return recommendations;
    }

    /**
     * 获取企业推荐简历列表
     * 【功能说明】根据企业已发布的职位返回匹配的简历列表，用于企业查看候选人推荐。
     * 【业务步骤】
     * 步骤1：根据企业ID查询该企业的所有职位
     * 步骤2：筛选出已发布状态的职位
     * 步骤3：检查是否有已发布职位，无则返回空列表
     * 步骤4：遍历企业的每个已发布职位，查询其所有匹配记录
     * 步骤5：查询匹配记录对应的简历信息
     * 步骤6：组装推荐简历列表并返回
     */
    public List<MatchDetailResponse> getRecommendedResumesForCompany(Long companyId) {
        // 步骤1：根据企业ID查询该企业的所有职位
        List<Job> companyJobs = jobRepository.findByCompanyId(companyId).stream()
            // 步骤2：筛选出已发布状态的职位
            .filter(j -> j.getStatus() == JobStatus.PUBLISHED)
            .toList();
        // 步骤3：检查是否有已发布职位，无则返回空列表
        if (companyJobs.isEmpty()) {
            return new ArrayList<>();
        }

        // 步骤4~6：遍历企业的每个已发布职位，查询其所有匹配记录并组装推荐简历列表
        List<MatchDetailResponse> recommendations = new ArrayList<>();
        for (Job job : companyJobs) {
            List<MatchRecord> records = matchRecordRepository.findByJobId(job.getId());
            for (MatchRecord record : records) {
                Resume resume = resumeRepository.findById(record.getResumeId()).orElse(null);
                if (resume != null) {
                    recommendations.add(new MatchDetailResponse(record, resume, job, resolvePersonInfo(resume)));
                }
            }
        }
        return recommendations.stream()
            .sorted(recommendationScoreDescComparator())
            .toList();
    }

    private Comparator<MatchDetailResponse> recommendationScoreDescComparator() {
        return Comparator.comparingDouble(this::extractTotalScore).reversed();
    }

    private double extractTotalScore(MatchDetailResponse response) {
        if (response == null || response.getScore() == null) {
            return Double.NEGATIVE_INFINITY;
        }
        return response.getScore().getTotal();
    }

    private PersonInfo resolvePersonInfo(Resume resume) {
        if (resume == null || resume.getUserId() == null) {
            return null;
        }
        return personInfoRepository.findByUserId(resume.getUserId()).orElse(null);
    }

    /**
     * 获取个人与职位的匹配详情
     * 【功能说明】根据用户ID和职位ID查询该用户任一简历与职位的匹配详情。
     * 【业务步骤】
     * 步骤1：根据用户ID查询该用户的所有简历
     * 步骤2：检查用户是否有简历，无简历则抛出异常
     * 步骤3：遍历用户的简历，查找与目标职位的匹配记录
     * 步骤4：找到匹配记录后查询职位信息并返回匹配详情
     * 步骤5：未找到匹配记录则抛出异常
     */
    public MatchDetailResponse getMatchDetailForPersonAndJob(Long userId, Long jobId) {
        // 步骤1：根据用户ID查询该用户的所有简历
        List<Resume> resumes = resumeRepository.findByUserId(userId);
        // 步骤2：检查用户是否有简历，无简历则抛出异常
        if (resumes.isEmpty()) {
            throw new RuntimeException("用户没有简历");
        }

        // 步骤3：遍历用户的简历，查找与目标职位的匹配记录
        for (Resume resume : resumes) {
            List<MatchRecord> records = matchRecordRepository.findByResumeIdAndJobId(resume.getId(), jobId);
            if (!records.isEmpty()) {
                // 步骤4：找到匹配记录后查询职位信息并返回匹配详情
                MatchRecord record = records.get(0);
                Job job = jobRepository.findById(jobId).orElse(null);
                return new MatchDetailResponse(record, resume, job, resolvePersonInfo(resume));
            }
        }
        // 步骤5：未找到匹配记录时即时计算并落库（避免前端首次进入详情报错）
        Resume targetResume = resumes.stream()
            .filter(r -> Boolean.TRUE.equals(r.getIsDefault()))
            .findFirst()
            .orElse(resumes.get(0));
        MatchRecord generatedRecord = matchDomainService.calculateMatch(targetResume.getId(), jobId);
        MatchRecord savedRecord = matchRecordRepository.save(generatedRecord);
        Job job = jobRepository.findById(jobId).orElse(null);
        return new MatchDetailResponse(savedRecord, targetResume, job, resolvePersonInfo(targetResume));
    }

    /**
     * 获取企业查看候选人的匹配详情
     * 【功能说明】企业查看候选人简历的匹配详情时调用，首次查看时发送type=5的简历被查看通知。
     * 【业务步骤】
     * 步骤1：根据简历ID和职位ID查询匹配记录
     * 步骤2：检查匹配记录是否存在，不存在则抛出异常
     * 步骤3：查询职位信息并验证企业是否拥有该职位
     * 步骤4：查询简历信息
     * 步骤5：检查该企业是否首次查看，未查看则标记为已读并发送type=5通知
     * 步骤6：组装并返回匹配详情响应
     */
    @Transactional
    public MatchDetailResponse getMatchDetailForCompany(Long resumeId, Long jobId, Long companyId) {
        // 步骤1：根据简历ID和职位ID查询匹配记录
        List<MatchRecord> records = matchRecordRepository.findByResumeIdAndJobId(resumeId, jobId);
        // 步骤2：检查匹配记录是否存在，不存在则抛出异常
        if (records.isEmpty()) {
            throw new RuntimeException("Match record not found");
        }
        MatchRecord record = records.get(0);

        // 步骤3：查询职位信息并验证企业是否拥有该职位
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getCompanyId().equals(companyId)) {
            throw new RuntimeException("无权查看该匹配记录");
        }

        // 步骤4：查询简历信息
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));

        // 步骤5：企业查看匹配详情时通知简历所有者（不再记录viewed状态）
        notificationAppService.create(
            resume.getUserId(),
            NotificationType.RESUME_VIEWED,
            "简历被查看",
            "您的简历被企业查看"
        );

        // 步骤6：组装并返回匹配详情响应
        return new MatchDetailResponse(record, resume, job, resolvePersonInfo(resume));
    }

    /**
     * 创建职位推荐通知（type=2）
     * 【功能说明】当发布的新职位匹配用户简历时调用，发送职位推荐通知。
     * 【业务步骤】
     * 步骤1：构建通知内容，包含匹配度信息
     * 步骤2：调用通知服务创建type=2的职位推荐通知
     */
    private void createJobRecommendationNotification(Long userId, Long jobId, BigDecimal score) {
        // 步骤1~2：构建通知内容并调用通知服务创建type=2的职位推荐通知
        notificationAppService.create(
            userId,
            NotificationType.JOB_RECOMMENDATION,
            "新职位推荐",
            String.format("根据您的简历，我们为您推荐了一个匹配度%.0f%%的职位", score.doubleValue()),
            jobId
        );
    }

    /**
     * 创建候选人推荐通知（type=3）
     * 【功能说明】当新简历匹配企业职位时调用，发送候选人推荐通知。
     * 【业务步骤】
     * 步骤1：构建通知内容，包含匹配度信息
     * 步骤2：调用通知服务创建type=3的候选人推荐通知
     */
    private void createCandidateRecommendationNotification(Long companyId, Long resumeId, BigDecimal score) {
        // 步骤1~2：构建通知内容并调用通知服务创建type=3的候选人推荐通知
        notificationAppService.create(
            companyId,
            NotificationType.CANDIDATE_RECOMMENDATION,
            "收到候选人推荐",
            String.format("有一位匹配度%.0f%%的候选人，请查看", score.doubleValue()),
            resumeId
        );
    }
}
