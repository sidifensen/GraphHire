package com.graphhire.industryskill.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.industryskill.infrastructure.persistence.po.IndustrySkillProfilePO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface IndustrySkillProfileMapper extends BaseMapper<IndustrySkillProfilePO> {

    @Select("SELECT id, position_type_id, profile_json::text AS profile_json, deleted, create_time, update_time FROM position_type_skill_profile WHERE position_type_id = #{positionTypeId} AND deleted = 0")
    IndustrySkillProfilePO selectByPositionTypeId(@Param("positionTypeId") Long positionTypeId);

    @Insert("INSERT INTO position_type_skill_profile (position_type_id, profile_json, create_time, update_time, deleted) VALUES (#{positionTypeId}, CAST(#{profileJson} AS jsonb), COALESCE(#{createTime}, CURRENT_TIMESTAMP), COALESCE(#{updateTime}, CURRENT_TIMESTAMP), COALESCE(#{deleted}, 0))")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertWithJsonb(IndustrySkillProfilePO po);

    @Update("UPDATE position_type_skill_profile SET profile_json = CAST(#{profileJson} AS jsonb), update_time = COALESCE(#{updateTime}, CURRENT_TIMESTAMP), deleted = COALESCE(#{deleted}, 0) WHERE id = #{id}")
    int updateByIdWithJsonb(IndustrySkillProfilePO po);
}
