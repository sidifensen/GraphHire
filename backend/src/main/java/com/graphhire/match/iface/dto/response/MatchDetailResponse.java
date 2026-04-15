package com.graphhire.match.iface.dto.response;

import com.graphhire.job.domain.model.Job;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.vo.MatchLevel;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.resume.domain.model.Resume;

public class MatchDetailResponse {
    private Long matchId;
    private Long resumeId;
    private Long jobId;
    private MatchScore score;
    private MatchLevel level;
    private String matchReason;
    private Boolean isRead;
    private ResumeBasicInfo resume;
    private JobBasicInfo job;

    public MatchDetailResponse() {
    }

    public MatchDetailResponse(MatchRecord record, Resume resume, Job job) {
        this.matchId = record.getId();
        this.resumeId = record.getResumeId();
        this.jobId = record.getJobId();
        this.score = record.getScore();
        this.level = record.getLevel();
        this.matchReason = record.getMatchReason();
        this.isRead = record.getIsRead();
        this.resume = resume != null ? new ResumeBasicInfo(resume) : null;
        this.job = job != null ? new JobBasicInfo(job) : null;
    }

    public Long getMatchId() {
        return matchId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public MatchScore getScore() {
        return score;
    }

    public MatchLevel getLevel() {
        return level;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public ResumeBasicInfo getResume() {
        return resume;
    }

    public JobBasicInfo getJob() {
        return job;
    }

    public static class ResumeBasicInfo {
        private Long id;
        private String fileName;
        private String userName;

        public ResumeBasicInfo(Resume resume) {
            this.id = resume.getId();
            this.fileName = resume.getFileName();
        }

        public Long getId() {
            return id;
        }

        public String getFileName() {
            return fileName;
        }

        public String getUserName() {
            return userName;
        }
    }

    public static class JobBasicInfo {
        private Long id;
        private String title;
        private String companyName;

        public JobBasicInfo(Job job) {
            this.id = job.getId();
            this.title = job.getTitle();
        }

        public Long getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public String getCompanyName() {
            return companyName;
        }
    }
}
