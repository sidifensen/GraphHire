package com.graphhire.positiontype.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.positiontype.domain.repository.PositionTypeRepository;
import com.graphhire.positiontype.infrastructure.persistence.mapper.PositionTypeMapper;
import com.graphhire.positiontype.infrastructure.persistence.po.PositionTypePO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class PositionTypeRepositoryImpl implements PositionTypeRepository {

    @Autowired
    private PositionTypeMapper positionTypeMapper;

    @Override
    public Optional<PositionType> findById(Long id) {
        LambdaQueryWrapper<PositionTypePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PositionTypePO::getId, id).eq(PositionTypePO::getDeleted, 0);
        return Optional.ofNullable(positionTypeMapper.selectOne(wrapper)).map(this::toDomain);
    }

    @Override
    public List<PositionType> findAllNotDeletedOrdered() {
        LambdaQueryWrapper<PositionTypePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PositionTypePO::getDeleted, 0);
        wrapper.orderByAsc(PositionTypePO::getLevel, PositionTypePO::getParentId, PositionTypePO::getSortNo, PositionTypePO::getId);
        return positionTypeMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public PositionType save(PositionType positionType) {
        PositionTypePO po = toPO(positionType);
        if (positionType.getId() == null) {
            positionTypeMapper.insert(po);
            positionType.setId(po.getId());
        } else {
            positionTypeMapper.updateById(po);
        }
        return positionType;
    }

    @Override
    public Long nextCode() {
        return positionTypeMapper.nextCode();
    }

    private PositionTypePO toPO(PositionType positionType) {
        PositionTypePO po = new PositionTypePO();
        BeanUtil.copyProperties(positionType, po);
        return po;
    }

    private PositionType toDomain(PositionTypePO po) {
        PositionType item = new PositionType();
        BeanUtil.copyProperties(po, item);
        return item;
    }
}

