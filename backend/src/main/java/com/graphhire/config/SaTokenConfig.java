package com.graphhire.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token interceptor configuration.
 * Registers the Sa-Token authentication interceptor for protected endpoints.
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register Sa-Token interceptor for protected endpoints
        // Excludes public endpoints that don't require authentication
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
            .addPathPatterns("/**")
            .excludePathPatterns(
                // Auth endpoints - public
                "/auth/**",
                // Notification endpoints - some may be public
                "/notifications/**",
                // Skill tag endpoints - public read operations
                "/skill-tags/**",
                // Health check
                "/health",
                // Error endpoint
                "/error"
            );
    }
}
