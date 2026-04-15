package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.infrastructure.persistence.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepository {
    private final NotificationMapper notificationMapper;

    @Override
    public Notification findById(Long id) {
        return notificationMapper.selectById(id);
    }

    @Override
    public Optional<Notification> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public List<Notification> findByUserId(Long userId) {
        return notificationMapper.selectList(new LambdaQueryWrapper<Notification>()
            .eq(Notification::getUserId, userId)
            .orderByDesc(Notification::getCreatedAt));
    }

    @Override
    public List<Notification> findByUserId(Long userId, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return notificationMapper.selectList(new LambdaQueryWrapper<Notification>()
            .eq(Notification::getUserId, userId)
            .orderByDesc(Notification::getCreatedAt)
            .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public List<Notification> findUnreadByUserId(Long userId) {
        return notificationMapper.selectList(new LambdaQueryWrapper<Notification>()
            .eq(Notification::getUserId, userId)
            .eq(Notification::getIsRead, false)
            .orderByDesc(Notification::getCreatedAt));
    }

    @Override
    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            notificationMapper.insert(notification);
        } else {
            notificationMapper.updateById(notification);
        }
        return notification;
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setIsRead(true);
        notificationMapper.updateById(notification);
    }

    @Override
    public int countUnread(Long userId) {
        return notificationMapper.selectCount(new LambdaQueryWrapper<Notification>()
            .eq(Notification::getUserId, userId)
            .eq(Notification::getIsRead, false)).intValue();
    }
}
