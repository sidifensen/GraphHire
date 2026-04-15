package com.graphhire.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.domain.model.CompanyStaff;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CompanyStaffMapper extends BaseMapper<CompanyStaff> {
}
