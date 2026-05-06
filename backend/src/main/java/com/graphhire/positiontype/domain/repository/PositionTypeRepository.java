package com.graphhire.positiontype.domain.repository;

import com.graphhire.positiontype.domain.model.PositionType;

import java.util.List;
import java.util.Optional;

public interface PositionTypeRepository {
    Optional<PositionType> findById(Long id);

    List<PositionType> findAllNotDeletedOrdered();

    PositionType save(PositionType positionType);
}
