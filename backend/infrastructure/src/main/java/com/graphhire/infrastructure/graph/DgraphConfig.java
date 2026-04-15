package com.graphhire.infrastructure.graph;

import io.dgraph.DgraphClient;
import io.dgraph.DgraphGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DgraphConfig {
    @Value("${dgraph.url:http://localhost:8080}")
    private String url;

    @Value("${dgraph.api-key:}")
    private String apiKey;

    @Bean
    public DgraphClient dgraphClient() {
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 8080)
            .usePlaintext()
            .build();
        DgraphGrpc.DgraphStub stub = DgraphGrpc.newStub(channel);
        return new DgraphClient(stub);
    }
}
