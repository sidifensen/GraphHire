package com.graphhire.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Person implements Serializable {
    private Long id;
    private Long userId;
    private String realName;
    private Integer gender;
    private Integer age;
    private String phone;
    private String education;
    private String city;
    private String targetCity;
    private Integer expectedSalary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
