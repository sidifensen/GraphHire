package com.graphhire.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 权限配置
 * 使用 Sa-Token interceptor 实现路由鉴权和角色校验
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            // 基础登录校验
            StpUtil.checkLogin();

            // /admin/** 路径需要 ADMIN 角色
            String path = cn.dev33.satoken.context.SaHolder.getRequest().getUrl();
            if (path != null && path.startsWith("/admin")) {
                // 获取用户类型进行角色校验
                // 这里使用 StpUtil.getLoginId() 获取登录ID，然后从会话获取角色
                Object role = StpUtil.getSession().get("role");
                if (!"ADMIN".equals(role)) {
                    throw new cn.dev33.satoken.exception.NotPermissionException("无管理员权限");
                }
            }
        }))
        .addPathPatterns("/**")
        // 放行路径
        .excludePathPatterns(
            "/auth/**",
            "/notifications/**",
            "/skill-tags/**",
            "/health",
            "/error"
        );
    }
}
