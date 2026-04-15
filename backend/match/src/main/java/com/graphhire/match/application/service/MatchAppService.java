package com.graphhire.match.application.service;

import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.match.application.command.TriggerMatchCmd;
import com.graphhire.match.application.query.MatchDetailQuery;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.service.MatchDomainService;
import com.graphhire.match.infrastructure.mq.MatchMQConsumer;
import com.graphhire.match.interface.dto.response.MatchDetailResponse;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    @Transactional
    public MatchRecord triggerMatch(TriggerMatchCmd cmd) {
        MatchRecord matchRecord = matchDomainService.calculateMatch(cmd.getResumeId(), cmd.getJobId());
        return matchRecordRepository.save(matchRecord);
    }

    @Transactional
    public void triggerMatchForResume(Long resumeId) {
        List<Job> jobs = jobRepository.findAllPublished();
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        for (Job job : jobs) {
            MatchRecord matchRecord = matchDomainService.calculateMatch(resumeId, job.getId());
            matchRecordRepository.save(matchRecord);
        }
    }

    @Transactional
    public void triggerMatchForJob(Long jobId) {
        List<Resume> resumes = resumeRepository.findAll();
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        for (Resume resume : resumes) {
            MatchRecord matchRecord = matchDomainService.calculateMatch(resume.getId(), jobId);
            matchRecordRepository.save(matchRecord);
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
}
