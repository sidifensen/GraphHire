package com.graphhire.auth.application.service;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.application.command.CompanyRegisterCmd;
import com.graphhire.auth.application.command.PersonRegisterCmd;
import com.graphhire.auth.application.command.SendVerifyCodeCmd;
import com.graphhire.auth.application.query.TokenValidateQuery;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
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
public class AuthAppService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StringRedisTemplate redisTemplate;

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
        // 步骤1：查询用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));

        // 步骤2：检查账号是否锁定
        if (user.isLocked()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("账号已锁定");
        }

        // 步骤3：校验密码
        if (!user.getPassword().matches(password)) {
            user.loginFailed();
            userRepository.save(user);
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("密码错误");
        }

        // 步骤4：登录成功，重置失败计数
        user.loginSuccess();
        userRepository.save(user);

        // 步骤5：Sa-Token 登录
        doLogin(user);

        // 步骤6：构建登录响应
        return buildLoginResponse(user);
    }

    /**
     * 个人用户注册
     * 【功能说明】创建个人用户账号，自动完成登录并返回认证 Token。
     * 【业务步骤】
     * 步骤1：检查用户名是否已存在
     * 步骤2：创建用户并设置类型为 PERSON
     * 步骤3：调用 User.register() 加密密码并发布注册事件
     * 步骤4：保存用户到数据库
     * 步骤5：执行 Sa-Token 登录
     * 步骤6：构建登录响应
     */
    public LoginResponse registerPerson(PersonRegisterCmd cmd) {
        // 步骤1：检查用户名是否已存在
        if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("用户已存在");
        }

        // 步骤2：创建用户并设置类型
        User user = new User();
        user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
        user.setUserType(UserType.PERSON);

        // 步骤3：注册（加密密码、设置状态、发布事件）
        user.register(cmd.getPassword());

        // 步骤4：保存用户
        userRepository.save(user);

        // 步骤5：Sa-Token 登录
        doLogin(user);

        // 步骤6：构建登录响应
        return buildLoginResponse(user);
    }

    /**
     * 企业用户注册
     * 【功能说明】创建企业用户账号，自动完成登录并返回认证 Token。
     * 【业务步骤】
     * 步骤1：检查用户名是否已存在
     * 步骤2：创建用户并设置类型为 COMPANY
     * 步骤3：调用 User.register() 加密密码并发布注册事件
     * 步骤4：保存用户到数据库
     * 步骤5：执行 Sa-Token 登录
     * 步骤6：构建登录响应
     */
    public LoginResponse registerCompany(CompanyRegisterCmd cmd) {
        // 步骤1：检查用户名是否已存在
        if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("用户已存在");
        }

        // 步骤2：创建用户并设置类型
        User user = new User();
        user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
        user.setUserType(UserType.COMPANY);

        // 步骤3：注册（加密密码、设置状态、发布事件）
        user.register(cmd.getPassword());

        // 步骤4：保存用户
        userRepository.save(user);

        // 步骤5：Sa-Token 登录
        doLogin(user);

        // 步骤6：构建登录响应
        return buildLoginResponse(user);
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
        sendVerifyCode(cmd.getUsername(), "default");
    }

    /**
     * 发送验证码
     * 【功能说明】生成6位数字验证码，存储到 Redis（15分钟有效期），并通过邮件发送。
     * 【业务步骤】
     * 步骤1：生成6位随机数字验证码
     * 步骤2：构造 Redis Key 并存储（15分钟过期）
     * 步骤3：调用邮件服务发送验证码（当前为打印到控制台）
     */
    public void sendVerifyCode(String username, String type) {
        // 步骤1：生成6位随机验证码
        String code = String.format("%06d", new Random().nextInt(999999));

        // 步骤2：存储到 Redis
        String key = "email_code:" + username + ":" + type;
        redisTemplate.opsForValue().set(key, code, 15, TimeUnit.MINUTES);

        // 步骤3：发送邮件（TODO: 接入真实邮件服务）
        System.out.println("Sending verification code " + code + " to " + username);
    }

    /**
     * 忘记密码
     * 【功能说明】根据用户名查询用户并发送验证码到对应邮箱。
     * 【业务步骤】
     * 步骤1：查询用户，不存在则抛异常
     * 步骤2：发送验证码
     */
    public void forgotPassword(String username) {
        // 步骤1：查询用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));

        // 步骤2：发送验证码
        sendVerifyCode(username, "forgot_password");
    }

    /**
     * 重置密码
     * 【功能说明】通过邮箱验证码重置用户密码。
     * 【业务步骤】
     * 步骤1：校验验证码有效性
     * 步骤2：删除已使用的验证码
     * 步骤3：查询用户并更新密码
     */
    public void resetPassword(String username, String code, String newPassword) {
        // 步骤1：校验验证码
        String key = "email_code:" + username + ":forgot_password";
        String storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode == null || !storedCode.equals(code)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码错误或已过期");
        }

        // 步骤2：删除已使用的验证码
        redisTemplate.delete(key);

        // 步骤3：查询用户并更新密码
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));
        user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(newPassword));
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

    /** 执行 Sa-Token 登录，存储用户类型到 Session */
    private void doLogin(User user) {
        StpUtil.login(user.getId());
        StpUtil.getSession().set("role", user.getUserType().name());
        StpUtil.getSession().set("userType", user.getUserType().name());
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
}