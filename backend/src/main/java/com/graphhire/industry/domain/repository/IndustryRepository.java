package com.graphhire.industry.domain.repository;

import com.graphhire.industry.domain.model.Industry;

import java.util.List;
import java.util.Optional;

public interface IndustryRepository {
    String SORT_BY_NAME = "name";
    String SORT_BY_SORT_ORDER = "sortOrder";
    String SORT_BY_UPDATED_AT = "updatedAt";

    Optional<Industry> findById(Long id);
    Optional<Industry> findByName(String name);
    List<Industry> findAll();
    List<Industry> findByEnabled(Integer enabled);
    List<Industry> findAllOrdered(String sortBy, String sortDir);
    List<Industry> findByEnabledOrdered(Integer enabled, String sortBy, String sortDir);
    Industry save(Industry industry);
}
