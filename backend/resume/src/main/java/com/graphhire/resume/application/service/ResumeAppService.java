package com.graphhire.resume.application.service;

import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.resume.infrastructure.mq.ResumeMQProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResumeAppService {
    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private RustFSClient rustFSClient;

    @Autowired
    private ResumeMQProducer mqProducer;

    @Transactional
    public Resume uploadResume(UploadResumeCmd cmd) {
        // 1. Upload file to RustFS
        String filePath = rustFSClient.upload(cmd.getFileBytes(), cmd.getFileName());
        // 2. Create resume aggregate root
        Resume resume = new Resume();
        resume.setUserId(cmd.getUserId());
        resume.upload(filePath, cmd.getFileName());
        // 3. Save
        Resume saved = resumeRepository.save(resume);
        // 4. Send MQ message to trigger parsing
        mqProducer.sendResumeUploadedEvent(saved);
        return saved;
    }
}
