package com.graphhire.publicapi.interfaces.dto.response;

public record PublicCompanyCardResponse(
    Long id,
    String name,
    String city,
    Integer jobCount,
    String summary,
    String description,
    String address,
    String authStatus,
    String avatarUrl,
    Long industryId,
    String industryName,
    String scale,
    String unifiedSocialCreditCode,
    String contactName,
    String contactPhone
) {
}
