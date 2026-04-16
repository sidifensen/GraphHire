package com.graphhire.resume.application.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.graphhire.common.vo.PageResult;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;

import java.io.IOException;
import com.graphhire.resume.iface.dto.ResumeVO;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.resume.infrastructure.mq.ResumeMQProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeAppService {
    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private RustFSClient rustFSClient;

    @Autowired(required = false)
    private ResumeMQProducer mqProducer;

    @Transactional
    public Resume uploadResume(UploadResumeCmd cmd) throws IOException {
        // 1. Upload file to RustFS
        String filePath = rustFSClient.upload(cmd.getFileBytes(), cmd.getFileName());
        // 2. Create resume aggregate root
        Resume resume = new Resume();
        resume.setUserId(cmd.getUserId());
        resume.upload(filePath, cmd.getFileName());
        // 3. Save resume
        Resume saved = resumeRepository.save(resume);

        // 4. Create parse_task
        ParseTask task = new ParseTask();
        task.setResumeId(saved.getId());
        task.setTaskType("resume_parse");
        task.setStatus(ParseTask.TaskStatus.PENDING);
        parseTaskRepository.save(task);

        // 5. Send MQ message to trigger AI parsing (if MQ is enabled)
        if (mqProducer != null) {
            mqProducer.sendResumeParseMessage(saved.getId(), task.getId());
        }

        return saved;
    }

    public Resume getResumeById(Long resumeId) {
        return resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("简历不存在"));
    }

    public ResumeVO getDetail(Long id) {
        Resume resume = getResumeById(id);
        return toResumeVO(resume);
    }

    public PageResult<ResumeVO> getList(int page, int size) {
        IPage<Resume> pageResult = resumeRepository.findPage(page, size);
        List<ResumeVO> vos = pageResult.getRecords().stream()
            .map(this::toResumeVO)
            .toList();
        return new PageResult<>(vos, pageResult.getTotal(), (int) pageResult.getCurrent(), (int) pageResult.getSize());
    }

    private ResumeVO toResumeVO(Resume resume) {
        ResumeVO vo = new ResumeVO();
        vo.setId(resume.getId());
        vo.setUserId(resume.getUserId());
        vo.setFileName(resume.getFileName());
        vo.setFileType(resume.getFileType());
        vo.setFileSize(resume.getFileSize());
        if (resume.getStatus() != null) {
            vo.setParseStatus(resume.getStatus().ordinal());
        }
        vo.setParseResult(resume.getParseResult());
        vo.setConfidence(resume.getConfidence());
        vo.setIsDefault(resume.getIsDefault());
        return vo;
    }

    public List<Resume> getResumesByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此简历");
        }
        resumeRepository.delete(resume);
    }

    @Transactional
    public void setDefaultResume(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权设置此简历");
        }
        // Unset other default resumes for this user
        List<Resume> userResumes = getResumesByUserId(userId);
        for (Resume r : userResumes) {
            if (Boolean.TRUE.equals(r.getIsDefault())) {
                r.setIsDefault(false);
                resumeRepository.save(r);
            }
        }
        // Set this resume as default
        resume.setIsDefault(true);
        resumeRepository.save(resume);
    }

    @Transactional
    public void triggerResumeParse(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权解析此简历");
        }
        // Mark as parsing and send MQ event to trigger AI parsing (if MQ is enabled)
        resume.markParsing();
        resumeRepository.save(resume);
        if (mqProducer != null) {
            mqProducer.sendResumeUploadedEvent(resume);
        }
    }

    public Resume getResumeDetail(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权查看此简历");
        }
        return resume;
    }
}
