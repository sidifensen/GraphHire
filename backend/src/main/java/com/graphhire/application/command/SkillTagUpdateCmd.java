package com.graphhire.application.command;

import lombok.Data;

@Data
public class SkillTagUpdateCmd {
    private String tagName;
    private String category;
}
