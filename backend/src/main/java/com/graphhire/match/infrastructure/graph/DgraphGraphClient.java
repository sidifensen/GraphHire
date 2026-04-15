package com.graphhire.match.infrastructure.graph;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Dgraph graph client for match records.
 * Note: Dgraph dependency needs to be available for this to compile.
 * Currently stubbed out due to unavailability of dgraph4j artifact.
 */
@Component
public class DgraphGraphClient {

    // DgraphClient dgraphClient;
    // private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DgraphGraphClient.class);

    public void upsertMatchRecord(Long matchId, Long resumeId, Long jobId, double score) {
        // TODO: Re-enable when dgraph4j dependency is available
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

    public java.util.Map<String, Object> queryMatchRecord(Long matchId) {
        // TODO: Re-enable when dgraph4j dependency is available
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
