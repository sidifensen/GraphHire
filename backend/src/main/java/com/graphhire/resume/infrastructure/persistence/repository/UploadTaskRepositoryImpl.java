package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.graphhire.resume.domain.model.UploadTask;
import com.graphhire.resume.domain.repository.UploadTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.UploadTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.UploadTaskPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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
