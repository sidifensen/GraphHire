package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.PersonInfo;

import java.util.Optional;

public interface PersonInfoRepository {
    Optional<PersonInfo> findByUserId(Long userId);
    PersonInfo save(PersonInfo personInfo);
}
