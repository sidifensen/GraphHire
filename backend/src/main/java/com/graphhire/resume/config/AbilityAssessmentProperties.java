package com.graphhire.resume.config;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AbilityAssessmentProperties {

    private List<String> categoryKeys = new ArrayList<>();
    private Map<String, List<String>> categoryKeywords = new LinkedHashMap<>();
    private Map<String, List<String>> domainKeywords = new LinkedHashMap<>();
    private List<String> freshnessKeywords = new ArrayList<>();
    private Map<String, Integer> rarityKeywords = new LinkedHashMap<>();
    private Weights weights = new Weights();

    public List<String> getCategoryKeys() {
        return categoryKeys;
    }

    public void setCategoryKeys(List<String> categoryKeys) {
        this.categoryKeys = categoryKeys;
    }

    public Map<String, List<String>> getCategoryKeywords() {
        return categoryKeywords;
    }

    public void setCategoryKeywords(Map<String, List<String>> categoryKeywords) {
        this.categoryKeywords = categoryKeywords;
    }

    public Map<String, List<String>> getDomainKeywords() {
        return domainKeywords;
    }

    public void setDomainKeywords(Map<String, List<String>> domainKeywords) {
        this.domainKeywords = domainKeywords;
    }

    public List<String> getFreshnessKeywords() {
        return freshnessKeywords;
    }

    public void setFreshnessKeywords(List<String> freshnessKeywords) {
        this.freshnessKeywords = freshnessKeywords;
    }

    public Map<String, Integer> getRarityKeywords() {
        return rarityKeywords;
    }

    public void setRarityKeywords(Map<String, Integer> rarityKeywords) {
        this.rarityKeywords = rarityKeywords;
    }

    public Weights getWeights() {
        return weights;
    }

    public void setWeights(Weights weights) {
        this.weights = weights;
    }

    public static class Weights {
        private double breadth = 0.25;
        private double depth = 0.25;
        private double structure = 0.20;
        private double freshness = 0.15;
        private double rarity = 0.15;

        public double getBreadth() {
            return breadth;
        }

        public void setBreadth(double breadth) {
            this.breadth = breadth;
        }

        public double getDepth() {
            return depth;
        }

        public void setDepth(double depth) {
            this.depth = depth;
        }

        public double getStructure() {
            return structure;
        }

        public void setStructure(double structure) {
            this.structure = structure;
        }

        public double getFreshness() {
            return freshness;
        }

        public void setFreshness(double freshness) {
            this.freshness = freshness;
        }

        public double getRarity() {
            return rarity;
        }

        public void setRarity(double rarity) {
            this.rarity = rarity;
        }
    }
}
