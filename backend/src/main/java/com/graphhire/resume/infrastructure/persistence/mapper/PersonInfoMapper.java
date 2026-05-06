package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.PersonInfoPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

/**
 * 人员信息持久化Mapper
 * 对应 person_profile 表的数据库操作
 */
@Mapper
public interface PersonInfoMapper extends BaseMapper<PersonInfoPO> {

    @Update("""
        UPDATE person_info
        SET real_name = #{realName},
            gender = #{gender},
            age = #{age},
            education = #{education},
            city = #{city},
            target_city = #{targetCity},
            phone = #{phone},
            email = #{email},
            school = #{school},
            expected_salary = #{expectedSalary},
            expected_position_type_ids = #{expectedPositionTypeIds,typeHandler=com.graphhire.resume.infrastructure.persistence.typehandler.LongListArrayTypeHandler},
            default_position_type_id = #{defaultPositionTypeId},
            avatar_url = #{avatarUrl}
        WHERE id = #{id}
        """)
    int updateByIdForce(PersonInfoPO po);
}
