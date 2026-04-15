package com.graphhire.domain.repository;

import com.graphhire.domain.model.Person;

import java.util.List;
import java.util.Optional;

public interface PersonRepository {
    Person findById(Long id);
    Optional<Person> findByIdOptional(Long id);
    Person findByUserId(Long userId);
    Optional<Person> findByUserIdOptional(Long userId);
    Person save(Person person);
    List<Person> findAll();
}
