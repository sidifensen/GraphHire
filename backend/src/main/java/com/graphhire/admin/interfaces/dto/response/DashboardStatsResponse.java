package com.graphhire.admin.interfaces.dto.response;

import java.util.ArrayList;
import java.util.List;

/**
 * 管理端仪表盘统计响应
 */
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalCompanies;
    private long totalResumes;
    private long totalJobs;
    private long dailyActiveUsers;

    private long todayNewUsers;
    private long todayNewJobs;

    private long pendingCompanyAudit;
    private long pendingTaskCount;
    private long failedTaskCount;

    private long matchCount;
    private double taskSuccessRate;
    private double userGrowthRate;
    private double companyGrowthRate;
    private double resumeGrowthRate;
    private double jobGrowthRate;
    private double matchGrowthRate;
    private double matchConversionRate;
    private long weeklyNewCompanies;
    private long pendingSkillSuggestions;
    private String updatedAt;

    private List<TrendPoint> trend = new ArrayList<>();

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalUsers, long totalCompanies, long totalResumes, long totalJobs, long matchCount) {
        this.totalUsers = totalUsers;
        this.totalCompanies = totalCompanies;
        this.totalResumes = totalResumes;
        this.totalJobs = totalJobs;
        this.matchCount = matchCount;
    }

    /** 兼容旧测试 */
    public long getPersonCount() {
        return totalUsers;
    }

    /** 兼容旧测试 */
    public long getCompanyCount() {
        return totalCompanies;
    }

    /** 兼容旧测试 */
    public long getResumeCount() {
        return totalResumes;
    }

    /** 兼容旧测试 */
    public long getJobCount() {
        return totalJobs;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(long totalCompanies) {
        this.totalCompanies = totalCompanies;
    }

    public long getTotalResumes() {
        return totalResumes;
    }

    public void setTotalResumes(long totalResumes) {
        this.totalResumes = totalResumes;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getTodayNewUsers() {
        return todayNewUsers;
    }

    public void setTodayNewUsers(long todayNewUsers) {
        this.todayNewUsers = todayNewUsers;
    }

    public long getTodayNewJobs() {
        return todayNewJobs;
    }

    public void setTodayNewJobs(long todayNewJobs) {
        this.todayNewJobs = todayNewJobs;
    }

    public long getPendingCompanyAudit() {
        return pendingCompanyAudit;
    }

    public void setPendingCompanyAudit(long pendingCompanyAudit) {
        this.pendingCompanyAudit = pendingCompanyAudit;
    }

    public long getPendingTaskCount() {
        return pendingTaskCount;
    }

    public void setPendingTaskCount(long pendingTaskCount) {
        this.pendingTaskCount = pendingTaskCount;
    }

    public long getFailedTaskCount() {
        return failedTaskCount;
    }

    public void setFailedTaskCount(long failedTaskCount) {
        this.failedTaskCount = failedTaskCount;
    }

    public long getMatchCount() {
        return matchCount;
    }

    public void setMatchCount(long matchCount) {
        this.matchCount = matchCount;
    }

    public double getTaskSuccessRate() {
        return taskSuccessRate;
    }

    public void setTaskSuccessRate(double taskSuccessRate) {
        this.taskSuccessRate = taskSuccessRate;
    }

    public double getUserGrowthRate() {
        return userGrowthRate;
    }

    public void setUserGrowthRate(double userGrowthRate) {
        this.userGrowthRate = userGrowthRate;
    }

    public double getCompanyGrowthRate() {
        return companyGrowthRate;
    }

    public void setCompanyGrowthRate(double companyGrowthRate) {
        this.companyGrowthRate = companyGrowthRate;
    }

    public double getResumeGrowthRate() {
        return resumeGrowthRate;
    }

    public void setResumeGrowthRate(double resumeGrowthRate) {
        this.resumeGrowthRate = resumeGrowthRate;
    }

    public double getJobGrowthRate() {
        return jobGrowthRate;
    }

    public void setJobGrowthRate(double jobGrowthRate) {
        this.jobGrowthRate = jobGrowthRate;
    }

    public double getMatchGrowthRate() {
        return matchGrowthRate;
    }

    public void setMatchGrowthRate(double matchGrowthRate) {
        this.matchGrowthRate = matchGrowthRate;
    }

    public double getMatchConversionRate() {
        return matchConversionRate;
    }

    public void setMatchConversionRate(double matchConversionRate) {
        this.matchConversionRate = matchConversionRate;
    }

    public long getWeeklyNewCompanies() {
        return weeklyNewCompanies;
    }

    public void setWeeklyNewCompanies(long weeklyNewCompanies) {
        this.weeklyNewCompanies = weeklyNewCompanies;
    }

    public long getPendingSkillSuggestions() {
        return pendingSkillSuggestions;
    }

    public void setPendingSkillSuggestions(long pendingSkillSuggestions) {
        this.pendingSkillSuggestions = pendingSkillSuggestions;
    }

    public long getDailyActiveUsers() {
        return dailyActiveUsers;
    }

    public void setDailyActiveUsers(long dailyActiveUsers) {
        this.dailyActiveUsers = dailyActiveUsers;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TrendPoint> getTrend() {
        return trend;
    }

    public void setTrend(List<TrendPoint> trend) {
        this.trend = trend;
    }

    public static class TrendPoint {
        private String date;
        private long activeUsers;
        private long newData;

        public TrendPoint() {
        }

        public TrendPoint(String date, long activeUsers, long newData) {
            this.date = date;
            this.activeUsers = activeUsers;
            this.newData = newData;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getActiveUsers() {
            return activeUsers;
        }

        public void setActiveUsers(long activeUsers) {
            this.activeUsers = activeUsers;
        }

        public long getNewData() {
            return newData;
        }

        public void setNewData(long newData) {
            this.newData = newData;
        }
    }
}
