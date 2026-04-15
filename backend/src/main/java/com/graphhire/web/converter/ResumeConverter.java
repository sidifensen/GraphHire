package com.graphhire.web.converter;

import com.graphhire.domain.model.Resume;
import com.graphhire.web.dto.response.ResumeDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResumeConverter {
    public ResumeDetailResponse toDetailResponse(Resume resume) {
        if (resume == null) {
            return null;
        }
        ResumeDetailResponse response = new ResumeDetailResponse();
        response.setId(resume.getId());
        response.setFileName(resume.getFileName());
        response.setFileType(resume.getFileType());
        response.setFileSize(resume.getFileSize());
        response.setParseStatus(resume.getParseStatus() != null ? resume.getParseStatus().getCode() : null);
        response.setParseResult(resume.getParseResult());
        response.setConfidence(resume.getConfidence());
        response.setIsDefault(resume.getIsDefault());
        response.setCreatedAt(resume.getCreatedAt());
        response.setUpdatedAt(resume.getUpdatedAt());
        return response;
    }
}
