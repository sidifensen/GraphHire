package com.graphhire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * GraphHire 应用启动类
 * 【模块说明】基于Spring Boot的主入口类，启动整个招聘平台后端服务
 */
@SpringBootApplication
public class GraphHireApplication {

    /**
     * 应用启动入口
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(GraphHireApplication.class, args);
    }
}
