package com.graphhire.web.converter;

import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.MatchRecord;
import com.graphhire.web.dto.response.MatchDetailResponse;
import com.graphhire.web.dto.response.MatchListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MatchConverter {
    public MatchDetailResponse toDetailResponse(MatchRecord record, Job job) {
        if (record == null) {
            return null;
        }
        MatchDetailResponse response = new MatchDetailResponse();
        response.setMatchRecordId(record.getId());
        response.setResumeId(record.getResumeId());
        response.setJobId(record.getJobId());
        response.setJobTitle(job != null ? job.getJobTitle() : null);
        response.setOverallScore(record.getOverallScore());
        response.setSkillScore(record.getSkillScore());
        response.setExperienceScore(record.getExperienceScore());
        response.setCityScore(record.getCityScore());
        response.setEducationScore(record.getEducationScore());
        response.setSalaryScore(record.getSalaryScore());
        response.setMatchReport(record.getMatchReport());
        response.setStatus(record.getStatus());
        response.setCreatedAt(record.getCreatedAt());
        return response;
    }

    public MatchListResponse toListResponse(MatchRecord record, Job job) {
        if (record == null) {
            return null;
        }
        MatchListResponse response = new MatchListResponse();
        response.setMatchRecordId(record.getId());
        response.setResumeId(record.getResumeId());
        response.setJobId(record.getJobId());
        response.setJobTitle(job != null ? job.getJobTitle() : null);
        response.setOverallScore(record.getOverallScore());
        response.setMatchReason(record.getMatchReport());
        response.setStatus(record.getStatus());
        response.setCreatedAt(record.getCreatedAt());
        return response;
    }
}
