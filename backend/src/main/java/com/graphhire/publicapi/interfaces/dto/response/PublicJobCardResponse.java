package com.graphhire.publicapi.interfaces.dto.response;

import java.util.List;

public record PublicJobCardResponse(
    Long id,
    Long companyId,
    String companyName,
    String title,
    String city,
    String district,
    Integer salaryMin,
    Integer salaryMax,
    String salaryUnit,
    List<String> requiredSkills
) {
}
