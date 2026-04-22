package com.graphhire.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.common.vo.Exceptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 权限配置
 * 使用 Sa-Token interceptor 实现路由鉴权
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            // 浏览器跨域预检请求直接放行，避免前端真实接口在 OPTIONS 阶段被拦截成 Network Error
            if (!"OPTIONS".equalsIgnoreCase(SaHolder.getRequest().getMethod())) {
                StpUtil.checkLogin();
                checkRoleForPath(SaHolder.getRequest().getRequestPath());
            }
        }))
        .addPathPatterns("/**")
        // 放行路径
        .excludePathPatterns(
            "/auth/**",
            "/admin/login",
            "/notifications/**",
            "/skill-tags/**",
            "/public/**",
            "/health",
            "/actuator/**",
            "/error",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/doc.html",
            "/webjars/**"
        );
    }

    private void checkRoleForPath(String path) {
        if (path == null) {
            return;
        }
        if (path.startsWith("/admin/")) {
            ensureCurrentUserType(UserType.ADMIN);
            return;
        }
        if (path.startsWith("/company/")) {
            ensureCurrentUserType(UserType.COMPANY);
        }
    }

    private void ensureCurrentUserType(UserType expectedType) {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exceptions.UnauthorizedException("登录用户不存在"));
        if (user.getUserType() != expectedType) {
            throw new Exceptions.ForbiddenException("无权访问该资源");
        }
    }
}
