package com.graphhire.skill.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.skill.infrastructure.persistence.po.SkillTagPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface SkillTagMapper extends BaseMapper<SkillTagPO> {

    @Select("SELECT id, name, synonyms::text AS synonyms, create_time, update_time FROM skill_tag WHERE id = #{id}")
    SkillTagPO selectByIdWithSynonyms(@Param("id") Long id);

    @Select("SELECT id, name, synonyms::text AS synonyms, create_time, update_time FROM skill_tag WHERE name = #{name}")
    SkillTagPO selectByNameWithSynonyms(@Param("name") String name);

    @Select("SELECT id, name, synonyms::text AS synonyms, create_time, update_time FROM skill_tag")
    List<SkillTagPO> selectAllWithSynonyms();

    @Select({
        "<script>",
        "SELECT id, name, synonyms::text AS synonyms, create_time, update_time",
        "FROM skill_tag",
        "WHERE name IN",
        "<foreach collection='names' item='name' open='(' separator=',' close=')'>",
        "#{name}",
        "</foreach>",
        "</script>"
    })
    List<SkillTagPO> selectByNamesWithSynonyms(@Param("names") List<String> names);

    @Insert("INSERT INTO skill_tag (name, synonyms, create_time, update_time) VALUES (#{name}, CAST(#{synonyms} AS jsonb), COALESCE(#{createTime}, CURRENT_TIMESTAMP), COALESCE(#{updateTime}, CURRENT_TIMESTAMP))")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertWithJsonb(SkillTagPO po);

    @Update("UPDATE skill_tag SET name = #{name}, synonyms = CAST(#{synonyms} AS jsonb), update_time = COALESCE(#{updateTime}, CURRENT_TIMESTAMP) WHERE id = #{id}")
    int updateByIdWithJsonb(SkillTagPO po);
}
