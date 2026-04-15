package com.graphhire.skill.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.skill.application.command.CreateSkillTagCmd;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import com.graphhire.skill.domain.vo.SkillCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillTagAppService {

    private final SkillTagRepository repository;

    @Autowired
    public SkillTagAppService(SkillTagRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SkillTag createSkillTag(CreateSkillTagCmd cmd) {
        // Check if skill with same name already exists
        if (repository.findByName(cmd.getName()).isPresent()) {
            throw new Exceptions.BusinessException("Skill tag already exists: " + cmd.getName());
        }

        SkillTag skillTag = new SkillTag(cmd.getName(), cmd.getCategory());
        skillTag.setDescription(cmd.getDescription());

        return repository.save(skillTag);
    }

    @Transactional
    public SkillTag updateSkillTag(Long id, CreateSkillTagCmd cmd) {
        SkillTag skillTag = repository.findById(id)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + id));

        skillTag.setName(cmd.getName());
        skillTag.updateCategory(cmd.getCategory());
        skillTag.setDescription(cmd.getDescription());

        return repository.save(skillTag);
    }

    @Transactional
    public void addSynonym(Long skillTagId, String synonym) {
        SkillTag skillTag = repository.findById(skillTagId)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + skillTagId));

        skillTag.addSynonym(synonym);
        repository.save(skillTag);
    }

    @Transactional
    public void removeSynonym(Long skillTagId, String synonym) {
        SkillTag skillTag = repository.findById(skillTagId)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + skillTagId));

        skillTag.removeSynonym(synonym);
        repository.save(skillTag);
    }

    @Transactional
    public void updateCategory(Long skillTagId, SkillCategory newCategory) {
        SkillTag skillTag = repository.findById(skillTagId)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + skillTagId));

        skillTag.updateCategory(newCategory);
        repository.save(skillTag);
    }

    public SkillTag getSkillTagById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + id));
    }

    public SkillTag getSkillTagByName(String name) {
        return repository.findByName(name)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + name));
    }

    public List<SkillTag> getAllSkillTags() {
        return repository.findAll();
    }

    public List<SkillTag> getSkillTagsByCategory(SkillCategory category) {
        return repository.findByCategory(category);
    }

    public List<String> normalizeSkills(List<String> rawSkills) {
        com.graphhire.skill.domain.service.SkillTagDomainService domainService =
            new com.graphhire.skill.domain.service.SkillTagDomainService(repository);
        return domainService.normalize(rawSkills);
    }

    @Transactional
    public void deleteSkillTag(Long id) {
        SkillTag skillTag = repository.findById(id)
            .orElseThrow(() -> new Exceptions.BusinessException("Skill tag not found: " + id));
        repository.delete(skillTag);
    }
}
