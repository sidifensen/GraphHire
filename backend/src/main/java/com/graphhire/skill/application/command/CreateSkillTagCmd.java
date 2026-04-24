package com.graphhire.skill.application.command;

/**
 * 创建技能标签命令对象
 * 用于接收创建或更新技能标签时的输入参数
 */
public class CreateSkillTagCmd {
    /** 技能标签名称 */
    private String name;
    /** 技能标签详细描述 */
    private String description;

    public CreateSkillTagCmd() {
    }

    public CreateSkillTagCmd(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
