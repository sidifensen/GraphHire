package com.graphhire.application.service;

import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.AuthStatus;
import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.NotificationType;
import com.graphhire.domain.vo.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAppService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ParseTaskRepository parseTaskRepository;
    private final NotificationRepository notificationRepository;

    public PageResult<User> listUsers(String keyword, UserType userType, Integer page, Integer pageSize) {
        log.info("Listing users: keyword={}, userType={}, page={}, pageSize={}", keyword, userType, page, pageSize);

        List<User> users = userRepository.findByKeyword(keyword, userType, page, pageSize);
        Long total = userRepository.countByKeyword(keyword, userType);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<User>builder()
                .records(users)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    @Transactional
    public void enableUser(Long userId) {
        log.info("Enabling user: userId={}", userId);

        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setStatus(1);
        userRepository.save(user);

        log.info("User enabled successfully");
    }

    @Transactional
    public void disableUser(Long userId) {
        log.info("Disabling user: userId={}", userId);

        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setStatus(0);
        userRepository.save(user);

        log.info("User disabled successfully");
    }

    public PageResult<Company> listPendingCompanies(Integer page, Integer pageSize) {
        log.info("Listing pending companies: page={}, pageSize={}", page, pageSize);

        List<Company> companies = companyRepository.findByAuthStatus(AuthStatus.PENDING, page, pageSize);
        Long total = companyRepository.countByAuthStatus(AuthStatus.PENDING);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Company>builder()
                .records(companies)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    @Transactional
    public void authCompany(Long companyId, boolean approved, String reason) {
        log.info("Authenticating company: companyId={}, approved={}", companyId, approved);

        Company company = companyRepository.findByIdOptional(companyId)
                .orElseThrow(() -> new RuntimeException("企业不存在"));

        if (approved) {
            company.setAuthStatus(AuthStatus.APPROVED);
        } else {
            company.setAuthStatus(AuthStatus.REJECTED);
        }
        company.setAuthReason(reason);
        company.setAuthTime(LocalDateTime.now());
        companyRepository.save(company);

        // Send notification to company user
        Notification notification = Notification.builder()
                .userId(company.getUserId())
                .type(NotificationType.COMPANY_AUTH_RESULT)
                .title(approved ? "企业认证通过" : "企业认证被拒绝")
                .content(approved ? "恭喜！您的企业认证已通过。" : "很遗憾，您的企业认证被拒绝。原因：" + reason)
                .isRead(false)
                .referenceId(companyId)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        log.info("Company authentication processed: companyId={}", companyId);
    }

    public PageResult<Resume> listResumes(String keyword, Integer page, Integer pageSize) {
        log.info("Listing resumes: keyword={}, page={}, pageSize={}", keyword, page, pageSize);

        List<Resume> resumes = resumeRepository.findByKeyword(keyword, page, pageSize);
        Long total = resumeRepository.countByKeyword(keyword);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Resume>builder()
                .records(resumes)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    public PageResult<Job> listJobs(String keyword, Integer page, Integer pageSize) {
        log.info("Listing jobs: keyword={}, page={}, pageSize={}", keyword, page, pageSize);

        List<Job> jobs = jobRepository.findByKeyword(keyword, page, pageSize);
        Long total = jobRepository.countByKeyword(keyword);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Job>builder()
                .records(jobs)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    @Transactional
    public void deleteResume(Long resumeId) {
        log.info("Deleting resume: resumeId={}", resumeId);

        // Delete associated parse tasks
        List<ParseTask> tasks = parseTaskRepository.findByResumeId(resumeId);
        for (ParseTask task : tasks) {
            parseTaskRepository.delete(task.getId());
        }

        // Delete the resume
        resumeRepository.delete(resumeId);

        log.info("Resume deleted successfully");
    }

    @Transactional
    public void deleteJob(Long jobId) {
        log.info("Deleting job: jobId={}", jobId);

        // Delete associated parse tasks
        List<ParseTask> tasks = parseTaskRepository.findByJobId(jobId);
        for (ParseTask task : tasks) {
            parseTaskRepository.delete(task.getId());
        }

        // Delete the job
        jobRepository.delete(jobId);

        log.info("Job deleted successfully");
    }

    public Map<String, Object> getDashboardStats() {
        log.info("Getting dashboard stats");

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.countAll());
        stats.put("totalPersons", userRepository.countByUserType(UserType.PERSON));
        stats.put("totalCompanies", userRepository.countByUserType(UserType.COMPANY));
        stats.put("totalResumes", resumeRepository.countAll());
        stats.put("totalJobs", jobRepository.countAll());
        stats.put("publishedJobs", jobRepository.countByJobStatus(JobStatus.PUBLISHED));
        stats.put("pendingCompanies", companyRepository.countByAuthStatus(AuthStatus.PENDING));
        stats.put("pendingParseTasks", parseTaskRepository.countPending());

        return stats;
    }
}
