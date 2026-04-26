package com.graphhire.auth.application.service;

import cn.hutool.core.lang.Validator;
import cn.hutool.core.util.RandomUtil;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.auth.application.command.CompanyRegisterCmd;
import com.graphhire.auth.application.command.PersonRegisterCmd;
import com.graphhire.auth.application.command.SendVerifyCodeCmd;
import com.graphhire.auth.application.query.TokenValidateQuery;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.infrastructure.mail.MailService;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.MailException;

import java.util.concurrent.CompletableFuture;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * 认证应用服务
 *
 * 【模块说明】处理用户认证相关的业务逻辑，包括登录、注册、Token 管理、密码重置等功能。
 *
 * 【数据来源】
 * - UserRepository：用户数据访问
 * - StringRedisTemplate：验证码和 Token 的 Redis 存储
 *
 * 【方法概览】
 * - login()：用户登录
 * - registerPerson()：个人用户注册
 * - registerCompany()：企业用户注册
 * - adminLogin()：管理员登录
 * - sendVerifyCode()：发送验证码
 * - forgotPassword()：忘记密码
 * - resetPassword()：重置密码
 * - validateToken()：校验 Token
 * - logout()：登出
 * - refreshToken()：刷新 Token
 */
@Service
@Slf4j
public class AuthAppService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CompanyStaffRepository companyStaffRepository;

    private static final int MAX_LOGIN_ATTEMPTS = 20;
    private static final int MAX_VERIFY_CODE_SEND_PER_HOUR = 10;
    private static final int MAX_FAILED_LOGIN_BEFORE_LOCK = 5;
    private static final int ACCOUNT_LOCK_MINUTES = 15;

    // =====================================================
    // 【第一部分】登录与注册
    // =====================================================

    /**
     * 用户登录
     * 【功能说明】验证用户凭据，执行 Sa-Token 登录，返回认证 Token。
     *            包含密码校验、登录失败计数、账号锁定检查。
     * 【业务步骤】
     * 步骤1：查询用户，不存在则抛异常
     * 步骤2：检查账号是否已锁定
     * 步骤3：校验密码，失败则记录并抛异常
     * 步骤4：登录成功，重置失败计数
     * 步骤5：执行 Sa-Token 登录，存储用户类型到 Session
     * 步骤6：构建登录响应（token、userType）
     */
    public LoginResponse login(String username, String password) {
        enforceLoginThrottle(username);
        // 步骤1：查询用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    recordLoginFailure(username);
                    return com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在");
                });

        // 步骤2：检查账号是否锁定
        if (isAccountLocked(username) || user.isLocked()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("账号已锁定");
        }

        // 步骤3：校验密码
        if (!user.getPassword().matches(password)) {
            user.loginFailed();
            userRepository.save(user);
            recordLoginFailure(username);
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("密码错误");
        }

        // 步骤4：登录成功，重置失败计数
        user.loginSuccess();
        userRepository.save(user);
        clearLoginThrottle(username);

        ensureCompanyUserCanLogin(user);

        // 步骤5：Sa-Token 登录
        doLogin(user);

        // 步骤6：构建登录响应
        return buildLoginResponse(user);
    }

    /**
     * 个人用户注册
     * 【功能说明】创建个人用户账号，自动完成登录并返回认证 Token。
     * 【业务步骤】
     * 步骤1：校验验证码
     * 步骤2：检查用户名是否已存在
     * 步骤3：创建用户并设置类型为 PERSON
     * 步骤4：调用 User.register() 加密密码并发布注册事件
     * 步骤5：保存用户到数据库
     * 步骤6：执行 Sa-Token 登录
     * 步骤7：构建登录响应
     */
    public LoginResponse registerPerson(PersonRegisterCmd cmd) {
        // 步骤1：校验验证码
        validateVerifyCode(cmd.getUsername(), cmd.getVerifyCode(), "register");

        // 步骤2：检查用户名是否已存在
        if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("用户已存在");
        }

        // 步骤3：创建用户并设置类型
        User user = new User();
        user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
        user.setUserType(UserType.PERSON);

        // 步骤4：注册（加密密码、设置状态、发布事件）
        user.register(cmd.getPassword());

        // 步骤5：保存用户
        userRepository.save(user);

        // 步骤6：Sa-Token 登录
        doLogin(user);

        // 步骤7：构建登录响应
        return buildLoginResponse(user);
    }

    /**
     * 企业用户注册
     * 【功能说明】创建企业用户账号，自动完成登录并返回认证 Token。
     * 【业务步骤】
     * 步骤1：校验验证码
     * 步骤2：检查用户名是否已存在
     * 步骤3：创建用户并设置类型为 COMPANY
     * 步骤4：调用 User.register() 加密密码并发布注册事件
     * 步骤5：保存用户到数据库
     * 步骤6：执行 Sa-Token 登录
     * 步骤7：构建登录响应
     */
    @Transactional(noRollbackFor = Exceptions.BusinessException.class)
    public LoginResponse registerCompany(CompanyRegisterCmd cmd) {
        // 步骤1：校验验证码
        validateVerifyCode(cmd.getUsername(), cmd.getVerifyCode(), "register");

        // 步骤2：检查用户名是否已存在
        if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("用户已存在");
        }

        // 步骤3：创建用户并设置类型
        User user = new User();
        user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
        user.setUserType(UserType.COMPANY);

        // 步骤4：注册（加密密码、设置状态、发布事件）
        user.register(cmd.getPassword());

        // 步骤5：保存用户
        userRepository.save(user);

        Optional<Company> existingCompany = companyRepository.findByName(cmd.getCompanyName());
        Company company = existingCompany.orElseGet(() -> {
            Company created = new Company();
            created.setUserId(user.getId());
            created.setName(cmd.getCompanyName());
            created.setUnifiedSocialCreditCode(cmd.getUnifiedSocialCreditCode());
            created.setAuthStatus(AuthStatus.PENDING_VERIFY);
            return companyRepository.save(created);
        });

        CompanyStaff staff = new CompanyStaff();
        staff.setCompanyId(company.getId());
        staff.setUserId(user.getId());
        boolean isFirstForCompany = existingCompany.isEmpty();
        staff.setPost(isFirstForCompany ? CompanyStaff.POST_OWNER : CompanyStaff.POST_HR);
        staff.setStatus(isFirstForCompany ? CompanyStaff.STATUS_ACTIVE : CompanyStaff.STATUS_PENDING_JOIN);
        companyStaffRepository.save(staff);

        if (!isFirstForCompany) {
            throw Exceptions.BusinessException.of(20201, "已提交申请，等待企业负责人确认");
        }

        throw Exceptions.BusinessException.of(20205, "该公司正在审核中，暂不可进入企业端");

        // 步骤6：Sa-Token 登录
//        doLogin(user);
//
//        // 步骤7：构建登录响应
//        return buildLoginResponse(user);
    }

    /**
     * 管理员登录
     * 【功能说明】验证管理员凭据，执行 Sa-Token 登录，返回认证 Token。
     * 【业务步骤】
     * 步骤1：查询用户，不存在则抛异常
     * 步骤2：检查账号是否已锁定
     * 步骤3：验证是否为管理员账号
     * 步骤4：校验密码，失败则记录并抛异常
     * 步骤5：登录成功，重置失败计数
     * 步骤6：执行 Sa-Token 登录
     * 步骤7：构建登录响应
     */
    public LoginResponse adminLogin(String username, String password) {
        // 步骤1：查询用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));

        // 步骤2：检查账号是否锁定
        if (user.isLocked()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("账号已锁定");
        }

        // 步骤3：验证管理员身份
        if (user.getUserType() != UserType.ADMIN) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("非管理员账号");
        }

        // 步骤4：校验密码
        if (!user.getPassword().matches(password)) {
            user.loginFailed();
            userRepository.save(user);
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("密码错误");
        }

        // 步骤5：登录成功，重置失败计数
        user.loginSuccess();
        userRepository.save(user);

        // 步骤6：Sa-Token 登录
        doLogin(user);

        // 步骤7：构建登录响应
        return buildLoginResponse(user);
    }

    // =====================================================
    // 【第二部分】验证码与密码重置
    // =====================================================

    /**
     * 发送验证码
     * 【功能说明】向指定邮箱发送验证码，用于注册或找回密码。
     * @param cmd 发送验证码命令
     */
    public void sendVerifyCode(SendVerifyCodeCmd cmd) {
        // 直接调用重载方法，使用默认类型
        sendVerifyCode(cmd.getUsername(), "default");
    }

    /**
     * 发送验证码
     * 【功能说明】生成6位数字验证码，存储到 Redis（15分钟有效期），并通过邮件发送。
     * 【业务步骤】
     * 步骤1：生成6位随机数字验证码
     * 步骤2：构造 Redis Key 并存储（15分钟过期）
     * 步骤3：调用邮件服务发送验证码
     */
    public void sendVerifyCode(String username, String type) {
        if (!Validator.isEmail(username)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("邮箱格式不正确");
        }
        if (!"register".equals(type) && !"forgot_password".equals(type) && !"default".equals(type)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码类型不支持");
        }
        if (!enforceVerifyCodeThrottle(username, type)) {
            log.info("发送验证码重复请求，冷却期内直接返回成功: to={}, type={}", maskEmail(username), type);
            return;
        }

        // 步骤1：生成6位随机验证码
        String code = RandomUtil.randomNumbers(6);

        // 步骤2：存储到 Redis（15分钟过期）
        String key = "email_code:" + username + ":" + type;
        redisTemplate.opsForValue().set(key, code, 15, TimeUnit.MINUTES);

        // 步骤3：发送邮件
        String subject = "【GraphHire】您的验证码";
        String content = "您的验证码是：" + code + "，15分钟内有效，请勿泄露给他人。";
        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendVerifyCodeMail(username, subject, content);
                log.info("发送验证码成功: to={}, type={}", maskEmail(username), type);
            } catch (MailException e) {
                redisTemplate.delete(key);
                rollbackVerifyCodeThrottle(username, type);
                log.warn("发送验证码失败: to={}, type={}, reason={}", maskEmail(username), type, e.getMessage());
            }
        });
    }

    /**
     * 忘记密码（重置密码）
     * 【功能说明】通过邮箱验证码重置用户密码。
     * 【业务步骤】
     * 步骤1：校验验证码有效性
     * 步骤2：查询用户并更新密码
     */
    public void forgotPassword(String username, String verifyCode, String newPassword) {
        // 步骤0：校验邮箱格式
        if (!Validator.isEmail(username)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("邮箱格式不正确");
        }
        // 步骤1：校验验证码
        validateVerifyCode(username, verifyCode, "forgot_password");

        // 步骤2：查询用户并更新密码
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));
        user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * 重置密码
     * 【功能说明】通过邮箱验证码重置用户密码（独立接口）。
     * 【业务步骤】
     * 步骤1：校验邮箱格式
     * 步骤2：校验验证码
     * 步骤3：查询用户并更新密码
     */
    public void resetPassword(String email, String code, String newPassword) {
        // 步骤1：校验邮箱格式
        if (!Validator.isEmail(email)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("邮箱格式不正确");
        }
        // 步骤2：校验验证码
        validateVerifyCode(email, code, "forgot_password");

        // 步骤3：查询用户并更新密码
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));
        user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * 修改密码
     * 【功能说明】已登录用户修改密码，需验证旧密码后才能更新。
     * 【业务步骤】
     * 步骤1：查询当前用户，不存在则抛异常
     * 步骤2：校验旧密码，失败则抛异常
     * 步骤3：更新为新密码（BCrypt加密）
     * 步骤4：保存用户
     */
    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        // 步骤1：查询当前用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));

        // 步骤2：校验旧密码
        if (!user.getPassword().matches(oldPassword)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("旧密码错误");
        }

        // 步骤3：更新为新密码
        user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(newPassword));

        // 步骤4：保存用户
        userRepository.save(user);
    }

    // =====================================================
    // 【第三部分】Token 管理
    // =====================================================

    /**
     * 验证 Token
     * 【功能说明】验证用户 Token 的有效性，返回用户信息。
     * @param query Token 验证查询参数
     * @return 验证结果（有效返回用户信息，无效返回 null）
     */
    public boolean validateToken(TokenValidateQuery query) {
        return validateToken(query.getToken());
    }

    /**
     * 校验 Token 是否有效
     * 【功能说明】通过 Sa-Token 解析 Token 获取 loginId 来校验有效性。
     * @param token 待校验的 Token
     * @return true 表示有效，false 表示无效
     */
    public boolean validateToken(String token) {
        // Sa-Token 1.45.0: 通过 Token 解析 loginId 来校验
        try {
            Object loginId = StpUtil.getLoginIdByToken(token);
            return loginId != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 用户登出
     * 【功能说明】执行用户登出操作，注销当前会话。
     * @param userId 用户ID
     */
    public void logout(Long userId) {
        StpUtil.logout(userId);
    }

    /**
     * 刷新 Token
     * 【功能说明】使用 refresh token 重新生成登录 Token，实现无感知续期。
     * 【业务步骤】
     * 步骤1：根据 refresh token 查找 userId
     * 步骤2：查询用户，不存在则抛异常
     * 步骤3：先登出旧 token
     * 步骤4：重新执行登录
     * 步骤5：返回新的登录响应
     */
    public LoginResponse refreshToken(String refreshToken) {
        // 步骤1：根据 refresh token 查找 userId
        Long userId = findUserIdByRefreshToken(refreshToken);
        if (userId == null) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("Refresh token 无效或已过期");
        }

        // 步骤2：查询用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));

        // 步骤3：先登出旧 token
        StpUtil.logout(userId);

        // 步骤4：重新登录
        doLogin(user);

        // 步骤5：返回新的登录响应
        return buildLoginResponse(user);
    }

    // =====================================================
    // 【第四部分】私有辅助方法
    // =====================================================

    /**
     * 校验邮箱验证码
     * @param username 邮箱
     * @param code 用户输入的验证码
     * @param type 验证码类型（register/forgot_password）
     */
    private void validateVerifyCode(String username, String code, String type) {
        if (code == null || code.isBlank()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码不能为空");
        }
        String key = "email_code:" + username + ":" + type;
        String storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode == null || !storedCode.equals(code)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码错误或已过期");
        }
        // 验证成功后删除验证码（一次性使用）
        redisTemplate.delete(key);
    }

    /** 执行 Sa-Token 登录，存储用户类型到 Session */
    private void doLogin(User user) {
        StpUtil.login(user.getId());
        StpUtil.getSession().set("role", user.getUserType().name());
        StpUtil.getSession().set("userType", user.getUserType().name());
    }

    private void ensureCompanyUserCanLogin(User user) {
        if (user.getUserType() != UserType.COMPANY) {
            return;
        }
        CompanyStaff staff = companyStaffRepository.findByUserId(user.getId())
                .orElseThrow(() -> Exceptions.BusinessException.of("企业账号未绑定企业成员关系"));
        String status = staff.getStatus();
        if (StrUtil.isBlank(status)) {
            return;
        }
        if (CompanyStaff.STATUS_PENDING_JOIN.equalsIgnoreCase(status)) {
            throw Exceptions.BusinessException.of(20202, "账号审核中，暂未开通，请等待企业负责人确认");
        }
        if (CompanyStaff.STATUS_REJECTED.equalsIgnoreCase(status)) {
            throw Exceptions.BusinessException.of(20203, "加入申请已被拒绝，请联系企业负责人");
        }
        if (CompanyStaff.STATUS_DISABLED.equalsIgnoreCase(status)) {
            throw Exceptions.BusinessException.of(20204, "账号已被企业停用，请联系企业负责人");
        }
        if (!CompanyStaff.STATUS_ACTIVE.equalsIgnoreCase(status)) {
            throw Exceptions.BusinessException.of("企业账号状态异常，暂不可登录");
        }

        Company company = companyRepository.findById(staff.getCompanyId())
                .orElseThrow(() -> Exceptions.BusinessException.of("企业不存在"));
        if (AuthStatus.PENDING_VERIFY.equals(company.getAuthStatus())) {
            throw Exceptions.BusinessException.of(20205, "该公司正在审核中，暂不可进入企业端");
        }
        if (AuthStatus.REJECTED.equals(company.getAuthStatus())) {
            throw Exceptions.BusinessException.of(20206, "该公司审核未通过，暂不可进入企业端");
        }
    }

    /** 构建登录响应，包含 Token、过期时间、用户类型 */
    private LoginResponse buildLoginResponse(User user) {
        String token = StpUtil.getTokenValue();
        return new LoginResponse(token, null, 86400L, user.getUserType(), user.getId());
    }

    /** 根据 refresh token 查找 userId，从 Redis 中读取 `satoken:refresh:{refreshToken}` */
    private Long findUserIdByRefreshToken(String refreshToken) {
        String key = "satoken:refresh:" + refreshToken;
        String userId = redisTemplate.opsForValue().get(key);
        return userId != null ? Long.parseLong(userId) : null;
    }

    private boolean enforceVerifyCodeThrottle(String username, String type) {
        String cooldownKey = "auth:verify:cooldown:" + username + ":" + type;
        Boolean firstRequest = redisTemplate.opsForValue().setIfAbsent(cooldownKey, "1", 60, TimeUnit.SECONDS);
        if (Boolean.FALSE.equals(firstRequest)) {
            return false;
        }

        String hourLimitKey = "auth:verify:hourly:" + username + ":" + type;
        Long count = redisTemplate.opsForValue().increment(hourLimitKey);
        if (count != null && count == 1) {
            redisTemplate.expire(hourLimitKey, 1, TimeUnit.HOURS);
        }
        if (count != null && count > MAX_VERIFY_CODE_SEND_PER_HOUR) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码发送过于频繁，请1小时后再试");
        }
        return true;
    }

    private void rollbackVerifyCodeThrottle(String username, String type) {
        String cooldownKey = "auth:verify:cooldown:" + username + ":" + type;
        String hourLimitKey = "auth:verify:hourly:" + username + ":" + type;

        redisTemplate.delete(cooldownKey);
        Long count = redisTemplate.opsForValue().decrement(hourLimitKey);
        if (count != null && count <= 0) {
            redisTemplate.delete(hourLimitKey);
        }
    }

    private void enforceLoginThrottle(String username) {
        if (StrUtil.isBlank(username)) {
            return;
        }
        String attemptsKey = "auth:login:attempt:" + username;
        String lockKey = "auth:login:lock:" + username;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("账号已锁定");
        }
        String attempts = redisTemplate.opsForValue().get(attemptsKey);
        if (attempts == null) {
            return;
        }
        try {
            if (Integer.parseInt(attempts) >= MAX_LOGIN_ATTEMPTS) {
                throw com.graphhire.common.vo.Exceptions.BusinessException.of("登录尝试过于频繁，请稍后再试");
            }
        } catch (NumberFormatException ignored) {
            redisTemplate.delete(attemptsKey);
        }
    }

    private void recordLoginFailure(String username) {
        if (StrUtil.isBlank(username)) {
            return;
        }
        String attemptsKey = "auth:login:attempt:" + username;
        Long count = redisTemplate.opsForValue().increment(attemptsKey);
        if (count != null && count == 1) {
            redisTemplate.expire(attemptsKey, ACCOUNT_LOCK_MINUTES, TimeUnit.MINUTES);
        }
        if (count != null && count >= MAX_FAILED_LOGIN_BEFORE_LOCK) {
            String lockKey = "auth:login:lock:" + username;
            redisTemplate.opsForValue().set(lockKey, String.valueOf(System.currentTimeMillis()), ACCOUNT_LOCK_MINUTES, TimeUnit.MINUTES);
        }
    }

    private void clearLoginThrottle(String username) {
        if (StrUtil.isBlank(username)) {
            return;
        }
        redisTemplate.delete("auth:login:attempt:" + username);
        redisTemplate.delete("auth:login:lock:" + username);
    }

    private boolean isAccountLocked(String username) {
        if (StrUtil.isBlank(username)) {
            return false;
        }
        return Boolean.TRUE.equals(redisTemplate.hasKey("auth:login:lock:" + username));
    }

    private String maskEmail(String email) {
        if (!Validator.isEmail(email)) {
            return "***";
        }
        int at = email.indexOf("@");
        if (at <= 2) {
            return "***" + email.substring(at);
        }
        return email.substring(0, 2) + "***" + email.substring(at);
    }
}
