package com.graphhire.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI graphHireOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GraphHire API 文档")
                        .description("GraphHire 图谱智聘平台 API 文档\n\n" +
                                "## 认证说明\n" +
                                "- `[需认证]` - 需要登录的接口，请先在右上角设置 Authorization 全局请求头\n" +
                                "- `[公开]` - 无需登录的接口\n\n" +
                                "## 全局请求头\n" +
                                "在文档页面右上角设置 Authorization，格式: satoken-xxxxx")
                        .version("1.0.0")
                        .contact(new Contact().name("GraphHire Team")))
                .components(new Components()
                        .addSecuritySchemes("Authorization",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("satoken")));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("认证模块")
                .pathsToMatch("/auth/**", "/password/**")
                .build();
    }

    @Bean
    public GroupedOpenApi resumeApi() {
        return GroupedOpenApi.builder()
                .group("简历模块")
                .pathsToMatch("/person/**", "/resume/**")
                .build();
    }

    @Bean
    public GroupedOpenApi jobApi() {
        return GroupedOpenApi.builder()
                .group("职位模块")
                .pathsToMatch("/company/**", "/public/job/**", "/public/company/**")
                .build();
    }

    @Bean
    public GroupedOpenApi applicationApi() {
        return GroupedOpenApi.builder()
                .group("申请模块")
                .pathsToMatch("/person/application/**", "/company/application/**")
                .build();
    }

    @Bean
    public GroupedOpenApi matchApi() {
        return GroupedOpenApi.builder()
                .group("匹配模块")
                .pathsToMatch("/match/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("管理模块")
                .pathsToMatch("/admin/**", "/batch/**", "/category/**", "/skill-tag/**", "/notification/**")
                .build();
    }
}
