package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.PersonInfoMapper;
import com.graphhire.resume.infrastructure.persistence.po.PersonInfoPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 个人信息仓储实现
 *
 * 【模块说明】提供个人信息数据的持久化操作。
 *
 * 【数据来源】person_info 表
 *
 * 【方法概览】
 * - findByUserId：根据用户ID查询个人信息
 * - save：保存个人信息
 */
@Repository
public class PersonInfoRepositoryImpl implements PersonInfoRepository {

    @Autowired
    private PersonInfoMapper personInfoMapper;

    @Override
    public Optional<PersonInfo> findByUserId(Long userId) {
        LambdaQueryWrapper<PersonInfoPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PersonInfoPO::getUserId, userId);
        PersonInfoPO po = personInfoMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public PersonInfo save(PersonInfo personInfo) {
        PersonInfoPO po = toPO(personInfo);
        if (personInfo.getId() == null) {
            personInfoMapper.insert(po);
            personInfo.setId(po.getId());
        } else {
            UpdateWrapper<PersonInfoPO> wrapper = new UpdateWrapper<>();
            wrapper.eq("id", personInfo.getId())
                .set("real_name", po.getRealName())
                .set("gender", po.getGender())
                .set("age", po.getAge())
                .set("education", po.getEducation())
                .set("city", po.getCity())
                .set("target_city", po.getTargetCity())
                .set("phone", po.getPhone())
                .set("expected_salary", po.getExpectedSalary());
            personInfoMapper.update(null, wrapper);
        }
        return personInfo;
    }

    /**
     * PO 转 PersonInfo Domain
     */
    private PersonInfo toDomain(PersonInfoPO po) {
        PersonInfo personInfo = new PersonInfo();
        BeanUtil.copyProperties(po, personInfo);
        return personInfo;
    }

    /**
     * PersonInfo Domain 转 PO
     */
    private PersonInfoPO toPO(PersonInfo personInfo) {
        PersonInfoPO po = new PersonInfoPO();
        BeanUtil.copyProperties(personInfo, po);
        return po;
    }
}
