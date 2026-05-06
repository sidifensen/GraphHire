package com.graphhire.industryskill.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.graphhire.industryskill.domain.model.IndustrySkillProfile;
import com.graphhire.industryskill.domain.repository.IndustrySkillProfileRepository;
import com.graphhire.industryskill.infrastructure.persistence.mapper.IndustrySkillProfileMapper;
import com.graphhire.industryskill.infrastructure.persistence.po.IndustrySkillProfilePO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class IndustrySkillProfileRepositoryImpl implements IndustrySkillProfileRepository {

    @Autowired
    private IndustrySkillProfileMapper mapper;

    @Override
    public Optional<IndustrySkillProfile> findByPositionTypeId(Long positionTypeId) {
        return Optional.ofNullable(mapper.selectByPositionTypeId(positionTypeId)).map(this::toDomain);
    }

    @Override
    public List<IndustrySkillProfile> findAll() {
        return mapper.selectList(null).stream().map(this::toDomain).toList();
    }

    @Override
    public IndustrySkillProfile save(IndustrySkillProfile profile) {
        IndustrySkillProfilePO po = toPO(profile);
        if (profile.getId() == null) {
            mapper.insertWithJsonb(po);
            profile.setId(po.getId());
        } else {
            mapper.updateByIdWithJsonb(po);
        }
        return profile;
    }

    private IndustrySkillProfile toDomain(IndustrySkillProfilePO po) {
        IndustrySkillProfile domain = new IndustrySkillProfile();
        BeanUtil.copyProperties(po, domain);
        return domain;
    }

    private IndustrySkillProfilePO toPO(IndustrySkillProfile domain) {
        IndustrySkillProfilePO po = new IndustrySkillProfilePO();
        BeanUtil.copyProperties(domain, po);
        return po;
    }
}
