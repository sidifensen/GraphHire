package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.ParseTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.ParseTaskPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 解析任务仓储实现
 *
 * 【模块说明】提供简历解析任务的持久化操作，包括任务创建、状态管理和结果存储。
 *
 * 【数据来源】parse_task 表
 *
 * 【方法概览】
 * - findById：根据ID查询解析任务
 * - findByResumeId：根据简历ID查询解析任务
 * - findAll：查询所有解析任务
 * - save：保存解析任务
 * - delete：删除解析任务
 */
@Repository
public class ParseTaskRepositoryImpl implements ParseTaskRepository {

    @Autowired
    private ParseTaskMapper parseTaskMapper;

    @Override
    /** 根据ID查询解析任务 */
    public Optional<ParseTask> findById(Long id) {
        ParseTaskPO po = parseTaskMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    /** 根据简历ID查询解析任务 */
    public Optional<ParseTask> findByResumeId(Long resumeId) {
        LambdaQueryWrapper<ParseTaskPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ParseTaskPO::getResumeId, resumeId);
        ParseTaskPO po = parseTaskMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    /** 查询所有解析任务 */
    public List<ParseTask> findAll() {
        return parseTaskMapper.selectList(null).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    /** 保存解析任务 */
    public ParseTask save(ParseTask parseTask) {
        ParseTaskPO po = toPO(parseTask);
        if (parseTask.getId() == null) {
            parseTaskMapper.insert(po);
            parseTask.setId(po.getId());
        } else {
            parseTaskMapper.updateById(po);
        }
        return parseTask;
    }

    @Override
    /** 删除解析任务 */
    public void delete(ParseTask parseTask) {
        parseTaskMapper.deleteById(parseTask.getId());
    }

    /** PO 转 Domain */
    private ParseTask toDomain(ParseTaskPO po) {
        ParseTask task = new ParseTask();
        // 使用BeanUtil复制基础字段，保留日期字段手动赋值以保持对象引用语义
        BeanUtil.copyProperties(po, task);
        if (po.getStatus() != null) {
            task.setStatus(ParseTask.TaskStatus.values()[po.getStatus()]);
        }
        // 手动复制日期字段，保持对象引用语义
        task.setCreatedAt(po.getCreateTime());
        task.setStartedAt(po.getStartedAt());
        task.setCompletedAt(po.getCompletedAt());
        return task;
    }

    /** Domain 转 PO */
    private ParseTaskPO toPO(ParseTask task) {
        ParseTaskPO po = new ParseTaskPO();
        // 使用BeanUtil复制基础字段，保留日期字段手动赋值以保持对象引用语义
        BeanUtil.copyProperties(task, po);
        if (task.getStatus() != null) {
            po.setStatus(task.getStatus().ordinal());
        }
        // 手动复制日期字段，保持对象引用语义
        po.setCreateTime(task.getCreatedAt());
        po.setStartedAt(task.getStartedAt());
        po.setCompletedAt(task.getCompletedAt());
        return po;
    }
}
