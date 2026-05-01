package com.graphhire.resume.application.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.common.vo.PageResult;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.dto.ResumePreviewFile;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.interfaces.dto.ParseProgressResponse;
import com.graphhire.match.application.service.MatchAppService;

import java.io.IOException;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.resume.infrastructure.mq.ResumeMQProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Set;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ResumeAppService {
    private static final Logger log = LoggerFactory.getLogger(ResumeAppService.class);
    private static final Set<String> ALLOWED_RESUME_EXTENSIONS = Set.of("pdf", "doc", "docx");

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private RustFSClient rustFSClient;

    @Autowired(required = false)
    private ResumeMQProducer mqProducer;

    @Autowired
    private PersonInfoRepository personInfoRepository;

    @Autowired
    private GraphBuildService graphBuildService;

    @Autowired
    private MatchAppService matchAppService;

    @Transactional
    public Resume uploadResume(UploadResumeCmd cmd) throws IOException {
        List<Resume> existingResumes = resumeRepository.findByUserId(cmd.getUserId());
        if (existingResumes.size() >= 3) {
            throw Exceptions.BusinessException.of(400, "最多上传3份简历，请先删除旧简历");
        }

        String fileName = cmd.getFileName();
        String fileExt = StrUtil.blankToDefault(FileUtil.extName(fileName), "").toLowerCase(Locale.ROOT);
        if (!ALLOWED_RESUME_EXTENSIONS.contains(fileExt)) {
            throw Exceptions.BusinessException.of(400, "仅支持上传 PDF、DOC、DOCX 格式的简历");
        }

        // 步骤1：上传文件到RustFS
        String filePath = rustFSClient.upload(cmd.getFileBytes(), fileName);
        // 步骤2：创建简历聚合根
        Resume resume = new Resume();
        resume.setUserId(cmd.getUserId());
        // 从文件名提取文件类型（扩展名）
        String fileType = StrUtil.isBlank(fileExt) ? "unknown" : fileExt;
        resume.setFileType(fileType);
        resume.upload(filePath, fileName);
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
    public void setDefaultResume(Long resumeId, Long userId, boolean syncPersonInfo) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权设置此简历");
        }
        if (resume.getStatus() != ParseStatus.SUCCESS) {
            throw Exceptions.BusinessException.of(400, "请先解析成功后再设为默认");
        }
        Long previousDefaultResumeId = null;
        // 取消该用户的其他默认简历
        List<Resume> userResumes = getResumesByUserId(userId);
        for (Resume r : userResumes) {
            if (Boolean.TRUE.equals(r.getIsDefault())) {
                previousDefaultResumeId = r.getId();
                r.setIsDefault(false);
                resumeRepository.save(r);
            }
        }
        // 将此简历设为默认
        resume.setIsDefault(true);
        resumeRepository.save(resume);
        if (previousDefaultResumeId != null) {
            matchAppService.clearOldMatchDataForResume(previousDefaultResumeId);
        }
            matchAppService.clearOldMatchDataForResume(resume.getId());
        graphBuildService.buildGraphForResume(resume);
        if (syncPersonInfo) {
            syncPersonInfoFromResume(userId, resume.getParseResult());
        }
        if (mqProducer != null) {
            mqProducer.sendResumeDefaultChangedMessage(resumeId);
        }
    }

    private void syncPersonInfoFromResume(Long userId, String parseResult) {
        JSONObject root = JSONUtil.parseObj(StrUtil.blankToDefault(parseResult, "{}"));
        PersonInfo personInfo = personInfoRepository.findByUserId(userId).orElseGet(() -> {
            PersonInfo newInfo = new PersonInfo();
            newInfo.setUserId(userId);
            return newInfo;
        });
        personInfo.setRealName(getString(root, "name", "realName", "姓名"));
        personInfo.setGender(parseGender(root));
        personInfo.setPhone(getString(root, "phone", "mobile", "tel"));
        personInfo.setEmail(getString(root, "email", "mail"));
        personInfo.setAge(parseAge(root));
        personInfo.setEducation(parseEducation(root));
        personInfo.setSchool(parseSchool(root));
        personInfoRepository.save(personInfo);
    }

    private String parseEducation(JSONObject root) {
        Object educationObj = firstPresent(root, "education", "学历");
        if (educationObj == null) {
            return null;
        }
        if (educationObj instanceof CharSequence) {
            return StrUtil.emptyToNull(educationObj.toString().trim());
        }
        if (educationObj instanceof JSONArray educationArray && !educationArray.isEmpty()) {
            Object first = educationArray.get(0);
            if (first instanceof JSONObject eduItem) {
                return StrUtil.emptyToNull(getString(eduItem, "degree", "学历", "education"));
            }
            return StrUtil.emptyToNull(String.valueOf(first));
        }
        return null;
    }

    private String parseSchool(JSONObject root) {
        Object educationObj = firstPresent(root, "education", "学历");
        if (educationObj instanceof JSONArray educationArray && !educationArray.isEmpty()) {
            Object first = educationArray.get(0);
            if (first instanceof JSONObject eduItem) {
                return StrUtil.emptyToNull(getString(eduItem, "school", "学校", "university"));
            }
        }
        return StrUtil.emptyToNull(getString(root, "school", "学校", "university"));
    }

    private Integer parseGender(JSONObject root) {
        String raw = StrUtil.blankToDefault(getString(root, "gender", "sex", "性别"), "").trim();
        if (StrUtil.isBlank(raw)) {
            return null;
        }
        if ("1".equals(raw) || raw.contains("男")) {
            return 1;
        }
        if ("2".equals(raw) || raw.contains("女")) {
            return 2;
        }
        return null;
    }

    private Integer parseAge(JSONObject root) {
        Object ageObj = firstPresent(root, "age", "年龄");
        if (ageObj == null) {
            return null;
        }
        if (ageObj instanceof Number number) {
            return number.intValue();
        }
        String ageText = ageObj.toString();
        String ageDigits = ageText.replaceAll("[^0-9]", "");
        if (StrUtil.isBlank(ageDigits)) {
            return null;
        }
        return Integer.parseInt(ageDigits);
    }

    private Object firstPresent(JSONObject root, String... keys) {
        for (String key : keys) {
            if (root.containsKey(key)) {
                Object value = root.get(key);
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    }

    private String getString(JSONObject root, String... keys) {
        for (String key : keys) {
            String value = root.getStr(key);
            if (StrUtil.isNotBlank(value)) {
                return value.trim();
            }
        }
        return null;
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
        // 标记为解析中
        resume.markParsing();
        resumeRepository.save(resume);
        // 创建解析任务并发送MQ消息触发AI解析（如MQ已启用）
        if (mqProducer != null) {
            ParseTask task = new ParseTask();
            task.setResumeId(resumeId);
            task.setTaskType("resume_parse");
            task.setStatus(ParseTask.TaskStatus.PENDING);
            parseTaskRepository.save(task);
            mqProducer.sendResumeParseMessage(resumeId, task.getId());
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

    /**
     * 获取简历解析进度
     * 【功能说明】查询简历的真实解析进度，基于ParseTask状态计算百分比。
     * 【业务步骤】
     * 步骤1：校验简历是否存在且属于当前用户
     * 步骤2：查询关联的ParseTask
     * 步骤3：根据任务状态计算进度百分比和步骤描述
     */
    public ParseProgressResponse getParseProgress(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权查看此简历");
        }
        ParseProgressResponse response = new ParseProgressResponse();
        response.setResumeId(resumeId);
        response.setStartedAt(null);
        response.setCompletedAt(null);
        // 查询最新的解析任务
        Optional<ParseTask> taskOpt = parseTaskRepository.findByResumeId(resumeId);
        if (taskOpt.isEmpty()) {
            // 无任务时返回简历自己的状态
            response.setStatus(resume.getStatus() != null ? resume.getStatus().name() : "PENDING");
            response.setProgress(0);
            response.setStep("等待解析任务");
            return response;
        }
        ParseTask task = taskOpt.get();
        response.setStartedAt(task.getStartedAt());
        response.setCompletedAt(task.getCompletedAt());
        ParseTask.TaskStatus status = task.getStatus();
        if (status == null) {
            status = ParseTask.TaskStatus.PENDING;
        }
        response.setStatus(status.name());
        switch (status) {
            case PENDING:
                response.setProgress(0);
                response.setStep("等待解析");
                break;
            case RUNNING:
                response.setProgress(50);
                response.setStep("AI 解析中...");
                break;
            case SUCCESS:
                response.setProgress(100);
                response.setStep("解析完成");
                break;
            case FAILED:
                response.setProgress(0);
                response.setStep("解析失败");
                response.setErrorMessage(task.getErrorMessage());
                break;
            default:
                response.setProgress(0);
                response.setStep("未知状态");
        }
        return response;
    }

    /**
     * 预览简历文件
     * 【功能说明】校验当前用户权限后，从 RustFS 下载简历原文件并返回预览数据。
     */
    public ResumePreviewFile previewResume(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId);
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权预览此简历");
        }

        try {
            byte[] content = rustFSClient.download(resume.getFilePath());
            String contentType = resolveContentType(resume);
            return new ResumePreviewFile(content, resume.getFileName(), contentType);
        } catch (RuntimeException ex) {
            if (!isMissingObjectError(ex)) {
                throw ex;
            }

            Optional<Resume> fallbackResumeOpt = getResumesByUserId(userId).stream()
                .filter(candidate -> !candidate.getId().equals(resume.getId()))
                .filter(candidate -> StrUtil.equals(candidate.getFileName(), resume.getFileName()))
                .sorted(Comparator.comparing(Resume::getId).reversed())
                .filter(candidate -> StrUtil.isNotBlank(candidate.getFilePath()) && rustFSClient.exists(candidate.getFilePath()))
                .findFirst();

            if (fallbackResumeOpt.isEmpty()) {
                throw ex;
            }

            Resume fallbackResume = fallbackResumeOpt.get();
            log.warn("简历预览降级：resumeId={} filePath={} -> 降级简历Id={} 降级路径={}",
                resume.getId(), resume.getFilePath(), fallbackResume.getId(), fallbackResume.getFilePath());
            byte[] fallbackContent = rustFSClient.download(fallbackResume.getFilePath());
            return new ResumePreviewFile(fallbackContent, resume.getFileName(), resolveContentType(fallbackResume));
        }
    }

    private boolean isMissingObjectError(RuntimeException ex) {
        String message = ex.getMessage();
        if (StrUtil.isBlank(message)) {
            return false;
        }
        String lowerMessage = message.toLowerCase();
        return lowerMessage.contains("no such key")
            || lowerMessage.contains("specified key does not exist")
            || lowerMessage.contains("status code: 404");
    }

    private String resolveContentType(Resume resume) {
        if (StrUtil.isNotBlank(resume.getFileType()) && resume.getFileType().contains("/")) {
            return resume.getFileType();
        }

        String extension = FileUtil.extName(resume.getFileName()).toLowerCase();
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "txt" -> "text/plain";
            default -> "application/octet-stream";
        };
    }
}
