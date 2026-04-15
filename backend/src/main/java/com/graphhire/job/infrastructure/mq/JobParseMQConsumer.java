package com.graphhire.job.infrastructure.mq;

import com.alibaba.fastjson.JSON;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.model.JobSkill;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.repository.JobSkillRepository;
import com.graphhire.job.domain.vo.ParseStatus;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class JobParseMQConsumer {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobSkillRepository jobSkillRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private DocumentParser documentParser;

    @Autowired
    private DeepSeekClient deepSeekClient;

    @Autowired
    private SkillTagRepository skillTagRepository;

    public void consumeJobParse(Long jobId, Long parseTaskId) {
        ParseTask task = parseTaskRepository.findById(parseTaskId)
                .orElseThrow(() -> new RuntimeException("Parse task not found: " + parseTaskId));
        task.setStatus(ParseTask.TaskStatus.RUNNING);
        task.setStartedAt(LocalDateTime.now());
        parseTaskRepository.save(task);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        job.setParseStatus(ParseStatus.PARSING);
        jobRepository.save(job);

        try {
            String text = "";
            if (job.getFilePath() != null && !job.getFilePath().isBlank()) {
                text = documentParser.extractText(job.getFilePath());
            }

            Map<String, Object> parseResult = deepSeekClient.parseJob(text, job.getTitle());

            job.setParseResult(JSON.toJSONString(parseResult));
            job.setParseStatus(ParseStatus.SUCCESS);
            jobRepository.save(job);

            List<String> skills = extractSkills(parseResult);
            if (skills != null && !skills.isEmpty()) {
                for (String skillName : skills) {
                    SkillTag skill = skillTagRepository.findByName(skillName)
                            .orElseGet(() -> {
                                SkillTag newSkill = new SkillTag();
                                newSkill.setName(skillName);
                                newSkill.updateCategory(com.graphhire.skill.domain.vo.SkillCategory.PROGRAMMING_LANGUAGE);
                                return skillTagRepository.save(newSkill);
                            });

                    JobSkill js = new JobSkill();
                    js.setJobId(jobId);
                    js.setSkillTagId(skill.getId());
                    js.setIsRequired(true);
                    js.setWeight(BigDecimal.valueOf(0.8));
                    jobSkillRepository.save(js);
                }
            }

            task.setStatus(ParseTask.TaskStatus.SUCCESS);
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);

        } catch (Exception e) {
            job.setParseStatus(ParseStatus.FAILED);
            job.setParseError(e.getMessage());
            jobRepository.save(job);

            task.setStatus(ParseTask.TaskStatus.FAILED);
            task.setErrorMessage(e.getMessage());
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> extractSkills(Map<String, Object> parseResult) {
        if (parseResult == null) {
            return List.of();
        }
        Object skillsObj = parseResult.get("skills");
        if (skillsObj instanceof List) {
            return (List<String>) skillsObj;
        }
        return List.of();
    }
}
