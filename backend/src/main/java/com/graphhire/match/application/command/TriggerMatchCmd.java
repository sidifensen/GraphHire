package com.graphhire.match.application.command;

public class TriggerMatchCmd {
    private Long resumeId;
    private Long jobId;

    public TriggerMatchCmd() {
    }

    public TriggerMatchCmd(Long resumeId, Long jobId) {
        this.resumeId = resumeId;
        this.jobId = jobId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public Long getJobId() {
        return jobId;
    }
}
