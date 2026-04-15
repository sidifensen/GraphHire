package com.graphhire.application.service;

import com.graphhire.application.command.SkillTagCreateCmd;
import com.graphhire.application.command.SkillTagUpdateCmd;
import com.graphhire.domain.model.JobSkill;
import com.graphhire.domain.model.SkillTag;
import com.graphhire.domain.repository.JobSkillRepository;
import com.graphhire.domain.repository.SkillTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillTagAppService {
    private final SkillTagRepository skillTagRepository;
    private final JobSkillRepository jobSkillRepository;

    public List<SkillTag> listAll() {
        log.info("Listing all skill tags");
        return skillTagRepository.findAll();
    }

    public List<SkillTag> listByCategory(String category) {
        log.info("Listing skill tags by category: {}", category);
        return skillTagRepository.findByCategory(category);
    }

    @Transactional
    public SkillTag create(SkillTagCreateCmd cmd) {
        log.info("Creating skill tag: {}", cmd.getTagName());

        SkillTag skillTag = SkillTag.builder()
                .tagName(cmd.getTagName())
                .category(cmd.getCategory())
                .createdAt(LocalDateTime.now())
                .build();

        skillTagRepository.save(skillTag);

        log.info("Skill tag created successfully: id={}", skillTag.getId());
        return skillTag;
    }

    @Transactional
    public void update(Long id, SkillTagUpdateCmd cmd) {
        log.info("Updating skill tag: id={}", id);

        SkillTag skillTag = skillTagRepository.findByIdOptional(id)
                .orElseThrow(() -> new RuntimeException("技能标签不存在"));

        if (cmd.getTagName() != null) {
            skillTag.setTagName(cmd.getTagName());
        }
        if (cmd.getCategory() != null) {
            skillTag.setCategory(cmd.getCategory());
        }

        skillTagRepository.save(skillTag);

        log.info("Skill tag updated successfully");
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting skill tag: id={}", id);

        // Check if tag is used by any jobs
        List<JobSkill> jobSkills = jobSkillRepository.findBySkillTagId(id);
        if (!jobSkills.isEmpty()) {
            throw new RuntimeException("该技能标签正在使用中，无法删除");
        }

        skillTagRepository.delete(id);

        log.info("Skill tag deleted successfully");
    }
}
