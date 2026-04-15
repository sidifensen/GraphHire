package com.graphhire.resume.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.PersonInfoMapper;
import com.graphhire.resume.infrastructure.persistence.po.PersonInfoPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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
            personInfoMapper.updateById(po);
        }
        return personInfo;
    }

    private PersonInfo toDomain(PersonInfoPO po) {
        PersonInfo personInfo = new PersonInfo();
        personInfo.setId(po.getId());
        personInfo.setUserId(po.getUserId());
        personInfo.setRealName(po.getRealName());
        personInfo.setGender(po.getGender());
        personInfo.setAge(po.getAge());
        personInfo.setPhone(po.getPhone());
        personInfo.setEducation(po.getEducation());
        personInfo.setCity(po.getCity());
        personInfo.setTargetCity(po.getTargetCity());
        personInfo.setExpectedSalary(po.getExpectedSalary());
        return personInfo;
    }

    private PersonInfoPO toPO(PersonInfo personInfo) {
        PersonInfoPO po = new PersonInfoPO();
        po.setId(personInfo.getId());
        po.setUserId(personInfo.getUserId());
        po.setRealName(personInfo.getRealName());
        po.setGender(personInfo.getGender());
        po.setAge(personInfo.getAge());
        po.setPhone(personInfo.getPhone());
        po.setEducation(personInfo.getEducation());
        po.setCity(personInfo.getCity());
        po.setTargetCity(personInfo.getTargetCity());
        po.setExpectedSalary(personInfo.getExpectedSalary());
        return po;
    }
}
