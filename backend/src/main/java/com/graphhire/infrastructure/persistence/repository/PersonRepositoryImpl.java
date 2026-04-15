package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.infrastructure.persistence.mapper.PersonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PersonRepositoryImpl implements PersonRepository {
    private final PersonMapper personMapper;

    @Override
    public Person findById(Long id) {
        return personMapper.selectById(id);
    }

    @Override
    public Optional<Person> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public Person findByUserId(Long userId) {
        return personMapper.selectOne(new LambdaQueryWrapper<Person>().eq(Person::getUserId, userId));
    }

    @Override
    public Optional<Person> findByUserIdOptional(Long userId) {
        return Optional.ofNullable(findByUserId(userId));
    }

    @Override
    public Person save(Person person) {
        if (person.getId() == null) {
            personMapper.insert(person);
        } else {
            personMapper.updateById(person);
        }
        return person;
    }

    @Override
    public List<Person> findAll() {
        return personMapper.selectList(null);
    }
}
