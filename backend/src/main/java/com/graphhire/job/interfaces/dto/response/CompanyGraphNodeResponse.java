package com.graphhire.job.interfaces.dto.response;

/**
 * 企业图谱节点响应
 */
public class CompanyGraphNodeResponse {
    private String id;
    private String label;
    private String type;

    public CompanyGraphNodeResponse() {
    }

    public CompanyGraphNodeResponse(String id, String label, String type) {
        this.id = id;
        this.label = label;
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
