package com.graphhire.notification.domain.vo;

public enum NotificationType {
    RESUME_PARSED("Resume Parsed", "Your resume has been successfully parsed"),
    MATCH_COMPLETED("Match Completed", "A new candidate/job match has been completed"),
    NEW_CANDIDATE("New Candidate", "You have a new candidate matching your job"),
    JOB_APPLIED("Job Applied", "Your application has been submitted"),
    APPLICATION_VIEWED("Application Viewed", "Your application has been viewed by the employer"),
    INTERVIEW_INVITATION("Interview Invitation", "You have received an interview invitation"),
    SYSTEM_NOTIFICATION("System Notification", "System notification"),
    ACCOUNT_UPDATE("Account Update", "Your account information has been updated");

    private final String title;
    private final String description;

    NotificationType(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
}
