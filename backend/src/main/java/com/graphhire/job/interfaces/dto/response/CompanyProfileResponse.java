package com.graphhire.job.interfaces.dto.response;

public record CompanyProfileResponse(
        Long id,
        Long userId,
        String name,
        String unifiedSocialCreditCode,
        String authStatus,
        String licenseUrl,
        String contactName,
        String contactPhone,
        String contactEmail,
        String description,
        String website,
        String industry,
        String scale,
        String address,
        String avatarUrl
) {
}
