package com.graphhire.resume.interfaces.dto;

/**
 * 个人综合能力评估响应
 */
public class AbilityAssessmentResponse {

    private final int totalScore;
    private final String level;
    private final int skillCount;
    private final DimensionScores dimensions;
    private final String evaluatedAt;

    public AbilityAssessmentResponse(int totalScore, String level, int skillCount, DimensionScores dimensions, String evaluatedAt) {
        this.totalScore = totalScore;
        this.level = level;
        this.skillCount = skillCount;
        this.dimensions = dimensions;
        this.evaluatedAt = evaluatedAt;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public String getLevel() {
        return level;
    }

    public int getSkillCount() {
        return skillCount;
    }

    public DimensionScores getDimensions() {
        return dimensions;
    }

    public String getEvaluatedAt() {
        return evaluatedAt;
    }

    public static class DimensionScores {
        private final int breadth;
        private final int depth;
        private final int structure;
        private final int freshness;
        private final int rarity;

        public DimensionScores(int breadth, int depth, int structure, int freshness, int rarity) {
            this.breadth = breadth;
            this.depth = depth;
            this.structure = structure;
            this.freshness = freshness;
            this.rarity = rarity;
        }

        public int getBreadth() {
            return breadth;
        }

        public int getDepth() {
            return depth;
        }

        public int getStructure() {
            return structure;
        }

        public int getFreshness() {
            return freshness;
        }

        public int getRarity() {
            return rarity;
        }
    }
}
