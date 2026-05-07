package com.graphhire.publicapi.application.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.publicapi.interfaces.dto.response.PublicHotSearchItemResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class HotSearchAppService {

    private static final String JOB_HOT_SEARCH_KEY = "public:hot-search:jobs";
    private static final String COMPANY_HOT_SEARCH_KEY = "public:hot-search:companies";
    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 30;
    private static final int MIN_KEYWORD_LENGTH = 2;
    private static final int MAX_KEYWORD_LENGTH = 40;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public void recordJobKeyword(String keyword) {
        recordKeyword(JOB_HOT_SEARCH_KEY, keyword);
    }

    public void recordCompanyKeyword(String keyword) {
        recordKeyword(COMPANY_HOT_SEARCH_KEY, keyword);
    }

    public List<PublicHotSearchItemResponse> listJobHotSearches(Integer limit) {
        return listHotSearches(JOB_HOT_SEARCH_KEY, limit);
    }

    public List<PublicHotSearchItemResponse> listCompanyHotSearches(Integer limit) {
        return listHotSearches(COMPANY_HOT_SEARCH_KEY, limit);
    }

    private void recordKeyword(String key, String keyword) {
        String normalized = normalizeKeyword(keyword);
        if (normalized == null) {
            return;
        }
        stringRedisTemplate.opsForZSet().incrementScore(key, normalized, 1D);
    }

    private List<PublicHotSearchItemResponse> listHotSearches(String key, Integer requestedLimit) {
        int safeLimit = normalizeLimit(requestedLimit);
        Set<ZSetOperations.TypedTuple<String>> tuples = stringRedisTemplate.opsForZSet()
                .reverseRangeWithScores(key, 0, safeLimit - 1);
        if (CollUtil.isEmpty(tuples)) {
            return List.of();
        }
        List<PublicHotSearchItemResponse> items = new ArrayList<>();
        for (ZSetOperations.TypedTuple<String> tuple : tuples) {
            String keyword = tuple.getValue();
            if (StrUtil.isBlank(keyword)) {
                continue;
            }
            Double score = tuple.getScore();
            items.add(new PublicHotSearchItemResponse(keyword, score == null ? 0D : score));
        }
        return items;
    }

    private String normalizeKeyword(String keyword) {
        if (StrUtil.isBlank(keyword)) {
            return null;
        }
        String normalized = StrUtil.trim(keyword);
        if (StrUtil.length(normalized) < MIN_KEYWORD_LENGTH) {
            return null;
        }
        if (StrUtil.length(normalized) > MAX_KEYWORD_LENGTH) {
            return null;
        }
        String lower = normalized.toLowerCase(Locale.ROOT);
        if (lower.startsWith("public_")) {
            return null;
        }
        return normalized;
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
