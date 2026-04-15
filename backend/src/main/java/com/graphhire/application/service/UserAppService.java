package com.graphhire.application.service;

import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAppService {
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final CompanyRepository companyRepository;

    public User getUserById(Long id) {
        return userRepository.findByIdOptional(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsernameOptional(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public void updateUserStatus(Long userId, Integer status) {
        log.info("Updating user status: userId={}, status={}", userId, status);

        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setStatus(status);
        userRepository.save(user);

        log.info("User status updated successfully");
    }

    public PageResult<User> listUsers(UserType userType, Integer page, Integer pageSize) {
        log.info("Listing users: userType={}, page={}, pageSize={}", userType, page, pageSize);

        List<User> users = userRepository.findByUserType(userType, page, pageSize);
        Long total = userRepository.countByUserType(userType);

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<User>builder()
                .records(users)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }
}
