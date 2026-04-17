package com.graphhire.skill.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.skill.infrastructure.persistence.po.CategoryPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CategoryMapper extends BaseMapper<CategoryPO> {
}
