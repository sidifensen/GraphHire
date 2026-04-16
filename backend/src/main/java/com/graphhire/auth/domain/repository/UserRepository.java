package com.graphhire.auth.domain.repository;

import com.graphhire.auth.domain.model.User;

import java.util.Optional;

/**
 * 用户仓储接口
 * 定义用户数据的持久化操作规范
 */
public interface UserRepository {
    /** 根据ID查询用户 */
    Optional<User> findById(Long id);
    /** 根据用户名（邮箱）查询用户 */
    Optional<User> findByUsername(String username);
    /** 保存用户（新增或更新） */
    User save(User user);
    /** 删除用户 */
    void delete(User user);
}