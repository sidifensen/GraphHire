package com.graphhire.publicapi.interfaces.dto.response;

public record PublicHotSearchItemResponse(
        String keyword,
        Double score
) {
}

