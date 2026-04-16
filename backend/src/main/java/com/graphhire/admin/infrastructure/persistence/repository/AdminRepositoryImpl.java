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

@Repository
public class AdminRepositoryImpl implements AdminRepository {

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private ResumeMapper resumeMapper;

    @Autowired
    private JobMapper jobMapper;

    @Autowired
    private MatchRecordMapper matchRecordMapper;

    @Override
    public long countPersons() {
        LambdaQueryWrapper<AdminPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminPO::getUserType, 1);
        return adminMapper.selectCount(wrapper);
    }

    @Override
    public long countCompanies() {
        LambdaQueryWrapper<AdminPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminPO::getUserType, 2);
        return adminMapper.selectCount(wrapper);
    }

    @Override
    public long countResumes() {
        return resumeMapper.selectCount(null);
    }

    @Override
    public long countPublishedJobs() {
        LambdaQueryWrapper<com.graphhire.job.infrastructure.persistence.po.JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.graphhire.job.infrastructure.persistence.po.JobPO::getStatus, "PUBLISHED");
        return jobMapper.selectCount(wrapper);
    }

    @Override
    public long countMatchRecords() {
        return matchRecordMapper.selectCount(null);
    }

    @Override
    public Optional<Long> findUserIdById(Long id) {
        return Optional.of(id);
    }

    @Override
    public IPage<User> findUsersPage(int page, int size) {
        Page<AdminPO> pageParam = new Page<>(page, size);
        IPage<AdminPO> adminPage = adminMapper.selectPage(pageParam, null);

        // Convert AdminPO page to User page
        Page<User> userPage = new Page<>(adminPage.getCurrent(), adminPage.getSize(), adminPage.getTotal());
        userPage.setRecords(adminPage.getRecords().stream().map(this::toUser).toList());
        return userPage;
    }

    private User toUser(AdminPO po) {
        if (po == null) return null;
        User user = new User();
        user.setId(po.getId());
        user.setUsername(Username.of(po.getUsername()));
        return user;
    }
}