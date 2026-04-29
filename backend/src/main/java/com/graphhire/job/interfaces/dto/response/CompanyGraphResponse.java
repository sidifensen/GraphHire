package com.graphhire.job.interfaces.dto.response;

import java.util.ArrayList;
import java.util.List;

/**
 * 企业图谱响应
 */
public class CompanyGraphResponse {
    private Long companyId;
    private String companyName;
    private boolean graphAvailable;
    private List<CompanyGraphNodeResponse> nodes = new ArrayList<>();
    private List<CompanyGraphEdgeResponse> edges = new ArrayList<>();

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public boolean isGraphAvailable() {
        return graphAvailable;
    }

    public void setGraphAvailable(boolean graphAvailable) {
        this.graphAvailable = graphAvailable;
    }

    public List<CompanyGraphNodeResponse> getNodes() {
        return nodes;
    }

    public void setNodes(List<CompanyGraphNodeResponse> nodes) {
        this.nodes = nodes;
    }

    public List<CompanyGraphEdgeResponse> getEdges() {
        return edges;
    }

    public void setEdges(List<CompanyGraphEdgeResponse> edges) {
        this.edges = edges;
    }
}
