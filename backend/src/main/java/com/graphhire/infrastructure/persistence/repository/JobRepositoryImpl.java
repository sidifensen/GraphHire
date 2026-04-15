package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.vo.JobStatus;
import com.graphhire.infrastructure.persistence.mapper.JobMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class JobRepositoryImpl implements JobRepository {
    private final JobMapper jobMapper;

    @Override
    public Job findById(Long id) {
        return jobMapper.selectById(id);
    }

    @Override
    public Optional<Job> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public List<Job> findByCompanyId(Long companyId) {
        return jobMapper.selectList(new LambdaQueryWrapper<Job>().eq(Job::getCompanyId, companyId));
    }

    @Override
    public List<Job> findByCompanyId(Long companyId, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return jobMapper.selectList(new LambdaQueryWrapper<Job>()
                .eq(Job::getCompanyId, companyId)
                .orderByDesc(Job::getCreatedAt)
                .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public List<Job> findByJobStatus(JobStatus status) {
        return jobMapper.selectList(new LambdaQueryWrapper<Job>().eq(Job::getJobStatus, status));
    }

    @Override
    public List<Job> findByJobStatus(JobStatus status, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return jobMapper.selectList(new LambdaQueryWrapper<Job>()
                .eq(Job::getJobStatus, status)
                .orderByDesc(Job::getCreatedAt)
                .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public Job save(Job job) {
        if (job.getId() == null) {
            jobMapper.insert(job);
        } else {
            jobMapper.updateById(job);
        }
        return job;
    }

    @Override
    public List<Job> findPublishedJobs() {
        return findByJobStatus(JobStatus.PUBLISHED);
    }

    @Override
    public List<Job> findByKeyword(String keyword, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return jobMapper.selectList(new LambdaQueryWrapper<Job>()
                .like(Job::getJobTitle, keyword)
                .orderByDesc(Job::getCreatedAt)
                .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public Long countByKeyword(String keyword) {
        return jobMapper.selectCount(new LambdaQueryWrapper<Job>().like(Job::getJobTitle, keyword));
    }

    @Override
    public Long countAll() {
        return jobMapper.selectCount(null);
    }

    @Override
    public Long countByCompanyId(Long companyId) {
        return jobMapper.selectCount(new LambdaQueryWrapper<Job>().eq(Job::getCompanyId, companyId));
    }

    @Override
    public Long countByJobStatus(JobStatus status) {
        return jobMapper.selectCount(new LambdaQueryWrapper<Job>().eq(Job::getJobStatus, status));
    }

    @Override
    public void delete(Long id) {
        jobMapper.deleteById(id);
    }
}
