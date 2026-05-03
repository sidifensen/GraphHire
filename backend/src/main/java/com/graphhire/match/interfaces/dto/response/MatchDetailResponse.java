package com.graphhire.match.interfaces.dto.response;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.graphhire.job.domain.model.Job;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.vo.MatchLevel;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;

import java.util.ArrayList;
import java.util.List;

public class MatchDetailResponse {
    private Long matchId;
    private Long resumeId;
    private Long jobId;
    private MatchScore score;
    private MatchLevel level;
    private String matchReason;
    private ResumeBasicInfo resume;
    private JobBasicInfo job;

    public MatchDetailResponse() {
    }

    public MatchDetailResponse(MatchRecord record, Resume resume, Job job) {
        this(record, resume, job, null);
    }

    public MatchDetailResponse(MatchRecord record, Resume resume, Job job, PersonInfo personInfo) {
        this.matchId = record.getId();
        this.resumeId = record.getResumeId();
        this.jobId = record.getJobId();
        this.score = record.getScore();
        this.level = record.getLevel();
        this.matchReason = record.getMatchReason();
        this.resume = resume != null ? new ResumeBasicInfo(resume, personInfo) : null;
        this.job = job != null ? new JobBasicInfo(job) : null;
    }

    public Long getMatchId() { return matchId; }
    public Long getResumeId() { return resumeId; }
    public Long getJobId() { return jobId; }
    public MatchScore getScore() { return score; }
    public MatchLevel getLevel() { return level; }
    public String getMatchReason() { return matchReason; }
    public ResumeBasicInfo getResume() { return resume; }
    public JobBasicInfo getJob() { return job; }

    public static class ResumeBasicInfo {
        private Long id;
        private String fileName;
        private String userName;
        private String avatarUrl;
        private List<String> skills;
        private String education;
        private String experience;

        public ResumeBasicInfo(Resume resume, PersonInfo personInfo) {
            this.id = resume.getId();
            this.fileName = resume.getFileName();
            if (personInfo != null) {
                this.userName = StrUtil.emptyToNull(StrUtil.trim(personInfo.getRealName()));
                String avatarPath = StrUtil.emptyToNull(StrUtil.trim(personInfo.getAvatarUrl()));
                if (avatarPath != null) {
                    this.avatarUrl = "/person/avatar/public/" + resume.getUserId();
                }
            }

            ParseResultSummary summary = ParseResultSummary.from(resume.getParseResult());
            this.skills = summary.skills();
            this.education = summary.education();
            this.experience = summary.experience();
        }

        public Long getId() { return id; }
        public String getFileName() { return fileName; }
        public String getUserName() { return userName; }
        public String getAvatarUrl() { return avatarUrl; }
        public List<String> getSkills() { return skills; }
        public String getEducation() { return education; }
        public String getExperience() { return experience; }
    }

    public static class JobBasicInfo {
        private Long id;
        private String title;
        private String companyName;

        public JobBasicInfo(Job job) {
            this.id = job.getId();
            this.title = job.getTitle();
        }

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getCompanyName() { return companyName; }
    }

    private record ParseResultSummary(List<String> skills, String education, String experience) {

        private static ParseResultSummary empty() {
            return new ParseResultSummary(List.of(), null, null);
        }

        static ParseResultSummary from(String parseResultJson) {
            if (StrUtil.isBlank(parseResultJson)) {
                return empty();
            }
            try {
                JSONObject root = JSONUtil.parseObj(parseResultJson);
                List<String> skills = extractSkills(root);
                String education = extractEducation(root);
                String experience = extractExperience(root);
                return new ParseResultSummary(skills, education, experience);
            } catch (Exception ignored) {
                return empty();
            }
        }

        private static List<String> extractSkills(JSONObject root) {
            JSONArray skillsArray = root.getJSONArray("skills");
            if (skillsArray == null || skillsArray.isEmpty()) {
                return List.of();
            }
            List<String> result = new ArrayList<>();
            for (int i = 0; i < skillsArray.size(); i++) {
                Object item = skillsArray.get(i);
                String value = item == null ? null : item.toString().trim();
                if (StrUtil.isNotBlank(value)) {
                    result.add(value);
                }
            }
            return result;
        }

        private static String extractEducation(JSONObject root) {
            Object education = root.get("education");
            if (education == null) {
                return null;
            }
            if (education instanceof CharSequence text) {
                return StrUtil.emptyToNull(text.toString().trim());
            }
            if (education instanceof JSONArray educationArray && !educationArray.isEmpty()) {
                Object first = educationArray.get(0);
                if (first == null) {
                    return null;
                }
                if (first instanceof JSONObject firstObject) {
                    return StrUtil.emptyToNull(firstObject.getStr("degree"));
                }
                return StrUtil.emptyToNull(first.toString().trim());
            }
            return null;
        }

        private static String extractExperience(JSONObject root) {
            Object experience = root.get("experience");
            if (experience == null) {
                return null;
            }
            if (experience instanceof CharSequence text) {
                return StrUtil.emptyToNull(text.toString().trim());
            }
            if (experience instanceof JSONArray experienceArray) {
                int size = experienceArray.size();
                if (size == 0) {
                    return null;
                }
                return size + "段经历";
            }
            return null;
        }
    }
}
