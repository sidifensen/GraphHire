package com.graphhire.match.infrastructure.graph;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Dgraph图数据库客户端
 *
 * 【模块说明】用于将人岗匹配记录写入Dgraph图数据库，支持复杂关系查询。
 *
 * 【注意事项】
 * - 当前因dgraph4j依赖不可用，已临时禁用
 * - TODO(sidifensen: 2026-04-16): 重新启用需等待dgraph4j依赖可用
 */
@Component
public class DgraphGraphClient {

    // DgraphClient dgraphClient;
    // private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DgraphGraphClient.class);

    /**
     * 插入或更新匹配记录到图数据库
     * @param matchId 匹配记录ID
     * @param resumeId 简历ID
     * @param jobId 职位ID
     * @param score 匹配分数
     */
    public void upsertMatchRecord(Long matchId, Long resumeId, Long jobId, double score) {
        // TODO(sidifensen: 2026-04-16): dgraph4j依赖可用后重新启用
        // String query = """
        //     query {
        //         matchRecord(matchId: "%s") {
        //             uid
        //         }
        //     }
        //     """.formatted(matchId);
        //
        // try (Transaction txn = dgraphClient.newTransaction()) {
        //     String muation = """
        //         {
        //             "uid": "_:matchRecord",
        //             "matchRecordId": "%s",
        //             "resumeId": "%s",
        //             "jobId": "%s",
        //             "score": %s,
        //             "dgraph.type": "MatchRecord"
        //         }
        //         """.formatted(matchId, resumeId, jobId, score);
        //
        //     txn.mutate(muation);
        //     txn.commit();
        // }
    }

    /**
     * 从图数据库查询匹配记录
     * @param matchId 匹配记录ID
     * @return 匹配记录数据
     */
    public java.util.Map<String, Object> queryMatchRecord(Long matchId) {
        // TODO(sidifensen: 2026-04-16): dgraph4j依赖可用后重新启用
        // String query = """
        //     query {
        //         matchRecord(matchId: "%s") {
        //             uid
        //             matchRecordId
        //             resumeId
        //             jobId
        //             score
        //         }
        //     }
        //     """.formatted(matchId);
        //
        // try (Transaction txn = dgraphClient.newReadOnlyTransaction()) {
        //     DgraphProto.Response response = txn.query(query);
        //     return Map.of("data", response);
        // }
        return java.util.Map.of("data", "stubbed");
    }
}
