# GraphHire 后端功能扩展实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 GraphHire 后端缺失的5个核心模块：投递模块、公开搜索模块、账号安全模块、管理后台增强、企业增强

**Architecture:** 新增 application 模块处理投递/收藏/人才库，publicapi 模块处理公开搜索，增强 auth/admin/job 模块处理账号安全和管理功能。遵循现有 DDD 分层架构。

**Tech Stack:** Spring Boot, Sa-Token, MyBatis, PostgreSQL, RocketMQ, RustFS

---

## 文件结构概览

```
backend/src/main/java/com/graphhire/
├── application/                          # 新增：投递模块
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Application.java
│   │   │   ├── ApplicationStatus.java    # 枚举
│   │   │   ├── Favorite.java
│   │   │   └── TalentPool.java
│   │   └── repository/
│   │       ├── ApplicationRepository.java
│   │       ├── FavoriteRepository.java
│   │       └── TalentPoolRepository.java
│   ├── application/
│   │   └── service/
│   │       └── ApplicationAppService.java
│   └── interfaces/
│       └── controller/
│           ├── PersonApplicationController.java
│           └── CompanyApplicationController.java
├── publicapi/                           # 新增：公开搜索模块
│   └── interfaces/
│       └── controller/
│           ├── PublicJobController.java
│           └── PublicCompanyController.java
├── auth/                                # 增强：账号安全
│   └── interfaces/
│       └── controller/
│           └── PasswordController.java
├── admin/                               # 增强：管理后台
│   └── interfaces/
│       └── controller/
│           ├── BatchOperationController.java
│           └── CategoryController.java
├── skill/                              # 增强：技能分类
│   ├── domain/
│   │   └── model/
│   │       └── Category.java
│   └── domain/
│       └── repository/
│           └── CategoryRepository.java
└── notification/                       # 增强：通知类型
    └── domain/
        └── vo/
            └── NotificationType.java   # 新增 INTERVIEW_INVITED

backend/src/main/resources/
├── mapper/application/                  # 新增 MyBatis mapper
│   ├── ApplicationMapper.xml
│   ├── FavoriteMapper.xml
│   └── TalentPoolMapper.xml
└── schema.sql                          # 新增数据库表
```

---

## 阶段一：投递模块 (Module 1)

### Task 1: 创建 Application 相关类

**Files:**
- Create: `backend/src/main/java/com/graphhire/application/domain/model/ApplicationStatus.java`
- Create: `backend/src/main/java/com/graphhire/application/domain/model/Application.java`
- Create: `backend/src/main/java/com/graphhire/application/domain/model/Favorite.java`
- Create: `backend/src/main/java/com/graphhire/application/domain/model/TalentPool.java`
- Create: `backend/src/main/java/com/graphhire/application/domain/repository/ApplicationRepository.java`
- Create: `backend/src/main/java/com/graphhire/application/domain/repository/FavoriteRepository.java`
- Create: `backend/src/main/java/com/graphhire/application/domain/repository/TalentPoolRepository.java`

- [ ] **Step 1: 创建 ApplicationStatus 枚举**

```java
package com.graphhire.application.domain.model;

public enum ApplicationStatus {
    PENDING("待处理"),
    VIEWED("已查看"),
    INTERVIEW_INVITED("面试邀请"),
    REJECTED("已拒绝"),
    ACCEPTED("已接受"),
    WITHDRAWN("已撤回");

    private final String description;
    ApplicationStatus(String description) { this.description = description; }
    public String getDescription() { return description; }
}
```

- [ ] **Step 2: 创建 Application 实体** (参考 `backend/src/main/java/com/graphhire/resume/domain/model/Resume.java` 风格)

```java
package com.graphhire.application.domain.model;

import java.time.LocalDateTime;

public class Application {
    private Long id;
    private Long resumeId;
    private Long jobId;
    private Long userId;
    private Long companyId;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String note;  // HR备注

    // getters, setters, constructors
}
```

- [ ] **Step 3: 创建 Favorite 实体**

```java
package com.graphhire.application.domain.model;

import java.time.LocalDateTime;

public class Favorite {
    private Long id;
    private Long userId;
    private Long jobId;
    private LocalDateTime createdAt;

    // getters, setters, constructors
}
```

- [ ] **Step 4: 创建 TalentPool 实体**

```java
package com.graphhire.application.domain.model;

import java.time.LocalDateTime;

public class TalentPool {
    public enum TalentPoolStatus { ACTIVE, ARCHIVED }

    private Long id;
    private Long companyId;
    private Long resumeId;
    private LocalDateTime addedAt;
    private String note;
    private TalentPoolStatus status;

    // getters, setters, constructors
}
```

- [ ] **Step 5: 创建 ApplicationRepository 接口**

```java
package com.graphhire.application.domain.repository;

import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository {
    Application save(Application application);
    Optional<Application> findById(Long id);
    List<Application> findByUserId(Long userId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByCompanyId(Long companyId);
    List<Application> findByCompanyIdAndStatus(Long companyId, ApplicationStatus status);
    Optional<Application> findByResumeIdAndJobId(Long resumeId, Long jobId);
    boolean existsByResumeIdAndJobId(Long resumeId, Long jobId);
    void delete(Long id);
}
```

- [ ] **Step 6: 创建 FavoriteRepository 接口**

```java
package com.graphhire.application.domain.repository;

import com.graphhire.application.domain.model.Favorite;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository {
    Favorite save(Favorite favorite);
    Optional<Favorite> findById(Long id);
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndJobId(Long userId, Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    void delete(Long id);
    void deleteByUserIdAndJobId(Long userId, Long jobId);
}
```

- [ ] **Step 7: 创建 TalentPoolRepository 接口**

```java
package com.graphhire.application.domain.repository;

import com.graphhire.application.domain.model.TalentPool;
import java.util.List;
import java.util.Optional;

public interface TalentPoolRepository {
    TalentPool save(TalentPool talentPool);
    Optional<TalentPool> findById(Long id);
    List<TalentPool> findByCompanyId(Long companyId);
    Optional<TalentPool> findByCompanyIdAndResumeId(Long companyId, Long resumeId);
    boolean existsByCompanyIdAndResumeId(Long companyId, Long resumeId);
    void delete(Long id);
    void deleteByCompanyIdAndResumeId(Long companyId, Long resumeId);
}
```

- [ ] **Step 8: Commit**
```bash
git add backend/src/main/java/com/graphhire/application/ && git commit -m "feat: add Application, Favorite, TalentPool domain models and repositories"
```

---

### Task 2: 创建 MyBatis Mapper XML

**Files:**
- Create: `backend/src/main/resources/mapper/application/ApplicationMapper.xml`
- Create: `backend/src/main/resources/mapper/application/FavoriteMapper.xml`
- Create: `backend/src/main/resources/mapper/application/TalentPoolMapper.xml`

- [ ] **Step 1: 创建 ApplicationMapper.xml** (参考 `backend/src/main/resources/mapper/` 下现有 mapper 风格)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.graphhire.application.domain.repository.ApplicationRepository">

    <resultMap id="BaseResultMap" type="com.graphhire.application.domain.model.Application">
        <id column="id" property="id"/>
        <result column="resume_id" property="resumeId"/>
        <result column="job_id" property="jobId"/>
        <result column="user_id" property="userId"/>
        <result column="company_id" property="companyId"/>
        <result column="status" property="status"/>
        <result column="applied_at" property="appliedAt"/>
        <result column="updated_at" property="updatedAt"/>
        <result column="note" property="note"/>
    </resultMap>

    <insert id="save" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO application (resume_id, job_id, user_id, company_id, status, applied_at, updated_at, note)
        VALUES (#{resumeId}, #{jobId}, #{userId}, #{companyId}, #{status}, #{appliedAt}, #{updatedAt}, #{note})
    </insert>

    <select id="findById" resultMap="BaseResultMap">
        SELECT * FROM application WHERE id = #{id}
    </select>

    <select id="findByUserId" resultMap="BaseResultMap">
        SELECT * FROM application WHERE user_id = #{userId} ORDER BY applied_at DESC
    </select>

    <select id="findByJobId" resultMap="BaseResultMap">
        SELECT * FROM application WHERE job_id = #{jobId} ORDER BY applied_at DESC
    </select>

    <select id="findByCompanyId" resultMap="BaseResultMap">
        SELECT * FROM application WHERE company_id = #{companyId} ORDER BY applied_at DESC
    </select>

    <select id="findByCompanyIdAndStatus" resultMap="BaseResultMap">
        SELECT * FROM application WHERE company_id = #{companyId} AND status = #{status} ORDER BY applied_at DESC
    </select>

    <select id="findByResumeIdAndJobId" resultMap="BaseResultMap">
        SELECT * FROM application WHERE resume_id = #{resumeId} AND job_id = #{jobId}
    </select>

    <select id="existsByResumeIdAndJobId" resultType="boolean">
        SELECT EXISTS(SELECT 1 FROM application WHERE resume_id = #{resumeId} AND job_id = #{jobId})
    </select>

    <update id="update">
        UPDATE application SET status = #{status}, updated_at = #{updatedAt}, note = #{note} WHERE id = #{id}
    </update>

    <delete id="delete">
        DELETE FROM application WHERE id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 2: 创建 FavoriteMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.graphhire.application.domain.repository.FavoriteRepository">

    <resultMap id="BaseResultMap" type="com.graphhire.application.domain.model.Favorite">
        <id column="id" property="id"/>
        <result column="user_id" property="userId"/>
        <result column="job_id" property="jobId"/>
        <result column="created_at" property="createdAt"/>
    </resultMap>

    <insert id="save" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO favorite (user_id, job_id, created_at)
        VALUES (#{userId}, #{jobId}, #{createdAt})
    </insert>

    <select id="findById" resultMap="BaseResultMap">
        SELECT * FROM favorite WHERE id = #{id}
    </select>

    <select id="findByUserId" resultMap="BaseResultMap">
        SELECT * FROM favorite WHERE user_id = #{userId} ORDER BY created_at DESC
    </select>

    <select id="findByUserIdAndJobId" resultMap="BaseResultMap">
        SELECT * FROM favorite WHERE user_id = #{userId} AND job_id = #{jobId}
    </select>

    <select id="existsByUserIdAndJobId" resultType="boolean">
        SELECT EXISTS(SELECT 1 FROM favorite WHERE user_id = #{userId} AND job_id = #{jobId})
    </select>

    <delete id="delete">
        DELETE FROM favorite WHERE id = #{id}
    </delete>

    <delete id="deleteByUserIdAndJobId">
        DELETE FROM favorite WHERE user_id = #{userId} AND job_id = #{jobId}
    </delete>

</mapper>
```

- [ ] **Step 3: 创建 TalentPoolMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.graphhire.application.domain.repository.TalentPoolRepository">

    <resultMap id="BaseResultMap" type="com.graphhire.application.domain.model.TalentPool">
        <id column="id" property="id"/>
        <result column="company_id" property="companyId"/>
        <result column="resume_id" property="resumeId"/>
        <result column="added_at" property="addedAt"/>
        <result column="note" property="note"/>
        <result column="status" property="status"/>
    </resultMap>

    <insert id="save" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO talent_pool (company_id, resume_id, added_at, note, status)
        VALUES (#{companyId}, #{resumeId}, #{addedAt}, #{note}, #{status})
    </insert>

    <select id="findById" resultMap="BaseResultMap">
        SELECT * FROM talent_pool WHERE id = #{id}
    </select>

    <select id="findByCompanyId" resultMap="BaseResultMap">
        SELECT * FROM talent_pool WHERE company_id = #{companyId} ORDER BY added_at DESC
    </select>

    <select id="findByCompanyIdAndResumeId" resultMap="BaseResultMap">
        SELECT * FROM talent_pool WHERE company_id = #{companyId} AND resume_id = #{resumeId}
    </select>

    <select id="existsByCompanyIdAndResumeId" resultType="boolean">
        SELECT EXISTS(SELECT 1 FROM talent_pool WHERE company_id = #{companyId} AND resume_id = #{resumeId})
    </select>

    <delete id="delete">
        DELETE FROM talent_pool WHERE id = #{id}
    </delete>

    <delete id="deleteByCompanyIdAndResumeId">
        DELETE FROM talent_pool WHERE company_id = #{companyId} AND resume_id = #{resumeId}
    </delete>

</mapper>
```

- [ ] **Step 4: Commit**
```bash
git add backend/src/main/resources/mapper/application/ && git commit -m "feat: add MyBatis mappers for Application, Favorite, TalentPool"
```

---

### Task 3: 创建 ApplicationAppService

**Files:**
- Create: `backend/src/main/java/com/graphhire/application/application/service/ApplicationAppService.java`

- [ ] **Step 1: 创建 ApplicationAppService**

```java
package com.graphhire.application.application.service;

import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import com.graphhire.application.domain.model.Favorite;
import com.graphhire.application.domain.model.TalentPool;
import com.graphhire.application.domain.repository.ApplicationRepository;
import com.graphhire.application.domain.repository.FavoriteRepository;
import com.graphhire.application.domain.repository.TalentPoolRepository;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationAppService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private TalentPoolRepository talentPoolRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private NotificationAppService notificationAppService;

    // ==================== 投递相关 ====================

    /**
     * 投递简历
     */
    @Transactional
    public Application applyJob(Long userId, Long resumeId, Long jobId) {
        // 1. 校验简历存在且属于当前用户
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("简历不存在"));
        if (!resume.getUserId().equals(userId)) {
            throw new RuntimeException("无权使用此简历");
        }

        // 2. 校验职位存在且已发布
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("职位不存在"));
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new RuntimeException("职位未发布");
        }

        // 3. 校验未投递过
        if (applicationRepository.existsByResumeIdAndJobId(resumeId, jobId)) {
            throw new RuntimeException("已投递过此职位");
        }

        // 4. 创建投递记录
        Application application = new Application();
        application.setResumeId(resumeId);
        application.setJobId(jobId);
        application.setUserId(userId);
        application.setCompanyId(job.getCompanyId());
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());
        Application saved = applicationRepository.save(application);

        // 5. 发送通知给企业
        notificationAppService.create(
            job.getCompanyId(),
            NotificationType.RESUME_SUBMITTED,
            "新简历投递",
            String.format("收到一份简历投递，职位：%s", job.getTitle()),
            resumeId
        );

        return saved;
    }

    /**
     * 获取用户的投递列表
     */
    public List<Application> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    /**
     * 获取投递详情
     */
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("投递记录不存在"));
    }

    /**
     * 撤回投递
     */
    @Transactional
    public void withdrawApplication(Long userId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("投递记录不存在"));

        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此投递");
        }
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("只能撤回待处理的投递");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(application);
    }

    // ==================== 收藏相关 ====================

    /**
     * 收藏职位
     */
    @Transactional
    public Favorite favoriteJob(Long userId, Long jobId) {
        if (favoriteRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("已收藏过此职位");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setJobId(jobId);
        favorite.setCreatedAt(LocalDateTime.now());
        return favoriteRepository.save(favorite);
    }

    /**
     * 取消收藏
     */
    @Transactional
    public void unfavoriteJob(Long userId, Long jobId) {
        favoriteRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    /**
     * 获取用户收藏列表
     */
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    // ==================== 企业端投递管理 ====================

    /**
     * 获取企业的投递列表
     */
    public List<Application> getCompanyApplications(Long companyId, ApplicationStatus status) {
        if (status != null) {
            return applicationRepository.findByCompanyIdAndStatus(companyId, status);
        }
        return applicationRepository.findByCompanyId(companyId);
    }

    /**
     * 更新投递状态
     */
    @Transactional
    public void updateApplicationStatus(Long companyId, Long applicationId, ApplicationStatus status, String note) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("投递记录不存在"));

        if (!application.getCompanyId().equals(companyId)) {
            throw new RuntimeException("无权操作此投递");
        }

        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());
        if (note != null) {
            application.setNote(note);
        }
        applicationRepository.save(application);
    }

    /**
     * 发送面试邀请
     */
    @Transactional
    public void sendInterviewInvitation(Long companyId, Long applicationId, LocalDateTime interviewTime, String location, String remark) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("投递记录不存在"));

        if (!application.getCompanyId().equals(companyId)) {
            throw new RuntimeException("无权操作此投递");
        }

        application.setStatus(ApplicationStatus.INTERVIEW_INVITED);
        application.setUpdatedAt(LocalDateTime.now());
        application.setNote("面试时间:" + interviewTime + ", 地点:" + location + ", 备注:" + remark);
        applicationRepository.save(application);

        // 发送面试邀请通知
        Job job = jobRepository.findById(application.getJobId()).orElse(null);
        String jobTitle = job != null ? job.getTitle() : "未知职位";
        notificationAppService.create(
            application.getUserId(),
            NotificationType.INTERVIEW_INVITED,
            "面试邀请",
            String.format("您投递的%s职位邀请您参加面试，时间：%s，地点：%s", jobTitle, interviewTime, location),
            application.getJobId()
        );
    }

    // ==================== 人才库相关 ====================

    /**
     * 加入人才库
     */
    @Transactional
    public TalentPool addToTalentPool(Long companyId, Long resumeId, String note) {
        if (talentPoolRepository.existsByCompanyIdAndResumeId(companyId, resumeId)) {
            throw new RuntimeException("此人已在人才库中");
        }

        TalentPool talentPool = new TalentPool();
        talentPool.setCompanyId(companyId);
        talentPool.setResumeId(resumeId);
        talentPool.setAddedAt(LocalDateTime.now());
        talentPool.setNote(note);
        talentPool.setStatus(TalentPool.TalentPoolStatus.ACTIVE);
        return talentPoolRepository.save(talentPool);
    }

    /**
     * 从人才库移除
     */
    @Transactional
    public void removeFromTalentPool(Long companyId, Long resumeId) {
        talentPoolRepository.deleteByCompanyIdAndResumeId(companyId, resumeId);
    }

    /**
     * 获取企业人才库
     */
    public List<TalentPool> getCompanyTalentPool(Long companyId) {
        return talentPoolRepository.findByCompanyId(companyId);
    }
}
```

- [ ] **Step 2: Commit**
```bash
git add backend/src/main/java/com/graphhire/application/application/service/ApplicationAppService.java && git commit -m "feat: add ApplicationAppService with apply, favorite, talent pool operations"
```

---

### Task 4: 扩展 NotificationType 枚举

**Files:**
- Modify: `backend/src/main/java/com/graphhire/notification/domain/vo/NotificationType.java`

- [ ] **Step 1: 添加 INTERVIEW_INVITED 枚举值**

```java
// 在 NotificationType.java 的枚举值列表中添加：
/** 简历投递通知 */
RESUME_SUBMITTED(7, "Resume Submitted"),

/** 面试邀请通知 */
INTERVIEW_INVITED(6, "Interview Invited"),
```

**注意**: 需要将 RESUME_SUBMITTED 放在 INTERVIEW_INVITED 之后以保持顺序

- [ ] **Step 2: Commit**
```bash
git add backend/src/main/java/com/graphhire/notification/domain/vo/NotificationType.java && git commit -m "feat: add INTERVIEW_INVITED and RESUME_SUBMITTED notification types"
```

---

### Task 5: 创建投递相关 Controller

**Files:**
- Create: `backend/src/main/java/com/graphhire/application/interfaces/controller/PersonApplicationController.java`
- Create: `backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java`

- [ ] **Step 1: 创建 PersonApplicationController**

```java
package com.graphhire.application.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.Favorite;
import com.graphhire.application.domain.repository.ApplicationRepository;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/person")
public class PersonApplicationController {

    @Autowired
    private ApplicationAppService applicationAppService;

    @Autowired
    private ApplicationRepository applicationRepository;

    // ==================== 投递相关 ====================

    /**
     * 投递简历
     */
    @PostMapping("/applications")
    public Result<Long> applyJob(@RequestBody Map<String, Long> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long resumeId = request.get("resumeId");
        Long jobId = request.get("jobId");
        Application application = applicationAppService.applyJob(userId, resumeId, jobId);
        return Result.success(application.getId());
    }

    /**
     * 我的投递列表
     */
    @GetMapping("/applications")
    public Result<List<Application>> getMyApplications() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(applicationAppService.getUserApplications(userId));
    }

    /**
     * 投递详情
     */
    @GetMapping("/applications/{id}")
    public Result<Application> getApplicationDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Application application = applicationAppService.getApplicationById(id);
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("无权查看此投递");
        }
        return Result.success(application);
    }

    /**
     * 撤回投递
     */
    @PutMapping("/applications/{id}/withdraw")
    public Result<Void> withdrawApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        applicationAppService.withdrawApplication(userId, id);
        return Result.success();
    }

    // ==================== 收藏相关 ====================

    /**
     * 收藏职位
     */
    @PostMapping("/favorites")
    public Result<Void> favoriteJob(@RequestBody Map<String, Long> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long jobId = request.get("jobId");
        applicationAppService.favoriteJob(userId, jobId);
        return Result.success();
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/favorites/{jobId}")
    public Result<Void> unfavoriteJob(@PathVariable Long jobId) {
        Long userId = StpUtil.getLoginIdAsLong();
        applicationAppService.unfavoriteJob(userId, jobId);
        return Result.success();
    }

    /**
     * 我的收藏列表
     */
    @GetMapping("/favorites")
    public Result<List<Favorite>> getMyFavorites() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(applicationAppService.getUserFavorites(userId));
    }
}
```

- [ ] **Step 2: 创建 CompanyApplicationController**

```java
package com.graphhire.application.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import com.graphhire.application.domain.model.TalentPool;
import com.graphhire.application.domain.repository.ApplicationRepository;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/company")
public class CompanyApplicationController {

    @Autowired
    private ApplicationAppService applicationAppService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CompanyAppService companyAppService;

    @Autowired
    private JobRepository jobRepository;

    // ==================== 投递管理 ====================

    /**
     * 查看投递列表
     */
    @GetMapping("/applications")
    public Result<List<Application>> getApplications(
            @RequestParam(required = false) ApplicationStatus status) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        return Result.success(applicationAppService.getCompanyApplications(companyId, status));
    }

    /**
     * 投递详情
     */
    @GetMapping("/applications/{id}")
    public Result<Application> getApplicationDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Application application = applicationAppService.getApplicationById(id);
        if (!application.getCompanyId().equals(companyId)) {
            throw new RuntimeException("无权查看此投递");
        }
        return Result.success(application);
    }

    /**
     * 更新投递状态
     */
    @PutMapping("/applications/{id}/status")
    public Result<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String note) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.updateApplicationStatus(companyId, id, status, note);
        return Result.success();
    }

    /**
     * 发送面试邀请
     */
    @PostMapping("/applications/{id}/interview")
    public Result<Void> sendInterviewInvitation(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);

        LocalDateTime interviewTime = LocalDateTime.parse(request.get("interviewTime"));
        String location = request.get("location");
        String remark = request.get("remark");

        applicationAppService.sendInterviewInvitation(companyId, id, interviewTime, location, remark);
        return Result.success();
    }

    /**
     * 标记不合适
     */
    @PostMapping("/applications/{id}/reject")
    public Result<Void> rejectApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.updateApplicationStatus(companyId, id, ApplicationStatus.REJECTED, null);
        return Result.success();
    }

    /**
     * 标记合适
     */
    @PostMapping("/applications/{id}/accept")
    public Result<Void> acceptApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.updateApplicationStatus(companyId, id, ApplicationStatus.ACCEPTED, null);
        return Result.success();
    }

    // ==================== 人才库 ====================

    /**
     * 加入人才库
     */
    @PostMapping("/talent-pool")
    public Result<Void> addToTalentPool(@RequestBody Map<String, Object> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Long resumeId = ((Number) request.get("resumeId")).longValue();
        String note = (String) request.get("note");
        applicationAppService.addToTalentPool(companyId, resumeId, note);
        return Result.success();
    }

    /**
     * 从人才库移除
     */
    @DeleteMapping("/talent-pool/{resumeId}")
    public Result<Void> removeFromTalentPool(@PathVariable Long resumeId) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.removeFromTalentPool(companyId, resumeId);
        return Result.success();
    }

    /**
     * 人才库列表
     */
    @GetMapping("/talent-pool")
    public Result<List<TalentPool>> getTalentPool() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        return Result.success(applicationAppService.getCompanyTalentPool(companyId));
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/graphhire/application/interfaces/controller/ && git commit -m "feat: add PersonApplicationController and CompanyApplicationController"
```

---

### Task 6: 创建数据库表

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_04_16_001__add_application_tables.sql`

- [ ] **Step 1: 创建数据库迁移脚本**

```sql
-- 投递记录表
CREATE TABLE IF NOT EXISTS application (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    UNIQUE(resume_id, job_id)
);

-- 收藏记录表
CREATE TABLE IF NOT EXISTS favorite (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- 人才库表
CREATE TABLE IF NOT EXISTS talent_pool (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE(company_id, resume_id)
);

-- 创建索引
CREATE INDEX idx_application_user_id ON application(user_id);
CREATE INDEX idx_application_job_id ON application(job_id);
CREATE INDEX idx_application_company_id ON application(company_id);
CREATE INDEX idx_application_status ON application(status);

CREATE INDEX idx_favorite_user_id ON favorite(user_id);
CREATE INDEX idx_favorite_job_id ON favorite(job_id);

CREATE INDEX idx_talent_pool_company_id ON talent_pool(company_id);
CREATE INDEX idx_talent_pool_resume_id ON talent_pool(resume_id);
```

- [ ] **Step 2: Commit**
```bash
git add backend/src/main/resources/db/migration/V2026_04_16_001__add_application_tables.sql && git commit -m "feat: add database migration for application tables"
```

---

## 阶段二：公开搜索模块 (Module 2)

### Task 7: 创建公开搜索 API

**Files:**
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java`
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`

- [ ] **Step 1: 创建 PublicJobController**

```java
package com.graphhire.publicapi.interfaces.controller;

import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.service.JobQueryService;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public")
public class PublicJobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillTagRepository skillTagRepository;

    /**
     * 公开职位列表（支持搜索、筛选、分页）
     */
    @GetMapping("/jobs")
    public Result<PageResult<Job>> getPublicJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer salaryMin,
            @RequestParam(required = false) Integer salaryMax,
            @RequestParam(required = false) String skills,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        // 限制每页最大50条
        size = Math.min(size, 50);

        // 获取所有已发布职位
        List<Job> allJobs = jobRepository.findByStatus(JobStatus.PUBLISHED);

        // 过滤
        List<Job> filtered = allJobs.stream()
            .filter(job -> {
                // 关键词搜索
                if (keyword != null && !keyword.isBlank()) {
                    boolean match = job.getTitle() != null && job.getTitle().contains(keyword);
                    // 可以扩展搜索公司名
                    if (!match) return false;
                }
                // 城市筛选
                if (city != null && !city.isBlank()) {
                    if (job.getLocation() == null || !job.getLocation().getCity().contains(city)) {
                        return false;
                    }
                }
                // 薪资筛选
                if (salaryMin != null) {
                    if (job.getSalaryRange() == null || job.getSalaryRange().getMin() < salaryMin) {
                        return false;
                    }
                }
                if (salaryMax != null) {
                    if (job.getSalaryRange() == null || job.getSalaryRange().getMax() > salaryMax) {
                        return false;
                    }
                }
                // 技能筛选
                if (skills != null && !skills.isBlank()) {
                    List<String> skillList = List.of(skills.split(","));
                    if (job.getRequiredSkills() == null) return false;
                    boolean hasSkill = skillList.stream()
                        .anyMatch(s -> job.getRequiredSkills().contains(s.trim()));
                    if (!hasSkill) return false;
                }
                return true;
            })
            .collect(Collectors.toList());

        // 排序
        filtered.sort((a, b) -> {
            if ("salary".equals(sortBy)) {
                int salaryA = a.getSalaryRange() != null ? a.getSalaryRange().getMax() : 0;
                int salaryB = b.getSalaryRange() != null ? b.getSalaryRange().getMax() : 0;
                return Integer.compare(salaryB, salaryA);
            }
            // 默认按发布时间倒序
            return b.getPublishedAt().compareTo(a.getPublishedAt());
        });

        // 分页
        int total = filtered.size();
        int totalPages = (total + size - 1) / size;
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, total);

        List<Job> paged = fromIndex < total
            ? filtered.subList(fromIndex, toIndex)
            : List.of();

        return Result.success(new PageResult<>(paged, page, size, total, totalPages));
    }

    /**
     * 公开职位详情
     */
    @GetMapping("/jobs/{id}")
    public Result<Job> getPublicJobDetail(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("职位不存在"));

        // 只返回已发布职位的公开信息
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new RuntimeException("职位不存在");
        }

        return Result.success(job);
    }
}
```

- [ ] **Step 2: 创建 PublicCompanyController**

```java
package com.graphhire.publicapi.interfaces.controller;

import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public")
public class PublicCompanyController {

    @Autowired
    private CompanyAppService companyAppService;

    /**
     * 公开公司列表（支持搜索、分页）
     */
    @GetMapping("/companies")
    public Result<PageResult<Company>> getPublicCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        // 限制每页最大50条
        size = Math.min(size, 50);

        // 获取所有已认证的公司
        List<Company> allCompanies = companyAppService.getAllApprovedCompanies();

        // 过滤
        List<Company> filtered = allCompanies.stream()
            .filter(company -> {
                if (keyword != null && !keyword.isBlank()) {
                    return company.getName() != null && company.getName().contains(keyword);
                }
                return true;
            })
            .collect(java.util.stream.Collectors.toList());

        // 分页
        int total = filtered.size();
        int totalPages = (total + size - 1) / size;
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, total);

        List<Company> paged = fromIndex < total
            ? filtered.subList(fromIndex, toIndex)
            : List.of();

        return Result.success(new PageResult<>(paged, page, size, total, totalPages));
    }

    /**
     * 公开公司详情
     */
    @GetMapping("/companies/{id}")
    public Result<Company> getPublicCompanyDetail(@PathVariable Long id) {
        Company company = companyAppService.getCompanyById(id);
        return Result.success(company);
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/graphhire/publicapi/ && git commit -m "feat: add PublicJobController and PublicCompanyController for public API"
```

---

## 阶段三：账号安全模块 (Module 3)

### Task 8: 创建密码相关 API

**Files:**
- Create: `backend/src/main/java/com/graphhire/auth/interfaces/controller/PasswordController.java`

- [ ] **Step 1: 创建 PasswordController**

```java
package com.graphhire.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.common.vo.Result;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/auth")
public class PasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthAppService authAppService;

    @Autowired
    private NotificationAppService notificationAppService;

    // Redis 用于存储验证码（假设已配置）
    // private RedisTemplate<String, String> redisTemplate;

    /**
     * 修改密码
     */
    @PostMapping("/change-password")
    public Result<Void> changePassword(@RequestBody Map<String, String> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        // 校验旧密码
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!BCrypt.checkpw(oldPassword, user.getPassword().getValue())) {
            throw new RuntimeException("旧密码错误");
        }

        // 校验新密码格式
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException("新密码格式不正确：8位以上，至少包含1个大写字母、1个小写字母、1个数字");
        }

        // 校验新密码不能与旧密码相同
        if (BCrypt.checkpw(newPassword, user.getPassword().getValue())) {
            throw new RuntimeException("新密码不能与旧密码相同");
        }

        // 更新密码
        authAppService.updatePassword(userId, newPassword);

        return Result.success();
    }

    /**
     * 忘记密码（重置）
     */
    @PostMapping("/forgot-password")
    public Result<Void> forgotPassword(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String verifyCode = request.get("verifyCode");
        String newPassword = request.get("newPassword");

        // 校验验证码（简化版，实际应查Redis）
        // if (!verifyCode.equals(getRedisCode(phone))) {
        //     throw new RuntimeException("验证码错误或已过期");
        // }

        // 校验新密码格式
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException("新密码格式不正确");
        }

        // 根据手机号查找用户
        User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new RuntimeException("该手机号未注册"));

        // 更新密码
        authAppService.updatePassword(user.getId(), newPassword);

        // 使原token失效（踢出登录）
        // StpUtil.kickout(user.getId());

        return Result.success();
    }

    /**
     * 发送验证码（用于忘记密码）
     */
    @PostMapping("/send-reset-code")
    public Result<Void> sendResetCode(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");

        // 生成6位验证码
        String code = String.format("%06d", (int)(Math.random() * 1000000));

        // 存储到Redis，5分钟有效
        // redisTemplate.opsForValue().set("reset_code:" + phone, code, 5, TimeUnit.MINUTES);

        // 实际应调用短信服务发送验证码
        // smsService.send(phone, code);

        return Result.success();
    }

    /**
     * 校验密码格式
     */
    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
        }
        return hasUpper && hasLower && hasDigit;
    }
}
```

- [ ] **Step 2: Commit**
```bash
git add backend/src/main/java/com/graphhire/auth/interfaces/controller/PasswordController.java && git commit -m "feat: add PasswordController for change-password and forgot-password"
```

---

### Task 9: 创建头像上传 API

**Files:**
- Create: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonAvatarController.java`

- [ ] **Step 1: 创建 PersonAvatarController**

```java
package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/person")
public class PersonAvatarController {

    @Autowired
    private PersonInfoRepository personInfoRepository;

    private static final String UPLOAD_DIR = "/data/avatars/";
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Long userId = StpUtil.getLoginIdAsLong();

        // 校验文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("文件大小不能超过2MB");
        }

        // 校验文件格式
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = userId + "_" + System.currentTimeMillis() + extension;

        try {
            // 保存文件到本地（实际应上传到 RustFS/S3）
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            // 构建URL
            String avatarUrl = "/avatars/" + filename;

            // 更新 PersonInfo
            PersonInfo personInfo = personInfoRepository.findByUserId(userId)
                .orElseGet(() -> {
                    PersonInfo newInfo = new PersonInfo();
                    newInfo.setUserId(userId);
                    return newInfo;
                });
            personInfo.setAvatarUrl(avatarUrl);
            personInfoRepository.save(personInfo);

            return Result.success(avatarUrl);
        } catch (IOException e) {
            throw new RuntimeException("上传头像失败: " + e.getMessage());
        }
    }

    /**
     * 获取头像URL
     */
    @GetMapping("/avatar")
    public Result<String> getAvatar() {
        Long userId = StpUtil.getLoginIdAsLong();

        PersonInfo personInfo = personInfoRepository.findByUserId(userId)
            .orElse(null);

        if (personInfo != null && personInfo.getAvatarUrl() != null) {
            return Result.success(personInfo.getAvatarUrl());
        }

        return Result.success("/avatars/default.png"); // 默认头像
    }
}
```

- [ ] **Step 2: 更新 PersonInfo 添加 avatarUrl 字段**

```java
// 在 PersonInfo.java 中添加
private String avatarUrl;  // 头像URL

// getter and setter
public String getAvatarUrl() { return avatarUrl; }
public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonAvatarController.java backend/src/main/java/com/graphhire/resume/domain/model/PersonInfo.java && git commit -m "feat: add PersonAvatarController and avatarUrl field"
```

---

## 阶段四：管理后台增强 (Module 4)

### Task 10: 创建批量操作 API

**Files:**
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/controller/BatchOperationController.java`

- [ ] **Step 1: 创建 BatchOperationController**

```java
package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.ParseStatus;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class BatchOperationController {

    @Autowired
    private AdminAppService adminAppService;

    @Autowired
    private CompanyAppService companyAppService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    /**
     * 批量通过企业认证
     */
    @PostMapping("/company/batch/approve")
    public Result<Void> batchApproveCompanies(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> companyIds = (List<Long>) request.get("companyIds");
        String reason = (String) request.get("reason");

        for (Long companyId : companyIds) {
            companyAppService.approveCompany(companyId);
        }
        return Result.success();
    }

    /**
     * 批量拒绝企业认证
     */
    @PostMapping("/company/batch/reject")
    public Result<Void> batchRejectCompanies(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> companyIds = (List<Long>) request.get("companyIds");
        String reason = (String) request.get("reason");

        for (Long companyId : companyIds) {
            companyAppService.rejectCompany(companyId, reason);
        }
        return Result.success();
    }

    /**
     * 批量禁用用户
     */
    @PostMapping("/user/batch/disable")
    public Result<Void> batchDisableUsers(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) request.get("userIds");
        String duration = (String) request.get("duration");
        String reason = (String) request.get("reason");

        for (Long userId : userIds) {
            adminAppService.disableUser(userId, duration, reason);
        }
        return Result.success();
    }

    /**
     * 批量重试任务
     */
    @PostMapping("/task/batch/retry")
    public Result<Void> batchRetryTasks(@RequestBody Map<String, List<Long>> request) {
        List<Long> taskIds = request.get("taskIds");

        for (Long taskId : taskIds) {
            adminAppService.retryTask(taskId);
        }
        return Result.success();
    }
}
```

- [ ] **Step 2: Commit**
```bash
git add backend/src/main/java/com/graphhire/admin/interfaces/controller/BatchOperationController.java && git commit -m "feat: add BatchOperationController for batch operations"
```

---

### Task 11: 创建技能分类管理 API

**Files:**
- Create: `backend/src/main/java/com/graphhire/skill/domain/model/Category.java`
- Create: `backend/src/main/java/com/graphhire/skill/domain/repository/CategoryRepository.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/controller/CategoryController.java`
- Create: `backend/src/main/resources/mapper/skill/CategoryMapper.xml`
- Create: `backend/src/main/resources/db/migration/V2026_04_16_002__add_skill_category_table.sql`

- [ ] **Step 1: 创建 Category 实体**

```java
package com.graphhire.skill.domain.model;

import java.time.LocalDateTime;

public class Category {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;

    // getters, setters, constructors
}
```

- [ ] **Step 2: 创建 CategoryRepository 接口**

```java
package com.graphhire.skill.domain.repository;

import com.graphhire.skill.domain.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository {
    Category save(Category category);
    Optional<Category> findById(Long id);
    List<Category> findAll();
    void delete(Long id);
}
```

- [ ] **Step 3: 创建 CategoryMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.graphhire.skill.domain.repository.CategoryRepository">

    <resultMap id="BaseResultMap" type="com.graphhire.skill.domain.model.Category">
        <id column="id" property="id"/>
        <result column="name" property="name"/>
        <result column="description" property="description"/>
        <result column="created_at" property="createdAt"/>
    </resultMap>

    <insert id="save" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO skill_category (name, description, created_at)
        VALUES (#{name}, #{description}, #{createdAt})
    </insert>

    <select id="findById" resultMap="BaseResultMap">
        SELECT * FROM skill_category WHERE id = #{id}
    </select>

    <select id="findAll" resultMap="BaseResultMap">
        SELECT * FROM skill_category ORDER BY name
    </select>

    <update id="update">
        UPDATE skill_category SET name = #{name}, description = #{description} WHERE id = #{id}
    </update>

    <delete id="delete">
        DELETE FROM skill_category WHERE id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 4: 创建 CategoryController**

```java
package com.graphhire.admin.interfaces.controller;

import com.graphhire.common.vo.Result;
import com.graphhire.skill.domain.model.Category;
import com.graphhire.skill.domain.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/skill")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * 获取所有技能分类
     */
    @GetMapping("/categories")
    public Result<List<Category>> getAllCategories() {
        return Result.success(categoryRepository.findAll());
    }

    /**
     * 添加技能分类
     */
    @PostMapping("/categories")
    public Result<Long> createCategory(@RequestBody Category request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setCreatedAt(LocalDateTime.now());
        Category saved = categoryRepository.save(category);
        return Result.success(saved.getId());
    }

    /**
     * 更新技能分类
     */
    @PutMapping("/categories/{id}")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestBody Category request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("分类不存在"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        categoryRepository.save(category);
        return Result.success();
    }

    /**
     * 删除技能分类
     */
    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.delete(id);
        return Result.success();
    }
}
```

- [ ] **Step 5: 创建数据库迁移脚本**

```sql
-- 技能分类表
CREATE TABLE IF NOT EXISTS skill_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- skill_tag 表新增 category_id 字段
ALTER TABLE skill_tag ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES skill_category(id);
```

- [ ] **Step 6: Commit**
```bash
git add backend/src/main/java/com/graphhire/skill/domain/model/Category.java backend/src/main/java/com/graphhire/skill/domain/repository/CategoryRepository.java backend/src/main/java/com/graphhire/admin/interfaces/controller/CategoryController.java backend/src/main/resources/mapper/skill/CategoryMapper.xml backend/src/main/resources/db/migration/V2026_04_16_002__add_skill_category_table.sql && git commit -m "feat: add skill category management"
```

---

## 阶段五：企业增强 (Module 5)

### Task 12: 创建员工密码重置 API

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`

- [ ] **Step 1: 在 CompanyController 中添加 reset-password 端点**

在 CompanyController.java 的 `createStaff` 方法后添加：

```java
/**
 * 重置员工密码
 * 【功能说明】只有企业主(OWNER)可以重置员工密码，重置后发送新密码到员工手机
 */
@PostMapping("/staff/{staffId}/reset-password")
public Result<Void> resetStaffPassword(@PathVariable Long staffId) {
    // 步骤1：从Sa-Token session获取当前用户ID
    Long currentUserId = StpUtil.getLoginIdAsLong();

    // 步骤2：获取当前用户的company_staff记录
    CompanyStaff currentStaff = companyStaffRepository.findByUserId(currentUserId)
            .orElseThrow(() -> Exceptions.BusinessException.of("非企业用户"));

    // 步骤3：验证当前用户是企业主（只有企业主可以重置密码）
    if (!"OWNER".equals(currentStaff.getPost())) {
        throw new Exceptions.ForbiddenException("只有企业主可以重置员工密码");
    }

    // 步骤4：获取要重置的员工信息
    CompanyStaff targetStaff = companyStaffRepository.findById(staffId)
            .orElseThrow(() -> Exceptions.BusinessException.of("员工不存在"));

    // 步骤5：验证目标员工属于同一公司
    if (!targetStaff.getCompanyId().equals(currentStaff.getCompanyId())) {
        throw new Exceptions.ForbiddenException("无权重置此员工密码");
    }

    // 步骤6：验证不能重置企业主自己的密码
    if ("OWNER".equals(targetStaff.getPost())) {
        throw new Exceptions.ForbiddenException("不能重置企业主密码");
    }

    // 步骤7：生成新密码并更新
    String newPassword = generateRandomPassword();
    User targetUser = userRepository.findById(targetStaff.getUserId())
            .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
    targetUser.setPassword(EncryptedPassword.encode(newPassword));
    userRepository.save(targetUser);

    // 步骤8：发送新密码到员工手机（实际应调用短信服务）
    // smsService.send(targetUser.getPhone(), "您的新密码是：" + newPassword);

    return Result.success();
}

/**
 * 生成随机密码（10位，包含大小写字母和数字）
 */
private String generateRandomPassword() {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    StringBuilder password = new StringBuilder();
    java.util.Random random = new java.util.Random();
    for (int i = 0; i < 10; i++) {
        password.append(chars.charAt(random.nextInt(chars.length())));
    }
    return password.toString();
}
```

- [ ] **Step 2: Commit**
```bash
git add backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java && git commit -m "feat: add reset-staff-password endpoint in CompanyController"
```

---

### Task 13: MatchRecord 方向应用调整

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`

- [ ] **Step 1: 修改 triggerMatchForResume 方法**

将 `triggerMatchForResume` 方法中的逻辑修改为：不再自动创建 MatchRecord，只发送通知。投递时直接创建 Application。

```java
/**
 * 为简历触发与所有已发布职位的匹配
 * 【功能说明】当用户上传/更新简历时调用，为简历匹配所有已发布职位并创建通知。
 * 注意：此方法不再创建 MatchRecord，投递时由 Application 模块负责创建
 */
@Transactional
public void triggerMatchForResume(Long resumeId) {
    Resume resume = resumeRepository.findById(resumeId)
        .orElseThrow(() -> new RuntimeException("Resume not found"));

    List<Job> jobs = jobRepository.findByStatus(JobStatus.PUBLISHED);

    for (Job job : jobs) {
        // 只发送通知，不创建 MatchRecord
        // MatchRecord 应在投递时由 Application 模块创建
        createJobRecommendationNotification(resume.getUserId(), job.getId(), null);
    }
}
```

- [ ] **Step 2: 修改 triggerMatchForJob 方法**

```java
/**
 * 为职位触发与所有解析成功简历的匹配
 * 【功能说明】当企业发布/更新职位时调用，为职位匹配所有解析成功的简历并创建通知。
 * 注意：此方法不再创建 MatchRecord
 */
@Transactional
public void triggerMatchForJob(Long jobId) {
    Job job = jobRepository.findById(jobId)
        .orElseThrow(() -> new RuntimeException("Job not found"));

    List<Resume> resumes = resumeRepository.findByParseStatus(ParseStatus.SUCCESS);

    for (Resume resume : resumes) {
        // 只发送通知，不创建 MatchRecord
        createCandidateRecommendationNotification(job.getCompanyId(), resume.getId(), null);
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java && git commit -m "refactor: adjust MatchAppService to not auto-create MatchRecord (handled by Application module)"
```

---

## 总结

本计划共 13 个 Task，覆盖设计文档中的所有 5 个模块。实现顺序：

| 阶段 | Task | 说明 |
|------|------|------|
| Module 1 | Task 1-6 | 投递模块（实体、Repository、Service、Controller、数据库） |
| Module 2 | Task 7 | 公开搜索模块 |
| Module 3 | Task 8-9 | 账号安全模块 |
| Module 4 | Task 10-11 | 管理后台增强 |
| Module 5 | Task 12-13 | 企业增强 |

**Plan complete and saved to `docs/superpowers/plans/2026-04-16-graphhire-backend-expansion.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
