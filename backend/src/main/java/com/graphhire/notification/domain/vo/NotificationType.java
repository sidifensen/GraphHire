package com.graphhire.notification.domain.vo;

public enum NotificationType {
    RESUME_PARSED(1, "Resume Parsed"),
    JOB_RECOMMENDATION(2, "Job Recommendation"),
    CANDIDATE_RECOMMENDATION(3, "Candidate Recommendation"),
    COMPANY_AUTH_RESULT(4, "Company Auth Result"),
    RESUME_VIEWED(5, "Resume Viewed"),
    SYSTEM_NOTIFICATION(99, "System Notification");

    private final int value;
    private final String title;

    NotificationType(int value, String title) {
        this.value = value;
        this.title = title;
    }

    public int getValue() {
        return value;
    }

    public String getTitle() {
        return title;
    }

    public static NotificationType fromValue(int value) {
        for (NotificationType type : values()) {
            if (type.value == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown notification type value: " + value);
    }
}
