package com.graphhire.skill.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.skill.application.command.CreateSkillTagCmd;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 技能标签应用服务
 *
 * 【模块说明】处理技能标签的业务用例，包括创建、更新、删除、同义词管理等。
 *             是技能标签领域对外提供的服务接口，协调仓储和领域服务完成业务操作。
 *
 * 【数据来源】技能标签数据存储在PostgreSQL数据库，通过SkillTagRepository访问。
 *
 * 【方法概览】
 * - createSkillTag：创建新技能标签
 * - updateSkillTag：更新技能标签信息
 * - addSynonym/removeSynonym：管理同义词
 * - getSkillTagById/getSkillTagByName/getAllSkillTags：查询方法
 * - normalizeSkills：技能名称标准化（批量）
 * - deleteSkillTag：删除技能标签
 */
@Service
public class SkillTagAppService {

    /** 技能标签仓储接口 */
    private final SkillTagRepository repository;

    @Autowired
    public SkillTagAppService(SkillTagRepository repository) {
        this.repository = repository;
    }

    /**
     * 创建技能标签
     * 【功能说明】创建新的技能标签，若同名标签已存在则抛出业务异常。
     * 【业务步骤】
     * 步骤1：检查同名标签是否已存在，存在则抛异常
     * 步骤2：构建技能标签领域对象
     * 步骤3：保存到数据库并返回
     */
    @Transactional
    public SkillTag createSkillTag(CreateSkillTagCmd cmd) {
        // 步骤1：检查同名标签是否已存在
        if (repository.findByName(cmd.getName()).isPresent()) {
            throw new Exceptions.BusinessException("Skill tag already exists: " + cmd.getName());
        }

        // 步骤2：构建技能标签领域对象
        SkillTag skillTag = new SkillTag(cmd.getName());
        skillTag.setDescription(cmd.getDescription());

        // 步骤3：保存到数据库并返回
        return repository.save(skillTag);
    }

    /**
     * 更新技能标签
     * 【功能说明】更新指定ID的技能标签信息，包括名称、描述。
     * 【业务步骤】
     * 步骤1：根据ID查询标签，不存在则抛异常
     * 步骤2：更新标签的各项属性
     * 步骤3：保存更新后的标签
     */
    @Transactional
    public SkillTag updateSkillTag(Long id, CreateSkillTagCmd cmd) {
        // 步骤1：根据ID查询标签
        SkillTag skillTag = repository.findById(id)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + id));

        // 步骤2：更新标签的各项属性
        skillTag.setName(cmd.getName());
        skillTag.setDescription(cmd.getDescription());

        // 步骤3：保存更新后的标签
        return repository.save(skillTag);
    }

    /**
     * 添加同义词
     * 【功能说明】为指定技能标签添加一个新的同义词，用于提高匹配覆盖率。
     * 【业务步骤】
     * 步骤1：根据ID查询标签，不存在则抛异常
     * 步骤2：调用领域对象添加同义词
     * 步骤3：保存更新后的标签
     */
    @Transactional
    public void addSynonym(Long skillTagId, String synonym) {
        // 步骤1：根据ID查询标签
        SkillTag skillTag = repository.findById(skillTagId)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + skillTagId));

        // 步骤2：调用领域对象添加同义词
        skillTag.addSynonym(synonym);

        // 步骤3：保存更新后的标签
        repository.save(skillTag);
    }

    /**
     * 移除同义词
     * 【功能说明】从指定技能标签中移除一个已存在的同义词。
     * 【业务步骤】
     * 步骤1：根据ID查询标签，不存在则抛异常
     * 步骤2：调用领域对象移除同义词
     * 步骤3：保存更新后的标签
     */
    @Transactional
    public void removeSynonym(Long skillTagId, String synonym) {
        // 步骤1：根据ID查询标签
        SkillTag skillTag = repository.findById(skillTagId)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + skillTagId));

        // 步骤2：调用领域对象移除同义词
        skillTag.removeSynonym(synonym);

        // 步骤3：保存更新后的标签
        repository.save(skillTag);
    }

    /**
     * 根据ID获取技能标签
     * 【功能说明】通过标签ID查询对应的技能标签信息，若不存在则抛出业务异常。
     * 【业务步骤】
     * 步骤1：根据ID从仓储查询标签
     * 步骤2：若不存在则抛异常
     * 步骤3：返回标签对象
     */
    public SkillTag getSkillTagById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + id));
    }

    /**
     * 根据名称获取技能标签
     * 【功能说明】通过标签名称进行精确匹配查询，若不存在则抛出业务异常。
     * 【业务步骤】
     * 步骤1：根据名称从仓储查询标签
     * 步骤2：若不存在则抛异常
     * 步骤3：返回标签对象
     */
    public SkillTag getSkillTagByName(String name) {
        return repository.findByName(name)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + name));
    }

    /**
     * 获取所有技能标签
     * 【功能说明】查询数据库中所有已注册的技能标签，用于标签管理或下拉列表展示。
     * 【业务步骤】
     * 步骤1：调用仓储findAll方法
     * 步骤2：返回所有标签列表
     */
    public List<SkillTag> getAllSkillTags() {
        return repository.findAll();
    }

    /**
     * 标准化技能列表
     * 【功能说明】对用户输入的原始技能列表进行标准化处理，将同义词、变体名称统一为标准标签名。
     *             通过领域服务进行精确匹配和同义词匹配。
     * 【业务步骤】
     * 步骤1：创建领域服务实例
     * 步骤2：调用领域服务的normalize方法进行标准化处理
     * 步骤3：返回标准化后的技能标签名称列表
     * @param rawSkills 原始技能名称列表（可能包含同义词、变体等）
     * @return 标准化后的技能标签名称列表
     */
    public List<String> normalizeSkills(List<String> rawSkills) {
        com.graphhire.skill.domain.service.SkillTagDomainService domainService =
            new com.graphhire.skill.domain.service.SkillTagDomainService(repository);
        return domainService.normalize(rawSkills);
    }

    /**
     * 删除技能标签
     * 【功能说明】根据ID删除指定的技能标签。
     * 【业务步骤】
     * 步骤1：根据ID查询标签，不存在则抛异常
     * 步骤2：执行删除操作
     */
    @Transactional
    public void deleteSkillTag(Long id) {
        // 步骤1：根据ID查询标签
        SkillTag skillTag = repository.findById(id)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + id));

        // 步骤2：执行删除操作
        repository.delete(skillTag);
    }
}
