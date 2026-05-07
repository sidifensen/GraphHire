package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 简历仓储实现
 *
 * 【模块说明】提供简历数据的持久化操作，包括 CRUD 和状态管理。
 *
 * 【数据来源】resume 表
 *
 * 【方法概览】
 * - findById：根据ID查询简历
 * - findByUserId：根据用户ID查询简历列表
 * - findByParseStatus：根据解析状态查询简历
 * - findPage：分页查询简历
 * - save：保存简历
 * - delete：删除简历
 */
@Repository
public class ResumeRepositoryImpl implements ResumeRepository {

    @Autowired
    private ResumeMapper resumeMapper;

    /**
     * 根据ID查询简历
     */
    @Override
    public Optional<Resume> findById(Long id) {
        ResumePO po = resumeMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /**
     * 根据用户ID查询简历列表
     */
    @Override
    public List<Resume> findByUserId(Long userId) {
        LambdaQueryWrapper<ResumePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ResumePO::getUserId, userId);
        List<ResumePO> pos = resumeMapper.selectList(wrapper);
        return pos.stream().map(this::toDomain).toList();
    }

    /**
     * 根据解析状态查询简历
     */
    @Override
    public List<Resume> findByParseStatus(ParseStatus parseStatus) {
        LambdaQueryWrapper<ResumePO> wrapper = new LambdaQueryWrapper<>();
        if (parseStatus != null) {
            wrapper.eq(ResumePO::getParseStatus, parseStatus.ordinal());
        }
        List<ResumePO> pos = resumeMapper.selectList(wrapper);
        return pos.stream().map(this::toDomain).toList();
    }

    /**
     * 分页查询简历
     */
    @Override
    public IPage<Resume> findPage(int page, int size) {
        Page<ResumePO> pageObj = new Page<>(page, size);
        IPage<ResumePO> pageResult = resumeMapper.selectPage(pageObj, null);
        return pageResult.convert(this::toDomain);
    }

    @Override
    public IPage<Resume> findPageByUserId(Long userId, int page, int size) {
        Page<ResumePO> pageObj = new Page<>(page, size);
        LambdaQueryWrapper<ResumePO> wrapper = new LambdaQueryWrapper<>();
        if (userId == null || userId <= 0) {
            wrapper.eq(ResumePO::getDeleted, 0);
        } else {
            wrapper.eq(ResumePO::getUserId, userId)
                .eq(ResumePO::getDeleted, 0);
        }
        wrapper.orderByDesc(ResumePO::getCreateTime)
            .orderByDesc(ResumePO::getId);
        IPage<ResumePO> pageResult = resumeMapper.selectPage(pageObj, wrapper);
        return pageResult.convert(this::toDomain);
    }

    /**
     * 保存简历
     */
    @Override
    public Resume save(Resume resume) {
        ResumePO po = toPO(resume);
        if (resume.getId() == null) {
            resumeMapper.insert(po);
            resume.setId(po.getId());
        } else {
            // parse_result是jsonb类型，updateById无法正确处理，先置空
            po.setParseResult(null);
            resumeMapper.updateById(po);
            // 再单独用CAST更新parse_result
            if (resume.getParseResult() != null) {
                resumeMapper.updateParseResult(resume.getId(), resume.getParseResult(), resume.getStatus().ordinal());
            }
        }
        return resume;
    }

    /**
     * 删除简历
     */
    @Override
    public void delete(Resume resume) {
        resumeMapper.deleteById(resume.getId());
    }

    /**
     * PO 转 Domain
     */
    private Resume toDomain(ResumePO po) {
        Resume resume = new Resume();
        // parseResult 需要在 BeanUtil 之前单独处理，避免 Map 被复制给 String 字段
        String parseResultJson = null;
        if (po.getParseResult() != null) {
            parseResultJson = JSONUtil.toJsonStr(po.getParseResult());
        }
        Integer isDefaultVal = po.getIsDefault();
        // 排除 parseResult 避免 BeanUtil 复制 Map->String 失败
        BeanUtil.copyProperties(po, resume, "parseResult", "isDefault");
        if (po.getParseStatus() != null) {
            resume.setStatus(ParseStatus.values()[po.getParseStatus()]);
        }
        resume.setParseResult(parseResultJson);
        resume.setIsDefault(isDefaultVal != null && isDefaultVal == 1);
        return resume;
    }

    /**
     * Domain 转 PO
     */
    @SuppressWarnings("unchecked")
    private ResumePO toPO(Resume resume) {
        ResumePO po = new ResumePO();
        cn.hutool.log.StaticLog.info(
                "DEBUG toPO: resume.parseResult=\n{}",
                prettyJsonForLog(resume.getParseResult())
        );
        // 排除 parseResult 和 isDefault，避免类型转换问题
        BeanUtil.copyProperties(resume, po, "parseResult", "isDefault");
        if (resume.getStatus() != null) {
            po.setParseStatus(resume.getStatus().ordinal());
        }
        // parseResult: JSON string -> Map (用HashMap避免JSONObject类型问题)
        if (resume.getParseResult() != null) {
            po.setParseResult(new java.util.HashMap<>(com.alibaba.fastjson.JSON.parseObject(resume.getParseResult())));
        }
        // isDefault: Boolean -> Integer(0/1)
        po.setIsDefault(resume.getIsDefault() != null && resume.getIsDefault() ? 1 : 0);
        return po;
    }

    private String prettyJsonForLog(String jsonText) {
        if (jsonText == null || jsonText.isBlank()) {
            return jsonText;
        }
        try {
            return JSONUtil.toJsonPrettyStr(JSONUtil.parse(jsonText));
        } catch (Exception ignored) {
            // 非法 JSON 时回退原文，避免日志打印中断
            return jsonText;
        }
    }
}
