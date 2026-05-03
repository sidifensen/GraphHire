package com.graphhire.publicapi.interfaces.dto.response;

public record PublicCompanyCardResponse(
    Long id,
    String name,
    String city,
    Integer jobCount,
    String summary,
    String authStatus,
    String avatarUrl,
    Long industryId,
    String industryName,
    String scale
) {
}
