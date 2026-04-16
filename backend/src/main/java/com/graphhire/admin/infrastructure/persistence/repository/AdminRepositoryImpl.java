package com.graphhire.admin.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.infrastructure.persistence.mapper.AdminMapper;
import com.graphhire.admin.infrastructure.persistence.po.AdminPO;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.vo.Username;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.match.infrastructure.persistence.mapper.MatchRecordMapper;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 管理员仓储实现
 *
 * 【模块说明】提供管理员相关数据的查询操作，包括用户统计、企业认证统计等。
 *
 * 【数据来源】user 表、company 表、resume 表、job 表、match_record 表
 *
 * 【方法概览】
 * - countPersons：统计个人用户数量
 * - countCompanies：统计企业用户数量
 * - countResumes：统计简历数量
 * - countPublishedJobs：统计已发布职位数量
 * - countMatchRecords：统计匹配记录数量
 * - findUserIdById：根据ID查询用户
 * - findUsersPage：分页查询用户
 */
@Repository
public class AdminRepositoryImpl implements AdminRepository {

    /** MyBatis Mapper */
    @Autowired
    private AdminMapper adminMapper;

    /** MyBatis Mapper */
    @Autowired
    private ResumeMapper resumeMapper;

    /** MyBatis Mapper */
    @Autowired
    private JobMapper jobMapper;

    /** MyBatis Mapper */
    @Autowired
    private MatchRecordMapper matchRecordMapper;

    @Override
    /** 统计个人用户数量 */
    public long countPersons() {
        LambdaQueryWrapper<AdminPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminPO::getUserType, 1);
        return adminMapper.selectCount(wrapper);
    }

    @Override
    /** 统计企业用户数量 */
    public long countCompanies() {
        LambdaQueryWrapper<AdminPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminPO::getUserType, 2);
        return adminMapper.selectCount(wrapper);
    }

    @Override
    /** 统计简历数量 */
    public long countResumes() {
        return resumeMapper.selectCount(null);
    }

    @Override
    /** 统计已发布职位数量 */
    public long countPublishedJobs() {
        LambdaQueryWrapper<com.graphhire.job.infrastructure.persistence.po.JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.graphhire.job.infrastructure.persistence.po.JobPO::getStatus, "PUBLISHED");
        return jobMapper.selectCount(wrapper);
    }

    @Override
    /** 统计匹配记录数量 */
    public long countMatchRecords() {
        return matchRecordMapper.selectCount(null);
    }

    @Override
    /** 根据ID查询用户ID */
    public Optional<Long> findUserIdById(Long id) {
        return Optional.of(id);
    }

    @Override
    /** 分页查询用户 */
    public IPage<User> findUsersPage(int page, int size) {
        Page<AdminPO> pageParam = new Page<>(page, size);
        IPage<AdminPO> adminPage = adminMapper.selectPage(pageParam, null);

        // 将AdminPO分页转换为User分页
        Page<User> userPage = new Page<>(adminPage.getCurrent(), adminPage.getSize(), adminPage.getTotal());
        userPage.setRecords(adminPage.getRecords().stream().map(this::toUser).toList());
        return userPage;
    }

    /** PO 转 UserVO */
    private User toUser(AdminPO po) {
        if (po == null) return null;
        User user = new User();
        user.setId(po.getId());
        user.setUsername(Username.of(po.getUsername()));
        return user;
    }
}