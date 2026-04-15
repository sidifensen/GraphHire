package com.graphhire.application.service;

import com.graphhire.application.command.UpdateProfileCmd;
import com.graphhire.application.dto.PageResult;
import com.graphhire.application.dto.PersonProfileResponse;
import com.graphhire.application.dto.ResumeDetailResponse;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PersonAppService {
    private final PersonRepository personRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public PersonProfileResponse getProfile(Long userId) {
        log.info("Getting profile for userId: {}", userId);

        Person person = personRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("个人信息不存在"));

        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return PersonProfileResponse.builder()
                .id(person.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .realName(person.getRealName())
                .gender(person.getGender())
                .age(person.getAge())
                .phone(person.getPhone())
                .education(person.getEducation())
                .city(person.getCity())
                .targetCity(person.getTargetCity())
                .expectedSalary(person.getExpectedSalary())
                .build();
    }

    @Transactional
    public void updateProfile(Long userId, UpdateProfileCmd cmd) {
        log.info("Updating profile for userId: {}", userId);

        Person person = personRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("个人信息不存在"));

        if (cmd.getRealName() != null) {
            person.setRealName(cmd.getRealName());
        }
        if (cmd.getGender() != null) {
            person.setGender(cmd.getGender());
        }
        if (cmd.getAge() != null) {
            person.setAge(cmd.getAge());
        }
        if (cmd.getPhone() != null) {
            person.setPhone(cmd.getPhone());
        }
        if (cmd.getEducation() != null) {
            person.setEducation(cmd.getEducation());
        }
        if (cmd.getCity() != null) {
            person.setCity(cmd.getCity());
        }
        if (cmd.getTargetCity() != null) {
            person.setTargetCity(cmd.getTargetCity());
        }
        if (cmd.getExpectedSalary() != null) {
            person.setExpectedSalary(cmd.getExpectedSalary());
        }

        person.setUpdatedAt(LocalDateTime.now());
        personRepository.save(person);

        log.info("Profile updated successfully for userId: {}", userId);
    }

    public PageResult<Resume> listResumes(Long userId, Integer page, Integer pageSize) {
        log.info("Listing resumes for userId: {}, page: {}, pageSize: {}", userId, page, pageSize);

        List<Resume> resumes = resumeRepository.findByUserId(userId, page, pageSize);
        Long total = (long) resumeRepository.countByUserId(userId);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Resume>builder()
                .records(resumes)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    public ResumeDetailResponse getResumeDetail(Long resumeId) {
        log.info("Getting resume detail: resumeId={}", resumeId);

        Resume resume = resumeRepository.findByIdOptional(resumeId)
                .orElseThrow(() -> new RuntimeException("简历不存在"));

        return ResumeDetailResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileType(resume.getFileType())
                .parseStatus(resume.getParseStatus())
                .parseResult(resume.getParseResult())
                .confidence(resume.getConfidence())
                .isDefault(resume.getIsDefault())
                .createdAt(resume.getCreatedAt())
                .build();
    }
}
