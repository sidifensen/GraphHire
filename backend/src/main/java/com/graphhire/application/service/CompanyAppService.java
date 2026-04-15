package com.graphhire.application.service;

import com.graphhire.application.command.CreateStaffCmd;
import com.graphhire.application.command.UpdateCompanyProfileCmd;
import com.graphhire.application.dto.CompanyProfileResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.CompanyStaff;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyAppService {
    private final CompanyRepository companyRepository;
    private final CompanyStaffRepository companyStaffRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public CompanyProfileResponse getProfile(Long userId) {
        log.info("Getting company profile for userId: {}", userId);

        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return CompanyProfileResponse.builder()
                .id(company.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .companyName(company.getCompanyName())
                .unifiedSocialCreditCode(company.getUnifiedSocialCreditCode())
                .authStatus(company.getAuthStatus())
                .authTime(company.getAuthTime())
                .build();
    }

    @Transactional
    public void updateProfile(Long userId, UpdateCompanyProfileCmd cmd) {
        log.info("Updating company profile for userId: {}", userId);

        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        if (cmd.getCompanyName() != null) {
            company.setCompanyName(cmd.getCompanyName());
        }
        if (cmd.getLicensePath() != null) {
            company.setLicensePath(cmd.getLicensePath());
        }

        company.setUpdatedAt(LocalDateTime.now());
        companyRepository.save(company);

        log.info("Company profile updated successfully for userId: {}", userId);
    }

    public PageResult<Job> listJobs(Long userId, Integer page, Integer pageSize) {
        log.info("Listing jobs for userId: {}, page: {}, pageSize: {}", userId, page, pageSize);

        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        List<Job> jobs = jobRepository.findByCompanyId(company.getId(), page, pageSize);
        Long total = jobRepository.countByCompanyId(company.getId());

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<Job>builder()
                .records(jobs)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    @Transactional
    public void createStaff(Long ownerUserId, CreateStaffCmd cmd) {
        log.info("Creating staff for owner userId: {}, username: {}", ownerUserId, cmd.getUsername());

        // Verify owner is a company user
        User owner = userRepository.findByIdOptional(ownerUserId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (owner.getUserType() != UserType.COMPANY) {
            throw new RuntimeException("只有企业用户可以创建员工");
        }

        Company company = companyRepository.findByUserIdOptional(ownerUserId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        // Check if username already exists
        if (userRepository.existsByUsername(cmd.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // Create staff user
        User staffUser = User.builder()
                .username(cmd.getUsername())
                .password(cmd.getPassword())
                .email(cmd.getEmail())
                .userType(UserType.COMPANY)
                .status(1)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(staffUser);

        // Create company staff record
        CompanyStaff staff = CompanyStaff.builder()
                .companyId(company.getId())
                .userId(staffUser.getId())
                .post(cmd.getPost())
                .createdAt(LocalDateTime.now())
                .build();
        companyStaffRepository.save(staff);

        log.info("Staff created successfully: staffUserId={}", staffUser.getId());
    }

    public PageResult<CompanyStaff> listStaff(Long userId) {
        log.info("Listing staff for userId: {}", userId);

        Company company = companyRepository.findByUserIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("企业信息不存在"));

        List<CompanyStaff> staffList = companyStaffRepository.findByCompanyId(company.getId());

        return PageResult.<CompanyStaff>builder()
                .records(staffList)
                .total((long) staffList.size())
                .page(1)
                .pageSize(staffList.size())
                .totalPages(1)
                .build();
    }
}
