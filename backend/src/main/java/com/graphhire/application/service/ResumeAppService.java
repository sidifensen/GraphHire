package com.graphhire.application.service;

import com.graphhire.application.command.ResumeUploadCmd;
import com.graphhire.application.dto.PageResult;
import com.graphhire.application.dto.ResumeDetailResponse;
import com.graphhire.application.dto.ResumeUploadResponse;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.ParseStatus;
import com.graphhire.domain.vo.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeAppService {
    private final ResumeRepository resumeRepository;
    private final ParseTaskRepository parseTaskRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public ResumeUploadResponse upload(Long userId, ResumeUploadCmd cmd) {
        log.info("Uploading resume for userId: {}, fileName: {}", userId, cmd.getFileName());

        // Verify user exists
        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // Create resume record
        Resume resume = Resume.builder()
                .userId(userId)
                .fileName(cmd.getFileName())
                .filePath(cmd.getFilePath())
                .fileType(cmd.getFileType())
                .fileSize(cmd.getFileSize())
                .parseStatus(ParseStatus.PENDING)
                .isDefault(false)
                .createdAt(LocalDateTime.now())
                .build();
        resumeRepository.save(resume);

        // Check if this is the first resume, set as default
        int count = resumeRepository.countByUserId(userId);
        if (count == 1) {
            resume.setIsDefault(true);
            resumeRepository.save(resume);
        }

        // Create parse task
        ParseTask parseTask = ParseTask.builder()
                .resumeId(resume.getId())
                .taskType("RESUME_PARSE")
                .status(TaskStatus.PENDING)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();
        parseTaskRepository.save(parseTask);

        log.info("Resume uploaded successfully: resumeId={}, parseTaskId={}", resume.getId(), parseTask.getId());

        return ResumeUploadResponse.builder()
                .resumeId(resume.getId())
                .parseTaskId(parseTask.getId())
                .message("简历上传成功，解析任务已创建")
                .build();
    }

    public ResumeDetailResponse getDetail(Long resumeId, Long userId) {
        log.info("Getting resume detail: resumeId={}, userId={}", resumeId, userId);

        Resume resume = resumeRepository.findByIdOptional(resumeId)
                .orElseThrow(() -> new RuntimeException("简历不存在"));

        // Verify ownership
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权限查看此简历");
        }

        return ResumeDetailResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileType(resume.getFileType())
                .parseStatus(resume.getParseStatus())
                .parseResult(resume.getParseResult())
                .confidence(resume.getConfidence())
                .isDefault(resume.getIsDefault())
                .createdAt(resume.getCreatedAt())
                .build();
    }

    @Transactional
    public void setDefault(Long resumeId, Long userId) {
        log.info("Setting default resume: resumeId={}, userId={}", resumeId, userId);

        Resume resume = resumeRepository.findByIdOptional(resumeId)
                .orElseThrow(() -> new RuntimeException("简历不存在"));

        // Verify ownership
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作此简历");
        }

        // Remove default from all other resumes
        List<Resume> userResumes = resumeRepository.findByUserId(userId);
        for (Resume r : userResumes) {
            if (r.getIsDefault() && !r.getId().equals(resumeId)) {
                r.setIsDefault(false);
                resumeRepository.save(r);
            }
        }

        // Set this resume as default
        resume.setIsDefault(true);
        resumeRepository.save(resume);

        log.info("Default resume set successfully");
    }

    @Transactional
    public void delete(Long resumeId, Long userId) {
        log.info("Deleting resume: resumeId={}, userId={}", resumeId, userId);

        Resume resume = resumeRepository.findByIdOptional(resumeId)
                .orElseThrow(() -> new RuntimeException("简历不存在"));

        // Verify ownership
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权限删除此简历");
        }

        // Delete associated parse tasks
        List<ParseTask> tasks = parseTaskRepository.findByResumeId(resumeId);
        for (ParseTask task : tasks) {
            parseTaskRepository.delete(task.getId());
        }

        // Delete the resume
        resumeRepository.delete(resumeId);

        log.info("Resume deleted successfully");
    }

    public PageResult<Resume> list(Long userId, Integer page, Integer pageSize) {
        log.info("Listing resumes for userId: {}, page: {}, pageSize: {}", userId, page, pageSize);

        List<Resume> resumes = resumeRepository.findByUserId(userId, page, pageSize);
        Long total = (long) resumeRepository.countByUserId(userId);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Resume>builder()
                .records(resumes)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }
}
