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
    private ActiveOverview activeOverview;
    private List<TodoItem> todos = new ArrayList<>();
    private List<HotSkillItem> hotSkills = new ArrayList<>();
    private List<SystemActivityItem> systemActivities = new ArrayList<>();

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

    public ActiveOverview getActiveOverview() {
        return activeOverview;
    }

    public void setActiveOverview(ActiveOverview activeOverview) {
        this.activeOverview = activeOverview;
    }

    public List<TodoItem> getTodos() {
        return todos;
    }

    public void setTodos(List<TodoItem> todos) {
        this.todos = todos;
    }

    public List<HotSkillItem> getHotSkills() {
        return hotSkills;
    }

    public void setHotSkills(List<HotSkillItem> hotSkills) {
        this.hotSkills = hotSkills;
    }

    public List<SystemActivityItem> getSystemActivities() {
        return systemActivities;
    }

    public void setSystemActivities(List<SystemActivityItem> systemActivities) {
        this.systemActivities = systemActivities;
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

    public static class ActiveOverview {
        private long activeUserCount;
        private double taskSuccessRate;
        private long matchCount;

        public long getActiveUserCount() {
            return activeUserCount;
        }

        public void setActiveUserCount(long activeUserCount) {
            this.activeUserCount = activeUserCount;
        }

        public double getTaskSuccessRate() {
            return taskSuccessRate;
        }

        public void setTaskSuccessRate(double taskSuccessRate) {
            this.taskSuccessRate = taskSuccessRate;
        }

        public long getMatchCount() {
            return matchCount;
        }

        public void setMatchCount(long matchCount) {
            this.matchCount = matchCount;
        }
    }

    public static class TodoItem {
        private String type;
        private String title;
        private String description;
        private String actionText;
        private String actionPath;
        private String level;
        private long count;
        private String updatedAt;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getActionText() {
            return actionText;
        }

        public void setActionText(String actionText) {
            this.actionText = actionText;
        }

        public String getActionPath() {
            return actionPath;
        }

        public void setActionPath(String actionPath) {
            this.actionPath = actionPath;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
        }
    }

    public static class HotSkillItem {
        private String name;
        private int heat;
        private int count;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getHeat() {
            return heat;
        }

        public void setHeat(int heat) {
            this.heat = heat;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }

    public static class SystemActivityItem {
        private String type;
        private String actor;
        private String action;
        private String target;
        private String detail;
        private String createdAt;
        private String level;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getActor() {
            return actor;
        }

        public void setActor(String actor) {
            this.actor = actor;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getTarget() {
            return target;
        }

        public void setTarget(String target) {
            this.target = target;
        }

        public String getDetail() {
            return detail;
        }

        public void setDetail(String detail) {
            this.detail = detail;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }
    }
}
