package com.graphhire.job.iface.dto.request;

public class StatusChangeRequest {
    private boolean publish;

    public boolean isPublish() {
        return publish;
    }

    public void setPublish(boolean publish) {
        this.publish = publish;
    }
}