package com.graphhire.application.domain.model;

import java.time.LocalDateTime;

public class TalentPool {
    public enum TalentPoolStatus { ACTIVE, ARCHIVED }

    private Long id;
    private Long companyId;
    private Long resumeId;
    private LocalDateTime addedAt;
    private String note;
    private TalentPoolStatus status;

    public TalentPool() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public TalentPoolStatus getStatus() { return status; }
    public void setStatus(TalentPoolStatus status) { this.status = status; }
}
