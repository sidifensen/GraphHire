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

/**
 * 职位解析MQ消费者
 *
 * 【模块说明】消费职位文档解析消息，调用AI服务提取职位技能信息，更新解析状态和任务结果。
 *
 * 【依赖服务】
 * - DocumentParser：文档解析器，用于提取职位文档文本
 * - DeepSeekClient：DeepSeek AI客户端，用于调用AI解析接口
 * - SkillTagRepository：技能标签仓储，用于创建/查询技能
 *
 * 【业务步骤】
 * 步骤1：更新解析任务状态为RUNNING，记录开始时间
 * 步骤2：更新职位解析状态为PARSING
 * 步骤3：从RustFS读取并解析职位文档文本
 * 步骤4：调用AI服务解析职位，提取技能信息
 * 步骤5：更新职位解析结果和状态为SUCCESS
 * 步骤6：创建或关联技能标签，建立职位-技能关联
 * 步骤7：更新解析任务状态为SUCCESS
 * 步骤8（异常）：捕获异常，更新职位和任务状态为FAILED
 */
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

    /**
     * 消费职位解析消息
     * 【功能说明】执行职位文档的AI解析全流程，包含文档提取、AI解析、技能提取、关联存储。
     */
    public void consumeJobParse(Long jobId, Long parseTaskId) {
        // 步骤1：更新解析任务状态为RUNNING
        ParseTask task = parseTaskRepository.findById(parseTaskId)
                .orElseThrow(() -> new RuntimeException("Parse task not found: " + parseTaskId));
        task.setStatus(ParseTask.TaskStatus.RUNNING);
        task.setStartedAt(LocalDateTime.now());
        parseTaskRepository.save(task);

        // 步骤2：更新职位解析状态为解析中
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        job.setParseStatus(ParseStatus.PARSING);
        jobRepository.save(job);

        try {
            // 步骤3：从RustFS读取职位文档文本
            String text = "";
            if (job.getFilePath() != null && !job.getFilePath().isBlank()) {
                text = documentParser.extractText(job.getFilePath());
            }

            // 步骤4：调用AI服务解析职位
            Map<String, Object> parseResult = deepSeekClient.parseJob(text, job.getTitle());

            // 步骤5：更新职位解析结果为SUCCESS
            job.setParseResult(JSON.toJSONString(parseResult));
            job.setParseStatus(ParseStatus.SUCCESS);
            jobRepository.save(job);

            // 步骤6：提取并保存技能关联
            List<String> skills = extractSkills(parseResult);
            if (skills != null && !skills.isEmpty()) {
                for (String skillName : skills) {
                    // 查找或创建技能标签
                    SkillTag skill = skillTagRepository.findByName(skillName)
                            .orElseGet(() -> {
                                // 不存在则创建新的技能标签
                                SkillTag newSkill = new SkillTag();
                                newSkill.setName(skillName);
                                newSkill.updateCategory(com.graphhire.skill.domain.vo.SkillCategory.技术技能);
                                return skillTagRepository.save(newSkill);
                            });

                    // 建立职位-技能关联
                    JobSkill js = new JobSkill();
                    js.setJobId(jobId);
                    js.setSkillTagId(skill.getId());
                    js.setIsRequired(true);
                    js.setWeight(BigDecimal.valueOf(0.8));
                    jobSkillRepository.save(js);
                }
            }

            // 步骤7：更新解析任务状态为SUCCESS
            task.setStatus(ParseTask.TaskStatus.SUCCESS);
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);

        } catch (Exception e) {
            // 步骤8（异常处理）：更新失败状态
            job.setParseStatus(ParseStatus.FAILED);
            job.setParseError(e.getMessage());
            jobRepository.save(job);

            task.setStatus(ParseTask.TaskStatus.FAILED);
            task.setErrorMessage(e.getMessage());
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);
        }
    }

    /**
     * 从AI解析结果中提取技能列表
     * 【功能说明】从解析结果JSON中提取skills字段，支持多层结构。
     */
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
