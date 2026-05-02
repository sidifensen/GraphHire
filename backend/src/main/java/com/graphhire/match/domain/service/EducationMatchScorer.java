package com.graphhire.match.domain.service;

import cn.hutool.core.util.StrUtil;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EducationMatchScorer {

    private static final Map<String, Integer> RANK_MAP = Map.of(
        "中专", 0,
        "大专", 1,
        "本科", 2,
        "硕士", 3,
        "博士", 4
    );

    public double score(String userEducation, String requiredEducation) {
        int userRank = rank(userEducation);
        int requiredRank = rank(requiredEducation);
        if (requiredRank <= 0) {
            return 100.0;
        }
        if (userRank >= requiredRank) {
            return 100.0;
        }
        int gap = requiredRank - userRank;
        return Math.max(0.0, 100.0 - gap * 35.0);
    }

    private int rank(String education) {
        if (StrUtil.isBlank(education)) {
            return 0;
        }
        String normalized = education.trim();
        if (normalized.matches("\\d+")) {
            try {
                int code = Integer.parseInt(normalized);
                return switch (code) {
                    case 1 -> RANK_MAP.get("中专");
                    case 2 -> RANK_MAP.get("大专");
                    case 3 -> RANK_MAP.get("本科");
                    case 4 -> RANK_MAP.get("硕士");
                    case 5 -> RANK_MAP.get("博士");
                    default -> 0;
                };
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        if (normalized.contains("博士")) return RANK_MAP.get("博士");
        if (normalized.contains("硕士")) return RANK_MAP.get("硕士");
        if (normalized.contains("本科")) return RANK_MAP.get("本科");
        if (normalized.contains("大专")) return RANK_MAP.get("大专");
        if (normalized.contains("中专")) return RANK_MAP.get("中专");
        return 0;
    }
}
