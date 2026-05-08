package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.graphhire.resume.domain.model.UploadTask;
import com.graphhire.resume.domain.repository.UploadTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.UploadTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.UploadTaskPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 上传任务仓储实现。
 * 说明：负责 UploadTask 领域模型与 UploadTaskPO 之间的状态映射。
 */
@Repository
public class UploadTaskRepositoryImpl implements UploadTaskRepository {

    @Autowired
    private UploadTaskMapper uploadTaskMapper;

    @Override
    public UploadTask save(UploadTask uploadTask) {
        UploadTaskPO po = toPO(uploadTask);
        if (uploadTask.getId() == null) {
            uploadTaskMapper.insert(po);
            uploadTask.setId(po.getId());
        } else {
            uploadTaskMapper.updateById(po);
        }
        return uploadTask;
    }

    @Override
    public Optional<UploadTask> findById(Long id) {
        UploadTaskPO po = uploadTaskMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /**
     * 领域对象转PO。
     * 说明：TaskStatus 以 ordinal 持久化，需与枚举顺序保持一致。
     */
    private UploadTaskPO toPO(UploadTask domain) {
        UploadTaskPO po = new UploadTaskPO();
        BeanUtil.copyProperties(domain, po, "status", "refreshAllMatches", "createdAt", "updatedAt", "finishedAt");
        po.setStatus(domain.getStatus() == null ? UploadTask.TaskStatus.PENDING.ordinal() : domain.getStatus().ordinal());
        po.setRefreshAllMatches(Boolean.TRUE.equals(domain.getRefreshAllMatches()) ? 1 : 0);
        po.setCreateTime(domain.getCreatedAt());
        po.setUpdateTime(domain.getUpdatedAt());
        po.setFinishTime(domain.getFinishedAt());
        return po;
    }

    /**
     * PO转领域对象。
     * 说明：状态越界时降级为 PENDING，防止脏数据导致反序列化异常。
     */
    private UploadTask toDomain(UploadTaskPO po) {
        UploadTask domain = new UploadTask();
        BeanUtil.copyProperties(po, domain, "status", "refreshAllMatches", "createTime", "updateTime", "finishTime");
        if (po.getStatus() != null && po.getStatus() >= 0 && po.getStatus() < UploadTask.TaskStatus.values().length) {
            domain.setStatus(UploadTask.TaskStatus.values()[po.getStatus()]);
        } else {
            domain.setStatus(UploadTask.TaskStatus.PENDING);
        }
        domain.setRefreshAllMatches(po.getRefreshAllMatches() != null && po.getRefreshAllMatches() == 1);
        domain.setCreatedAt(po.getCreateTime());
        domain.setUpdatedAt(po.getUpdateTime());
        domain.setFinishedAt(po.getFinishTime());
        return domain;
    }
}
