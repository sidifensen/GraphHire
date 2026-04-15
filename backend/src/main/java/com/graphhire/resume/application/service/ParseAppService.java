package com.graphhire.resume.application.service;

import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParseAppService {
    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private DocumentParser documentParser;

    @Transactional
    public void processResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Create parse task
        ParseTask task = new ParseTask();
        task.setResumeId(resumeId);
        task.schedule();
        parseTaskRepository.save(task);

        // Mark resume as parsing
        resume.markParsing();
        resumeRepository.save(resume);

        try {
            // Parse document
            String rawText = documentParser.extractText(resume.getFilePath());

            // Perform parsing (AI extraction would go here)
            String parseResult = documentParser.parse(rawText);

            // Mark success
            task.markSuccess();
            parseTaskRepository.save(task);

            resume.parsed(parseResult);
            resumeRepository.save(resume);
        } catch (Exception e) {
            // Mark failed
            task.markFailed(e.getMessage());
            parseTaskRepository.save(task);

            resume.parseFailed(e.getMessage());
            resumeRepository.save(resume);
        }
    }
}
