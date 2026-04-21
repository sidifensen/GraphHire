package com.graphhire.admin.interfaces.dto.response;

public class AdminTaskSummaryResponse {
    private long pending;
    private long processing;
    private long completed;
    private long failed;

    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }
    public long getProcessing() { return processing; }
    public void setProcessing(long processing) { this.processing = processing; }
    public long getCompleted() { return completed; }
    public void setCompleted(long completed) { this.completed = completed; }
    public long getFailed() { return failed; }
    public void setFailed(long failed) { this.failed = failed; }
}
