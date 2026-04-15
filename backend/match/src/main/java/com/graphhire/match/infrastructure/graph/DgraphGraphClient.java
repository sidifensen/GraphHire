package com.graphhire.match.infrastructure.graph;

import io.dgraph.DgraphClient;
import io.dgraph.DgraphProto;
import io.dgraph.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class DgraphGraphClient {

    @Autowired
    private DgraphClient dgraphClient;

    public void upsertMatchRecord(Long matchId, Long resumeId, Long jobId, double score) {
        String query = """
            query {
                matchRecord(matchId: "%s") {
                    uid
                }
            }
            """.formatted(matchId);

        try (Transaction txn = dgraphClient.newTransaction()) {
            String muation = """
                {
                    "uid": "_:matchRecord",
                    "matchRecordId": "%s",
                    "resumeId": "%s",
                    "jobId": "%s",
                    "score": %s,
                    "dgraph.type": "MatchRecord"
                }
                """.formatted(matchId, resumeId, jobId, score);

            txn.mutate(muation);
            txn.commit();
        }
    }

    public Map<String, Object> queryMatchRecord(Long matchId) {
        String query = """
            query {
                matchRecord(matchId: "%s") {
                    uid
                    matchRecordId
                    resumeId
                    jobId
                    score
                }
            }
            """.formatted(matchId);

        try (Transaction txn = dgraphClient.newReadOnlyTransaction()) {
            DgraphProto.Response response = txn.query(query);
            return Map.of("data", response);
        }
    }
}
