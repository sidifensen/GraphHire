package com.graphhire.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 权限配置
 * 使用 Sa-Token interceptor 实现路由鉴权
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            // 基础登录校验
            StpUtil.checkLogin();
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
}
