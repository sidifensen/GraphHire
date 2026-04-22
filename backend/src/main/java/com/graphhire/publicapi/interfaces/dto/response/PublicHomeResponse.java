package com.graphhire.publicapi.interfaces.dto.response;

import java.util.List;

public record PublicHomeResponse(
    List<PublicJobCardResponse> featuredJobs,
    List<PublicCompanyCardResponse> popularCompanies,
    List<String> hotCities
) {
}
