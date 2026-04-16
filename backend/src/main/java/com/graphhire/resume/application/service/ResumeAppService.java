package com.graphhire.resume.application.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.graphhire.common.vo.PageResult;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;

import java.io.IOException;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.resume.infrastructure.mq.ResumeMQProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeAppService {
    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private RustFSClient rustFSClient;

    @Autowired(required = false)
    private ResumeMQProducer mqProducer;

    @Transactional
    public Resume uploadResume(UploadResumeCmd cmd) throws IOException {
        // 步骤1：上传文件到RustFS
        String filePath = rustFSClient.upload(cmd.getFileBytes(), cmd.getFileName());
        // 步骤2：创建简历聚合根
        Resume resume = new Resume();
        resume.setUserId(cmd.getUserId());
        resume.upload(filePath, cmd.getFileName());
        // 步骤3：保存简历
        Resume saved = resumeRepository.save(resume);

        // 步骤4：创建解析任务
        ParseTask task = new ParseTask();
        task.setResumeId(saved.getId());
        task.setTaskType("resume_parse");
        task.setStatus(ParseTask.TaskStatus.PENDING);
        parseTaskRepository.save(task);

        // 步骤5：发送MQ消息触发AI解析（如MQ已启用）
        if (mqProducer != null) {
            mqProducer.sendResumeParseMessage(saved.getId(), task.getId());
        }

        return saved;
    }

    /**
     * 根据ID获取简历
     * 【功能说明】根据简历ID查询简历实体，用于后续业务操作。
     * 【业务步骤】
     * 步骤1：根据ID查询简历
     * 步骤2：若简历不存在则抛出异常
     */
    public Resume getResumeById(Long resumeId) {
        return resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("简历不存在"));
    }

    /**
     * 获取简历详情
     * 【功能说明】根据简历ID获取简历详情并转换为VO对象返回。
     * 【业务步骤】
     * 步骤1：根据ID获取简历实体
     * 步骤2：将实体转换为VO并返回
     */
    public ResumeVO getDetail(Long id) {
        Resume resume = getResumeById(id);
        return toResumeVO(resume);
    }

    /**
     * 获取简历列表
     * 【功能说明】分页查询简历列表，将分页结果转换为VO列表返回。
     * 【业务步骤】
     * 步骤1：分页查询简历
     * 步骤2：遍历转换为VO对象
     * 步骤3：组装分页结果并返回
     */
    public PageResult<ResumeVO> getList(int page, int size) {
        IPage<Resume> pageResult = resumeRepository.findPage(page, size);
        List<ResumeVO> vos = pageResult.getRecords().stream()
            .map(this::toResumeVO)
            .toList();
        return new PageResult<>(vos, pageResult.getTotal(), (int) pageResult.getCurrent(), (int) pageResult.getSize());
    }

    /**
     * 转换为简历VO
     * 【功能说明】将简历实体转换为VO对象，仅复制展示所需的字段。
     * 【业务步骤】
     * 步骤1：创建VO对象
     * 步骤2：复制基础信息（ID、用户ID、文件名、文件类型、大小）
     * 步骤3：复制解析状态和结果
     */
    private ResumeVO toResumeVO(Resume resume) {
        ResumeVO vo = new ResumeVO();
        vo.setId(resume.getId());
        vo.setUserId(resume.getUserId());
        vo.setFileName(resume.getFileName());
        vo.setFileType(resume.getFileType());
        vo.setFileSize(resume.getFileSize());
        if (resume.getStatus() != null) {
            vo.setParseStatus(resume.getStatus().ordinal());
        }
        vo.setParseResult(resume.getParseResult());
        vo.setConfidence(resume.getConfidence());
        vo.setIsDefault(resume.getIsDefault());
        return vo;
    }

    /**
     * 根据用户ID获取简历
     * 【功能说明】查询指定用户的所有简历列表。
     * 【业务步骤】
     * 步骤1：根据用户ID查询简历列表
     */
    public List<Resume> getResumesByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    /**
     * 删除简历
     * 【功能说明】删除指定简历，包含权限校验和删除操作。
     * 【业务步骤】
     * 步骤1：校验简历是否存在
     * 步骤2：校验用户是否有权限删除
     * 步骤3：执行删除操作
     */
    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此简历");
        }
        resumeRepository.delete(resume);
    }

    /**
     * 设置默认简历
     * 【功能说明】将指定简历设为用户的默认简历，同时取消该用户的其他默认简历。
     * 【业务步骤】
     * 步骤1：校验简历是否存在
     * 步骤2：校验用户是否有权限操作
     * 步骤3：取消该用户的所有默认简历
     * 步骤4：将目标简历设为默认并保存
     */
    @Transactional
    public void setDefaultResume(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权设置此简历");
        }
        // 取消该用户的其他默认简历
        List<Resume> userResumes = getResumesByUserId(userId);
        for (Resume r : userResumes) {
            if (Boolean.TRUE.equals(r.getIsDefault())) {
                r.setIsDefault(false);
                resumeRepository.save(r);
            }
        }
        // 将此简历设为默认
        resume.setIsDefault(true);
        resumeRepository.save(resume);
    }

    /**
     * 触发简历解析
     * 【功能说明】手动触发简历AI解析，标记解析状态并发送MQ消息。
     * 【业务步骤】
     * 步骤1：校验简历是否存在
     * 步骤2：校验用户是否有权限操作
     * 步骤3：标记简历为解析中状态
     * 步骤4：发送MQ消息触发AI解析（如MQ已启用）
     */
    @Transactional
    public void triggerResumeParse(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权解析此简历");
        }
        // 标记为解析中并发送MQ事件触发AI解析（如MQ已启用）
        resume.markParsing();
        resumeRepository.save(resume);
        if (mqProducer != null) {
            mqProducer.sendResumeUploadedEvent(resume);
        }
    }

    /**
     * 获取简历详情
     * 【功能说明】根据简历ID获取简历详情，包含权限校验。
     * 【业务步骤】
     * 步骤1：根据ID获取简历实体
     * 步骤2：校验用户是否有权限查看
     * 步骤3：返回简历实体
     */
    public Resume getResumeDetail(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权查看此简历");
        }
        return resume;
    }
}
