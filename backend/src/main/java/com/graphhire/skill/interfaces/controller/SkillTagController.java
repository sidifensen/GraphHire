package com.graphhire.skill.iface.controller;

import com.graphhire.common.vo.PageQuery;
import com.graphhire.common.vo.Result;
import com.graphhire.skill.application.command.CreateSkillTagCmd;
import com.graphhire.skill.application.service.SkillTagAppService;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.vo.SkillCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skill-tags")
public class SkillTagController {

    private final SkillTagAppService appService;

    @Autowired
    public SkillTagController(SkillTagAppService appService) {
        this.appService = appService;
    }

    @PostMapping
    public Result<SkillTag> createSkillTag(@RequestBody CreateSkillTagCmd cmd) {
        SkillTag created = appService.createSkillTag(cmd);
        return Result.success(created);
    }

    @PutMapping("/{id}")
    public Result<SkillTag> updateSkillTag(@PathVariable Long id, @RequestBody CreateSkillTagCmd cmd) {
        SkillTag updated = appService.updateSkillTag(id, cmd);
        return Result.success(updated);
    }

    @GetMapping("/{id}")
    public Result<SkillTag> getSkillTag(@PathVariable Long id) {
        SkillTag skillTag = appService.getSkillTagById(id);
        return Result.success(skillTag);
    }

    @GetMapping("/name/{name}")
    public Result<SkillTag> getSkillTagByName(@PathVariable String name) {
        SkillTag skillTag = appService.getSkillTagByName(name);
        return Result.success(skillTag);
    }

    @GetMapping
    public Result<List<SkillTag>> getAllSkillTags() {
        List<SkillTag> skillTags = appService.getAllSkillTags();
        return Result.success(skillTags);
    }

    @GetMapping("/category/{category}")
    public Result<List<SkillTag>> getSkillTagsByCategory(@PathVariable SkillCategory category) {
        List<SkillTag> skillTags = appService.getSkillTagsByCategory(category);
        return Result.success(skillTags);
    }

    @PostMapping("/{id}/synonyms")
    public Result<Void> addSynonym(@PathVariable Long id, @RequestParam String synonym) {
        appService.addSynonym(id, synonym);
        return Result.success();
    }

    @DeleteMapping("/{id}/synonyms/{synonym}")
    public Result<Void> removeSynonym(@PathVariable Long id, @PathVariable String synonym) {
        appService.removeSynonym(id, synonym);
        return Result.success();
    }

    @PutMapping("/{id}/category")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestParam SkillCategory category) {
        appService.updateCategory(id, category);
        return Result.success();
    }

    @PostMapping("/normalize")
    public Result<List<String>> normalizeSkills(@RequestBody List<String> rawSkills) {
        List<String> normalized = appService.normalizeSkills(rawSkills);
        return Result.success(normalized);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteSkillTag(@PathVariable Long id) {
        appService.deleteSkillTag(id);
        return Result.success();
    }
}
