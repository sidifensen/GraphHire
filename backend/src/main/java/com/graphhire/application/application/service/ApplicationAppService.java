package com.graphhire.application.application.service;

import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import com.graphhire.application.domain.model.Favorite;
import com.graphhire.application.domain.model.TalentPool;
import com.graphhire.application.domain.repository.ApplicationRepository;
import com.graphhire.application.domain.repository.FavoriteRepository;
import com.graphhire.application.domain.repository.TalentPoolRepository;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.application.interfaces.dto.response.PersonApplicationListItemResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 投递应用服务
 *
 * 【模块说明】提供投递业务的聚合操作入口，协调领域模型与仓储进行业务处理。
 * 【数据来源】通过 ApplicationRepository/FavoriteRepository/TalentPoolRepository 访问持久化数据
 * 【方法概览】
 * - applyJob：投递职位
 * - getUserApplications/getApplicationById：查询投递
 * - withdrawApplication：撤回投递
 * - favoriteJob/unfavoriteJob/getUserFavorites：收藏管理
 * - getCompanyApplications/updateApplicationStatus：企业端投递管理
 * - sendInterviewInvitation：发送面试邀请
 * - addToTalentPool/removeFromTalentPool/getCompanyTalentPool：人才库管理
 */
@Service
public class ApplicationAppService {

    private final ApplicationRepository applicationRepository;
    private final FavoriteRepository favoriteRepository;
    private final TalentPoolRepository talentPoolRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final MatchRecordRepository matchRecordRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationAppService notificationAppService;

    @Autowired
    public ApplicationAppService(ApplicationRepository applicationRepository,
                                  FavoriteRepository favoriteRepository,
                                  TalentPoolRepository talentPoolRepository,
                                  JobRepository jobRepository,
                                  CompanyRepository companyRepository,
                                  MatchRecordRepository matchRecordRepository,
                                  ResumeRepository resumeRepository,
                                  NotificationAppService notificationAppService) {
        this.applicationRepository = applicationRepository;
        this.favoriteRepository = favoriteRepository;
        this.talentPoolRepository = talentPoolRepository;
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.matchRecordRepository = matchRecordRepository;
        this.resumeRepository = resumeRepository;
        this.notificationAppService = notificationAppService;
    }

    // ==================== 投递相关方法 ====================

    /**
     * 投递职位
     * 【功能说明】用户投递职位，校验简历属于用户、职位已发布、未投递过，创建投递记录，发送通知。
     * 【业务步骤】
     * 步骤1：校验简历存在且属于用户
     * 步骤2：校验职位已发布
     * 步骤3：校验未投递过该职位
     * 步骤4：创建投递记录
     * 步骤5：发送简历投递通知
     */
    @Transactional
    public Application applyJob(Long userId, Long resumeId, Long jobId) {
        // 步骤1：校验简历存在且属于用户
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> Exceptions.BusinessException.of(404, "简历不存在"));
        if (!resume.getUserId().equals(userId)) {
            throw Exceptions.BusinessException.of(403, "默认简历不属于当前账号");
        }

        // 步骤2：校验职位已发布
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> Exceptions.BusinessException.of(404, "职位不存在或已下线"));
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw Exceptions.BusinessException.of(400, "职位未发布，暂不可投递");
        }

        // 步骤3：校验未投递过该职位
        if (applicationRepository.existsByResumeIdAndJobId(resumeId, jobId)) {
            throw Exceptions.BusinessException.of(409, "已投递过该职位");
        }

        // 步骤4：创建投递记录
        Application application = new Application();
        application.setResumeId(resumeId);
        application.setJobId(jobId);
        application.setUserId(userId);
        application.setCompanyId(job.getCompanyId());
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());
        application = applicationRepository.save(application);

        // 步骤5：发送简历投递通知
        notificationAppService.create(
            userId,
            NotificationType.RESUME_SUBMITTED,
            "简历投递成功",
            "您的简历已成功投递至职位：" + job.getTitle(),
            application.getId()
        );

        return application;
    }

    /**
     * 获取用户投递列表
     * 【功能说明】查询指定用户的所有投递记录。
     */
    public List<Application> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    /**
     * 获取用户投递列表（展示信息）
     * 【功能说明】在投递基础信息上补充职位名称和企业名称，供前端展示。
     */
    public List<PersonApplicationListItemResponse> getUserApplicationList(Long userId) {
        List<Application> applications = applicationRepository.findByUserId(userId);
        List<PersonApplicationListItemResponse> result = new ArrayList<>(applications.size());
        for (Application application : applications) {
            PersonApplicationListItemResponse item = new PersonApplicationListItemResponse();
            item.setId(application.getId());
            item.setResumeId(application.getResumeId());
            item.setJobId(application.getJobId());
            item.setAppliedAt(application.getAppliedAt());
            item.setStatus(application.getStatus() == null ? null : application.getStatus().name());
            List<MatchRecord> matchRecords = matchRecordRepository.findByResumeIdAndJobId(
                application.getResumeId(),
                application.getJobId()
            );
            if (!matchRecords.isEmpty() && matchRecords.get(0).getScore() != null) {
                item.setMatchScore((int) Math.round(matchRecords.get(0).getScore().getTotal()));
            }

            Job job = jobRepository.findById(application.getJobId()).orElse(null);
            if (job != null) {
                item.setJobTitle(job.getTitle());
            }

            Company company = companyRepository.findById(application.getCompanyId()).orElse(null);
            if (company != null) {
                item.setCompanyName(company.getName());
            }

            result.add(item);
        }
        return result;
    }

    /**
     * 获取投递详情
     * 【功能说明】根据投递ID查询单条投递详情。
     */
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found: " + id));
    }

    /**
     * 撤回投递
     * 【功能说明】用户撤回自己的投递，仅PENDING状态可撤回。
     * 【业务步骤】
     * 步骤1：校验投递存在且属于用户
     * 步骤2：校验状态为PENDING
     * 步骤3：更新状态为WITHDRAWN
     */
    @Transactional
    public void withdrawApplication(Long userId, Long applicationId) {
        // 步骤1：校验投递存在且属于用户
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("Application does not belong to user");
        }

        // 步骤2：校验状态为PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Only pending applications can be withdrawn");
        }

        // 步骤3：更新状态为WITHDRAWN
        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(application);
    }

    // ==================== 收藏相关方法 ====================

    /**
     * 收藏职位
     * 【功能说明】用户收藏职位，校验未收藏过。
     */
    @Transactional
    public Favorite favoriteJob(Long userId, Long jobId) {
        // 校验职位存在
        if (!jobRepository.findById(jobId).isPresent()) {
            throw new RuntimeException("Job not found: " + jobId);
        }

        // 校验未收藏过
        if (favoriteRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("Already favorited this job");
        }

        // 创建收藏记录
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setJobId(jobId);
        favorite.setCreatedAt(LocalDateTime.now());
        return favoriteRepository.save(favorite);
    }

    /**
     * 取消收藏
     * 【功能说明】用户取消收藏职位。
     */
    @Transactional
    public void unfavoriteJob(Long userId, Long jobId) {
        if (!favoriteRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("Favorite not found");
        }
        favoriteRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    /**
     * 获取用户收藏列表
     * 【功能说明】查询指定用户的所有收藏记录。
     */
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    // ==================== 企业端投递管理 ====================

    /**
     * 获取企业投递列表
     * 【功能说明】企业查询自己的投递列表，支持按状态筛选。
     */
    public List<Application> getCompanyApplications(Long companyId, ApplicationStatus status) {
        if (status != null) {
            return applicationRepository.findByCompanyIdAndStatus(companyId, status);
        }
        return applicationRepository.findByCompanyId(companyId);
    }

    /**
     * 更新投递状态
     * 【功能说明】企业更新投递状态。
     */
    @Transactional
    public Application updateApplicationStatus(Long companyId, Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        if (!application.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Application does not belong to company");
        }
        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());
        return applicationRepository.save(application);
    }

    /**
     * 发送面试邀请
     * 【功能说明】企业向候选人发送面试邀请，更新投递状态为INTERVIEW_INVITED，发送面试邀请通知。
     * 【业务步骤】
     * 步骤1：校验投递属于该公司
     * 步骤2：更新投递状态为INTERVIEW_INVITED
     * 步骤3：发送面试邀请通知
     */
    @Transactional
    public Application sendInterviewInvitation(Long companyId, Long applicationId,
                                               LocalDateTime interviewTime, String location, String remark) {
        // 步骤1：校验投递属于该公司
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        if (!application.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Application does not belong to company");
        }

        // 步骤2：更新投递状态为INTERVIEW_INVITED
        application.setStatus(ApplicationStatus.INTERVIEW_INVITED);
        application.setUpdatedAt(LocalDateTime.now());
        application = applicationRepository.save(application);

        // 步骤3：发送面试邀请通知
        Job job = jobRepository.findById(application.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));
        String content = String.format("You have been invited for an interview for position: %s. Time: %s, Location: %s",
            job.getTitle(), interviewTime, location);
        notificationAppService.create(
            application.getUserId(),
            NotificationType.INTERVIEW_INVITED,
            "Interview Invitation",
            content,
            application.getId()
        );

        return application;
    }

    /**
     * 按简历ID+职位ID发送面试邀请（推荐场景）
     */
    @Transactional
    public Application sendInterviewInvitationByResume(Long companyId, Long resumeId, Long jobId,
                                                       LocalDateTime interviewTime, String location, String remark) {
        Application application = applicationRepository.findByResumeIdAndJobId(resumeId, jobId)
                .orElseThrow(() -> new RuntimeException("Application not found by resume and job"));
        return sendInterviewInvitation(companyId, application.getId(), interviewTime, location, remark);
    }

    // ==================== 人才库方法 ====================

    /**
     * 加入人才库
     * 【功能说明】企业将候选人简历加入人才库。
     */
    @Transactional
    public TalentPool addToTalentPool(Long companyId, Long resumeId, String note) {
        // 校验简历存在
        if (!resumeRepository.findById(resumeId).isPresent()) {
            throw new RuntimeException("Resume not found: " + resumeId);
        }

        // 校验未在人才库中
        if (talentPoolRepository.existsByCompanyIdAndResumeId(companyId, resumeId)) {
            throw new RuntimeException("Resume already in talent pool");
        }

        TalentPool talentPool = new TalentPool();
        talentPool.setCompanyId(companyId);
        talentPool.setResumeId(resumeId);
        talentPool.setNote(note);
        talentPool.setAddedAt(LocalDateTime.now());
        talentPool.setStatus(TalentPool.TalentPoolStatus.ACTIVE);
        return talentPoolRepository.save(talentPool);
    }

    /**
     * 从人才库移除
     * 【功能说明】企业将候选人简历从人才库移除。
     */
    @Transactional
    public void removeFromTalentPool(Long companyId, Long resumeId) {
        if (!talentPoolRepository.existsByCompanyIdAndResumeId(companyId, resumeId)) {
            throw new RuntimeException("Resume not in talent pool");
        }
        talentPoolRepository.deleteByCompanyIdAndResumeId(companyId, resumeId);
    }

    /**
     * 获取企业人才库
     * 【功能说明】查询企业人才库中的所有简历。
     */
    public List<TalentPool> getCompanyTalentPool(Long companyId) {
        return talentPoolRepository.findByCompanyId(companyId);
    }
}
