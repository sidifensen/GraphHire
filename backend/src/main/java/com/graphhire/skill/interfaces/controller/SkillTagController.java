package com.graphhire.skill.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.common.vo.Result;
import com.graphhire.skill.application.command.CreateSkillTagCmd;
import com.graphhire.skill.application.service.SkillTagAppService;
import com.graphhire.skill.domain.model.SkillTag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 技能标签管理接口
 * 提供技能标签的增删改查、同义词管理和技能标准化功能
 */
@RestController
@RequestMapping("/skill-tags")
public class SkillTagController {

    private final SkillTagAppService appService;
    private final UserRepository userRepository;

    @Autowired
    public SkillTagController(SkillTagAppService appService, UserRepository userRepository) {
        this.appService = appService;
        this.userRepository = userRepository;
    }

    /**
     * 创建技能标签
     * @param cmd 创建请求
     * @return 创建结果
     */
    @PostMapping
    public Result<SkillTag> createSkillTag(@RequestBody CreateSkillTagCmd cmd) {
        ensureAdmin();
        SkillTag created = appService.createSkillTag(cmd);
        return Result.success(created);
    }

    /**
     * 更新技能标签
     * @param id 标签ID
     * @param cmd 更新请求
     * @return 更新结果
     */
    @PutMapping("/{id}")
    public Result<SkillTag> updateSkillTag(@PathVariable Long id, @RequestBody CreateSkillTagCmd cmd) {
        ensureAdmin();
        SkillTag updated = appService.updateSkillTag(id, cmd);
        return Result.success(updated);
    }

    /**
     * 获取技能标签
     * @param id 标签ID
     * @return 技能标签详情
     */
    @GetMapping("/{id}")
    public Result<SkillTag> getSkillTag(@PathVariable Long id) {
        SkillTag skillTag = appService.getSkillTagById(id);
        return Result.success(skillTag);
    }

    /**
     * 根据名称查询技能标签
     * @param name 标签名称
     * @return 技能标签详情
     */
    @GetMapping("/name/{name}")
    public Result<SkillTag> getSkillTagByName(@PathVariable String name) {
        SkillTag skillTag = appService.getSkillTagByName(name);
        return Result.success(skillTag);
    }

    /**
     * 获取所有技能标签
     * @return 技能标签列表
     */
    @GetMapping
    public Result<List<SkillTag>> getAllSkillTags() {
        List<SkillTag> skillTags = appService.getAllSkillTags();
        return Result.success(skillTags);
    }

    /**
     * 添加同义词
     * @param id 标签ID
     * @param synonym 同义词
     * @return 操作结果
     */
    @PostMapping("/{id}/synonyms")
    public Result<Void> addSynonym(@PathVariable Long id, @RequestParam String synonym) {
        ensureAdmin();
        appService.addSynonym(id, synonym);
        return Result.success();
    }

    /**
     * 移除同义词
     * @param id 标签ID
     * @param synonym 同义词
     * @return 操作结果
     */
    @DeleteMapping("/{id}/synonyms/{synonym}")
    public Result<Void> removeSynonym(@PathVariable Long id, @PathVariable String synonym) {
        ensureAdmin();
        appService.removeSynonym(id, synonym);
        return Result.success();
    }

    /**
     * 标准化技能列表
     * @param rawSkills 原始技能列表
     * @return 标准化后的技能列表
     */
    @PostMapping("/normalize")
    public Result<List<String>> normalizeSkills(@RequestBody List<String> rawSkills) {
        List<String> normalized = appService.normalizeSkills(rawSkills);
        return Result.success(normalized);
    }

    /**
     * 删除技能标签
     * @param id 标签ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteSkillTag(@PathVariable Long id) {
        ensureAdmin();
        appService.deleteSkillTag(id);
        return Result.success();
    }

    private void ensureAdmin() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exceptions.UnauthorizedException("登录用户不存在"));
        if (user.getUserType() != UserType.ADMIN) {
            throw new Exceptions.ForbiddenException("无权访问该资源");
        }
    }
}
