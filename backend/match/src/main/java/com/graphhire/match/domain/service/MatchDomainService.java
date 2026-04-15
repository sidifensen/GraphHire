package com.graphhire.match.domain.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class MatchDomainService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillTagRepository skillTagRepository;

    @Autowired
    private SkillNormalizationService normalizationService;

    public MatchRecord calculateMatch(Long resumeId, Long jobId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        List<String> resumeSkills = normalizationService.normalize(resume.getSkills());
        List<String> jobSkills = normalizationService.normalize(job.getRequiredSkills());
        double skillScore = calculateSkillScore(resumeSkills, jobSkills);

        double expScore = calculateExperienceScore(resume, job);
        double cityScore = calculateCityScore(resume, job);
        double eduScore = calculateEducationScore(resume, job);
        double salScore = calculateSalaryScore(resume, job);

        MatchScore score = MatchScore.of(skillScore, expScore, cityScore, eduScore, salScore);
        return MatchRecord.create(resumeId, jobId, score);
    }

    public double calculateSkillScore(List<String> resumeSkills, List<String> jobSkills) {
        Set<String> resumeSet = new HashSet<>(resumeSkills);
        Set<String> jobSet = new HashSet<>(jobSkills);
        Set<String> intersection = new HashSet<>(resumeSet);
        intersection.retainAll(jobSet);
        if (jobSet.isEmpty()) return 0;
        return (double) intersection.size() / jobSet.size() * 100;
    }

    private double calculateExperienceScore(Resume resume, Job job) {
        Integer resumeYears = resume.getWorkExperienceYears();
        Integer requiredYears = job.getMinExperienceYears();
        if (requiredYears == null || requiredYears == 0) return 100;
        if (resumeYears == null) return 0;
        if (resumeYears >= requiredYears) return 100;
        return (double) resumeYears / requiredYears * 100;
    }

    private double calculateCityScore(Resume resume, Job job) {
        String resumeCity = resume.getExpectedLocation();
        String jobCity = job.getLocation().getCity();
        if (resumeCity == null || jobCity == null) return 50;
        if (resumeCity.equalsIgnoreCase(jobCity)) return 100;
        return 0;
    }

    private double calculateEducationScore(Resume resume, Job job) {
        String resumeEdu = resume.getEducation();
        String requiredEdu = job.getMinEducation();
        if (requiredEdu == null) return 100;
        if (resumeEdu == null) return 50;
        int resumeLevel = getEducationLevel(resumeEdu);
        int requiredLevel = getEducationLevel(requiredEdu);
        if (resumeLevel >= requiredLevel) return 100;
        return (double) resumeLevel / requiredLevel * 100;
    }

    private int getEducationLevel(String education) {
        return switch (education.toUpperCase()) {
            case "博士", "PHD" -> 4;
            case "硕士", "MASTER" -> 3;
            case "本科", "BACHELOR" -> 2;
            case "大专", "ASSOCIATE" -> 1;
            default -> 0;
        };
    }

    private double calculateSalaryScore(Resume resume, Job job) {
        Integer resumeSalary = resume.getExpectedSalary();
        var salaryRange = job.getSalaryRange();
        if (salaryRange == null || resumeSalary == null) return 50;
        if (salaryRange.isInRange(resumeSalary)) return 100;
        int diff = Math.abs(resumeSalary - (salaryRange.getMin() + salaryRange.getMax()) / 2);
        int range = salaryRange.getMax() - salaryRange.getMin();
        if (range == 0) return 50;
        return Math.max(0, 100 - (double) diff / range * 100);
    }
}
