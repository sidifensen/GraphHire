package com.graphhire.notification.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.notification.infrastructure.persistence.mapper.NotificationMapper;
import com.graphhire.notification.infrastructure.persistence.po.NotificationPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class NotificationRepositoryImpl implements NotificationRepository {

    @Autowired
    private NotificationMapper notificationMapper;

    @Override
    public Optional<Notification> findById(Long id) {
        NotificationPO po = notificationMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Notification> findByUserId(Long userId) {
        List<NotificationPO> pos = notificationMapper.selectList(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .orderByDesc(NotificationPO::getCreatedAt));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead) {
        List<NotificationPO> pos = notificationMapper.selectList(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .eq(NotificationPO::getIsRead, isRead)
                .orderByDesc(NotificationPO::getCreatedAt));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public List<Notification> findByUserIdAndType(Long userId, NotificationType type) {
        List<NotificationPO> pos = notificationMapper.selectList(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .eq(NotificationPO::getType, type.getValue())
                .orderByDesc(NotificationPO::getCreatedAt));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public List<Notification> findUnreadByUserId(Long userId) {
        return findByUserIdAndIsRead(userId, false);
    }

    @Override
    public Notification save(Notification notification) {
        NotificationPO po = toPO(notification);
        if (notification.getId() == null) {
            notificationMapper.insert(po);
            notification.setId(po.getId());
        } else {
            notificationMapper.updateById(po);
        }
        return notification;
    }

    @Override
    public void delete(Notification notification) {
        if (notification.getId() != null) {
            notificationMapper.deleteById(notification.getId());
        }
    }

    @Override
    public long countUnreadByUserId(Long userId) {
        return notificationMapper.selectCount(
            new LambdaQueryWrapper<NotificationPO>()
                .eq(NotificationPO::getUserId, userId)
                .eq(NotificationPO::getIsRead, false));
    }

    @Override
    public void markAllAsReadByUserId(Long userId) {
        NotificationPO po = new NotificationPO();
        po.setIsRead(true);
        notificationMapper.update(po,
            new LambdaQueryWrapper<NotificationPO>().eq(NotificationPO::getUserId, userId));
    }

    private Notification toDomain(NotificationPO po) {
        if (po == null) return null;
        Notification n = new Notification();
        n.setId(po.getId());
        n.setUserId(po.getUserId());
        n.setType(NotificationType.fromValue(po.getType()));
        n.setTitle(po.getTitle());
        n.setContent(po.getContent());
        n.setReferenceId(po.getReferenceId());
        n.setIsRead(po.getIsRead());
        n.setCreatedAt(po.getCreatedAt());
        return n;
    }

    private NotificationPO toPO(Notification n) {
        NotificationPO po = new NotificationPO();
        po.setId(n.getId());
        po.setUserId(n.getUserId());
        po.setType(n.getType() != null ? n.getType().getValue() : null);
        po.setTitle(n.getTitle());
        po.setContent(n.getContent());
        po.setReferenceId(n.getReferenceId());
        po.setIsRead(n.getIsRead());
        po.setCreatedAt(n.getCreatedAt());
        return po;
    }
}