package com.graphhire.resume.application.service;

import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import cn.hutool.log.StaticLog;
import cn.hutool.core.exceptions.ExceptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 简历解析应用服务
 *
 * 【模块说明】协调简历解析流程，管理解析任务的生命周期。
 * 【数据来源】ResumeRepository、ParseTaskRepository
 * 【依赖服务】DocumentParser（文档解析）
 *
 * 【方法概览】
 * - processResume()：处理简历解析完整流程
 */
@Service
public class ParseAppService {
    /** 简历仓储 */
    @Autowired
    private ResumeRepository resumeRepository;

    /** 解析任务仓储 */
    @Autowired
    private ParseTaskRepository parseTaskRepository;

    /** 文档解析器 */
    @Autowired
    private DocumentParser documentParser;

    /**
     * 处理简历解析
     * 【功能说明】执行简历文档的完整解析流程，包括文本提取、AI解析、结果存储。
     * 【业务步骤】
     * 步骤1：查询简历，不存在则抛异常
     * 步骤2：创建解析任务，状态设为待执行
     * 步骤3：标记简历为解析中状态
     * 步骤4：提取文档文本内容
     * 步骤5：调用AI解析文本
     * 步骤6：任务和简历均标记为成功
     * 步骤7：若发生异常，任务和简历均标记为失败
     */
    @Transactional
    public void processResume(Long resumeId) {
        // 步骤1：查询简历
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // 步骤2：创建解析任务
        ParseTask task = new ParseTask();
        task.setResumeId(resumeId);
        task.schedule();
        parseTaskRepository.save(task);

        // 步骤3：标记简历为解析中
        resume.markParsing();
        resumeRepository.save(resume);

        try {
            // 步骤4：提取文档文本
            String rawText = documentParser.extractText(resume.getFilePath());

            // 步骤5：AI解析
            String parseResult = documentParser.parse(rawText);

            // 步骤6：标记成功
            task.markSuccess();
            parseTaskRepository.save(task);

            resume.parsed(parseResult);
            resumeRepository.save(resume);
        } catch (RuntimeException e) {
            StaticLog.error("简历解析失败: resumeId={}, error={}", resumeId, ExceptionUtil.getMessage(e));
            task.markFailed(ExceptionUtil.getMessage(e));
            parseTaskRepository.save(task);

            resume.parseFailed(ExceptionUtil.getMessage(e));
            resumeRepository.save(resume);
        }
    }
}
