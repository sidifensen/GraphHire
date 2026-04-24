package com.graphhire.job.infrastructure.persistence.repository;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import cn.hutool.core.util.StrUtil;

@Repository
public class JobRepositoryImpl implements JobRepository {

    @Autowired
    private JobMapper jobMapper;

    @Override
    public Optional<Job> findById(Long id) {
        JobPO po = jobMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Job> findByCompanyId(Long companyId) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getCompanyId, companyId);
        return jobMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Job> findByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.toCode());
        return jobMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Job> searchPublishedJobs(String keyword, String city, Integer salaryMin, Integer salaryMax,
                                         String sortBy, int offset, int limit) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, JobStatus.PUBLISHED.toCode())
            .eq(JobPO::getDeleted, 0)
            .like(StrUtil.isNotBlank(keyword), JobPO::getTitle, StrUtil.trim(keyword))
            .eq(StrUtil.isNotBlank(city), JobPO::getLocationCity, StrUtil.trim(city))
            .ge(salaryMin != null, JobPO::getSalaryMax, salaryMin)
            .le(salaryMax != null, JobPO::getSalaryMin, salaryMax);

        if ("salary".equalsIgnoreCase(sortBy)) {
            wrapper.orderByDesc(JobPO::getSalaryMax).orderByDesc(JobPO::getId);
        } else {
            wrapper.orderByDesc(JobPO::getCreateTime).orderByDesc(JobPO::getId);
        }
        wrapper.last("LIMIT " + Math.max(limit, 1) + " OFFSET " + Math.max(offset, 0));
        return jobMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public long countPublishedJobs(String keyword, String city, Integer salaryMin, Integer salaryMax) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, JobStatus.PUBLISHED.toCode())
            .eq(JobPO::getDeleted, 0)
            .like(StrUtil.isNotBlank(keyword), JobPO::getTitle, StrUtil.trim(keyword))
            .eq(StrUtil.isNotBlank(city), JobPO::getLocationCity, StrUtil.trim(city))
            .ge(salaryMin != null, JobPO::getSalaryMax, salaryMin)
            .le(salaryMax != null, JobPO::getSalaryMin, salaryMax);
        return jobMapper.selectCount(wrapper);
    }

    @Override
    public List<Job> findAll() {
        return jobMapper.selectList(null).stream().map(this::toDomain).toList();
    }

    @Override
    public Job save(Job job) {
        JobPO po = toPO(job);
        if (job.getId() == null) {
            jobMapper.insert(po);
            job.setId(po.getId());
        } else {
            jobMapper.updateById(po);
        }
        return job;
    }

    @Override
    public void delete(Job job) {
        if (job.getId() != null) {
            jobMapper.deleteById(job.getId());
        }
    }

    @Override
    public long countByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.toCode());
        return jobMapper.selectCount(wrapper);
    }

    private Job toDomain(JobPO po) {
        if (po == null) {
            return null;
        }
        Job job = new Job();
        BeanUtil.copyProperties(po, job);
        job.setStatus(JobStatus.fromCode(po.getStatus()));
        if (po.getLocationCity() != null || po.getLocationDistrict() != null || po.getLocationDetail() != null) {
            job.setLocation(Location.of(po.getLocationCity(), po.getLocationDistrict(), po.getLocationDetail()));
        }
        if (po.getSalaryMin() != null || po.getSalaryMax() != null || po.getSalaryUnit() != null) {
            job.setSalaryRange(SalaryRange.of(po.getSalaryMin(), po.getSalaryMax(), po.getSalaryUnit()));
        } else {
            job.setSalaryRange(SalaryRange.empty());
        }
        if (job.getRequiredSkills() == null) {
            job.setRequiredSkills(new ArrayList<>());
        }
        if (job.getPreferredSkills() == null) {
            job.setPreferredSkills(new ArrayList<>());
        }
        fillJobFieldsFromParseResult(job, po.getParseResult());
        return job;
    }

    private JobPO toPO(Job job) {
        JobPO po = new JobPO();
        BeanUtil.copyProperties(job, po);
        po.setStatus(job.getStatus().toCode());
        if (job.getLocation() != null) {
            po.setLocationCity(job.getLocation().getCity());
            po.setLocationDistrict(job.getLocation().getDistrict());
            po.setLocationDetail(job.getLocation().getDetailAddress());
        }
        if (job.getSalaryRange() != null) {
            po.setSalaryMin(job.getSalaryRange().getMin());
            po.setSalaryMax(job.getSalaryRange().getMax());
            po.setSalaryUnit(job.getSalaryRange().getUnit());
        }
        enrichParseResultForPersistence(job, po);
        return po;
    }

    private void fillJobFieldsFromParseResult(Job job, String parseResult) {
        if (StrUtil.isBlank(parseResult) || !JSONUtil.isTypeJSONObject(parseResult)) {
            return;
        }
        JSONObject json = JSONUtil.parseObj(parseResult);

        if (CollUtil.isEmpty(job.getRequiredSkills())) {
            JSONArray requiredSkillsArray = firstJSONArray(json, "skills", "Skills", "requiredSkills");
            if (requiredSkillsArray != null) {
                List<String> requiredSkills = requiredSkillsArray.stream()
                        .map(item -> item == null ? null : item.toString())
                        .filter(StrUtil::isNotBlank)
                        .map(StrUtil::trim)
                        .distinct()
                        .collect(Collectors.toCollection(ArrayList::new));
                job.setRequiredSkills(requiredSkills);
            }
        }

        if (CollUtil.isEmpty(job.getPreferredSkills())) {
            JSONArray preferredSkillsArray = firstJSONArray(json, "preferredSkills", "preferred_skills");
            if (preferredSkillsArray != null) {
                List<String> preferredSkills = preferredSkillsArray.stream()
                        .map(item -> item == null ? null : item.toString())
                        .filter(StrUtil::isNotBlank)
                        .map(StrUtil::trim)
                        .distinct()
                        .collect(Collectors.toCollection(ArrayList::new));
                job.setPreferredSkills(preferredSkills);
            }
        }

        if (StrUtil.isBlank(job.getDescription())) {
            JSONArray requirementsArray = firstJSONArray(json, "requirements", "responsibilities", "Responsibilities");
            if (requirementsArray != null && !requirementsArray.isEmpty()) {
                String description = requirementsArray.stream()
                        .map(item -> item == null ? null : item.toString())
                        .filter(StrUtil::isNotBlank)
                        .map(StrUtil::trim)
                        .collect(Collectors.joining("；"));
                if (StrUtil.isNotBlank(description)) {
                    job.setDescription(description);
                }
            }
        }
    }

    private void enrichParseResultForPersistence(Job job, JobPO po) {
        JSONObject json = parseResultAsObject(po.getParseResult());

        List<String> requiredSkills = normalizeSkills(job.getRequiredSkills());
        if (CollUtil.isNotEmpty(requiredSkills)) {
            json.set("skills", requiredSkills);
            po.setRequiredSkills(String.join(",", requiredSkills));
        }

        List<String> preferredSkills = normalizeSkills(job.getPreferredSkills());
        if (CollUtil.isNotEmpty(preferredSkills)) {
            json.set("preferredSkills", preferredSkills);
            po.setPreferredSkills(String.join(",", preferredSkills));
        }

        if (StrUtil.isNotBlank(job.getDescription())) {
            json.set("requirements", List.of(StrUtil.trim(job.getDescription())));
        }

        if (!json.isEmpty()) {
            po.setParseResult(json.toString());
        }
    }

    private JSONObject parseResultAsObject(String parseResult) {
        if (StrUtil.isNotBlank(parseResult) && JSONUtil.isTypeJSONObject(parseResult)) {
            return JSONUtil.parseObj(parseResult);
        }
        return JSONUtil.createObj();
    }

    private List<String> normalizeSkills(List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return List.of();
        }
        return skills.stream()
                .filter(StrUtil::isNotBlank)
                .map(StrUtil::trim)
                .distinct()
                .toList();
    }

    private JSONArray firstJSONArray(JSONObject json, String... keys) {
        for (String key : keys) {
            Object value = json.get(key);
            if (value == null) {
                continue;
            }
            if (value instanceof JSONArray array) {
                return array;
            }
            if (value instanceof List<?> list) {
                return JSONUtil.parseArray(list);
            }
            if (value instanceof String str && JSONUtil.isTypeJSONArray(str)) {
                return JSONUtil.parseArray(str);
            }
        }
        return null;
    }
}
