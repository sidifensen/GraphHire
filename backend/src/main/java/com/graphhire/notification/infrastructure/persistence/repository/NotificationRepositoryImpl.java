package com.graphhire.notification.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import cn.hutool.core.bean.BeanUtil;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.notification.infrastructure.persistence.mapper.NotificationMapper;
import com.graphhire.notification.infrastructure.persistence.po.NotificationPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 通知仓储实现类
 *
 * 【模块说明】实现 NotificationRepository 接口，负责通知数据与数据库的交互。
 * 【数据来源】notification 表（MySQL），使用 MyBatis-Plus 进行 ORM 映射。
 * 【方法概览】
 * - findById：根据ID查询通知
 * - findByUserId：查询用户所有通知
 * - findByUserIdAndIsRead：按已读状态筛选
 * - findByUserIdAndType：按通知类型筛选
 * - findUnreadByUserId：查询未读通知
 * - save：新增或更新通知
 * - delete：删除通知
 * - countUnreadByUserId：统计未读数量
 * - markAllAsReadByUserId：批量标记已读
 */
@Repository
public class NotificationRepositoryImpl implements NotificationRepository {

    @Autowired
    private NotificationMapper notificationMapper;

    /** 根据ID查询通知 */
    @Override
    public Optional<Notification> findById(Long id) {
        NotificationPO po = notificationMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /** 查询用户所有通知（按创建时间倒序） */
    @Override
    public List<Notification> findByUserId(Long userId) {
        List<NotificationPO> pos = notificationMapper.selectList(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .orderByDesc(NotificationPO::getCreateTime));
        return pos.stream().map(this::toDomain).toList();
    }

    /** 根据用户ID和已读状态查询通知 */
    @Override
    public List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead) {
        List<NotificationPO> pos = notificationMapper.selectList(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .eq(NotificationPO::getIsRead, isRead)
                .orderByDesc(NotificationPO::getCreateTime));
        return pos.stream().map(this::toDomain).toList();
    }

    /** 根据用户ID和通知类型查询通知 */
    @Override
    public List<Notification> findByUserIdAndType(Long userId, NotificationType type) {
        List<NotificationPO> pos = notificationMapper.selectList(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .eq(NotificationPO::getType, type.getValue())
                .orderByDesc(NotificationPO::getCreateTime));
        return pos.stream().map(this::toDomain).toList();
    }

    /** 查询用户的未读通知（委托给 findByUserIdAndIsRead） */
    @Override
    public List<Notification> findUnreadByUserId(Long userId) {
        return findByUserIdAndIsRead(userId, false);
    }

    /**
     * 保存通知
     * 【功能说明】根据 ID 是否为空判断执行新增或更新操作。
     * 【业务步骤】
     * 步骤1：转换为 PO 对象
     * 步骤2：判断 ID 是否为空，为空则插入，否则更新
     * 步骤3：回填生成的 ID 到 Domain 对象
     */
    @Override
    public Notification save(Notification notification) {
        NotificationPO po = toPO(notification);
        if (notification.getId() == null) {
            // 步骤2：新增操作
            notificationMapper.insert(po);
            // 步骤3：回填ID
            notification.setId(po.getId());
        } else {
            // 步骤2：更新操作
            notificationMapper.updateById(po);
        }
        return notification;
    }

    /** 删除通知（根据ID） */
    @Override
    public void delete(Notification notification) {
        if (notification.getId() != null) {
            notificationMapper.deleteById(notification.getId());
        }
    }

    /** 统计用户未读通知数量 */
    @Override
    public long countUnreadByUserId(Long userId) {
        return notificationMapper.selectCount(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .eq(NotificationPO::getIsRead, false));
    }

    /** 将用户所有通知标记为已读（批量更新） */
    @Override
    public void markAllAsReadByUserId(Long userId) {
        NotificationPO po = new NotificationPO();
        po.setIsRead(true);
        notificationMapper.update(po,
            new LambdaQueryWrapper<NotificationPO>().eq(NotificationPO::getUserId, userId));
    }

    /**
     * PO 转 Domain 领域对象
     * @param po 通知持久化对象
     * @return 通知领域模型，po 为空时返回 null
     */
    private Notification toDomain(NotificationPO po) {
        if (po == null) return null;
        Notification n = new Notification();
        BeanUtil.copyProperties(po, n);
        // 手动映射 relatedId -> referenceId（字段名不同）
        n.setReferenceId(po.getRelatedId());
        // 枚举类型需要单独转换
        n.setType(NotificationType.fromValue(po.getType()));
        return n;
    }

    /**
     * Domain 转 PO 持久化对象
     * @param n 通知领域模型
     * @return 通知持久化对象
     */
    private NotificationPO toPO(Notification n) {
        NotificationPO po = new NotificationPO();
        BeanUtil.copyProperties(n, po);
        // 手动映射 referenceId -> relatedId（字段名不同）
        po.setRelatedId(n.getReferenceId());
        // 枚举类型需要单独转换
        po.setType(n.getType() != null ? n.getType().getValue() : null);
        return po;
    }
}