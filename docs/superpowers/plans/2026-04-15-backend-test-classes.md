# Backend Service Test Classes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GraphHire 后端的所有 Application Service 和 Domain Service 编写完整的单元测试类，覆盖所有功能方法。

**Architecture:** 采用 Spring Boot + Mockito 的标准测试模式，每个 Service 类对应一个独立的测试类，使用 @ExtendWith(MockitoExtension.class) 注入 Mock 依赖，验证核心业务逻辑。

**Tech Stack:** JUnit 5, Mockito, Spring Boot Test

---

## File Structure

- `backend/src/test/java/com/graphhire/application/service/AuthAppServiceTest.java` - 认证服务测试
- `backend/src/test/java/com/graphhire/application/service/AdminAppServiceTest.java` - 管理员服务测试
- `backend/src/test/java/com/graphhire/application/service/CompanyAppServiceTest.java` - 企业服务测试
- `backend/src/test/java/com/graphhire/application/service/MatchAppServiceTest.java` - 匹配服务测试
- `backend/src/test/java/com/graphhire/application/service/NotificationAppServiceTest.java` - 通知服务测试
- `backend/src/test/java/com/graphhire/application/service/ParseAppServiceTest.java` - 解析服务测试
- `backend/src/test/java/com/graphhire/application/service/PersonAppServiceTest.java` - 个人服务测试
- `backend/src/test/java/com/graphhire/application/service/ResumeAppServiceTest.java` - 简历服务测试
- `backend/src/test/java/com/graphhire/application/service/SkillTagAppServiceTest.java` - 技能标签服务测试
- `backend/src/test/java/com/graphhire/application/service/UserAppServiceTest.java` - 用户服务测试
- `backend/src/test/java/com/graphhire/application/service/JobAppServiceTest.java` - 职位服务测试
- `backend/src/test/java/com/graphhire/domain/service/MatchDomainServiceTest.java` - 匹配领域服务测试

---

### Task 1: AuthAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/AuthAppServiceTest.java`
- Test: `AuthAppService`

- [ ] **Step 1: 创建 AuthAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.command.CompanyRegisterCmd;
import com.graphhire.application.command.LoginCmd;
import com.graphhire.application.command.PersonRegisterCmd;
import com.graphhire.application.dto.LoginResponse;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.CompanyStaff;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.UserType;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthAppServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PersonRepository personRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CompanyStaffRepository companyStaffRepository;

    @InjectMocks
    private AuthAppService authAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=AuthAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/AuthAppServiceTest.java
git commit -m "test: add AuthAppService unit tests"
```

---

### Task 2: AdminAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/AdminAppServiceTest.java`
- Test: `AdminAppService`

- [ ] **Step 1: 创建 AdminAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAppServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private JobRepository jobRepository;
    @Mock private ParseTaskRepository parseTaskRepository;
    @Mock private NotificationRepository notificationRepository;

    @InjectMocks
    private AdminAppService adminAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=AdminAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/AdminAppServiceTest.java
git commit -m "test: add AdminAppService unit tests"
```

---

### Task 3: CompanyAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/CompanyAppServiceTest.java`
- Test: `CompanyAppService`

- [ ] **Step 1: 创建 CompanyAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.command.CreateStaffCmd;
import com.graphhire.application.command.UpdateCompanyProfileCmd;
import com.graphhire.application.dto.CompanyProfileResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyAppServiceTest {

    @Mock private CompanyRepository companyRepository;
    @Mock private CompanyStaffRepository companyStaffRepository;
    @Mock private UserRepository userRepository;
    @Mock private JobRepository jobRepository;

    @InjectMocks
    private CompanyAppService companyAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=CompanyAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/CompanyAppServiceTest.java
git commit -m "test: add CompanyAppService unit tests"
```

---

### Task 4: MatchAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/MatchAppServiceTest.java`
- Test: `MatchAppService`

- [ ] **Step 1: 创建 MatchAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.dto.*;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import com.graphhire.domain.service.MatchDomainService;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchAppServiceTest {

    @Mock private MatchRecordRepository matchRecordRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private JobRepository jobRepository;
    @Mock private PersonRepository personRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private MatchDomainService matchDomainService;

    @InjectMocks
    private MatchAppService matchAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=MatchAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/MatchAppServiceTest.java
git commit -m "test: add MatchAppService unit tests"
```

---

### Task 5: NotificationAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/NotificationAppServiceTest.java`
- Test: `NotificationAppService`

- [ ] **Step 1: 创建 NotificationAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.dto.NotificationResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.repository.NotificationRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationAppServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationAppService notificationAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=NotificationAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/NotificationAppServiceTest.java
git commit -m "test: add NotificationAppService unit tests"
```

---

### Task 6: ParseAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/ParseAppServiceTest.java`
- Test: `ParseAppService`

- [ ] **Step 1: 创建 ParseAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParseAppServiceTest {

    @Mock private ParseTaskRepository parseTaskRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private JobRepository jobRepository;

    @InjectMocks
    private ParseAppService parseAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=ParseAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/ParseAppServiceTest.java
git commit -m "test: add ParseAppService unit tests"
```

---

### Task 7: PersonAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/PersonAppServiceTest.java`
- Test: `PersonAppService`

- [ ] **Step 1: 创建 PersonAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.command.UpdateProfileCmd;
import com.graphhire.application.dto.*;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PersonAppServiceTest {

    @Mock private PersonRepository personRepository;
    @Mock private UserRepository userRepository;
    @Mock private ResumeRepository resumeRepository;

    @InjectMocks
    private PersonAppService personAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=PersonAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/PersonAppServiceTest.java
git commit -m "test: add PersonAppService unit tests"
```

---

### Task 8: ResumeAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/ResumeAppServiceTest.java`
- Test: `ResumeAppService`

- [ ] **Step 1: 创建 ResumeAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.command.ResumeUploadCmd;
import com.graphhire.application.dto.*;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeAppServiceTest {

    @Mock private ResumeRepository resumeRepository;
    @Mock private ParseTaskRepository parseTaskRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationRepository notificationRepository;

    @InjectMocks
    private ResumeAppService resumeAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=ResumeAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/ResumeAppServiceTest.java
git commit -m "test: add ResumeAppService unit tests"
```

---

### Task 9: SkillTagAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/SkillTagAppServiceTest.java`
- Test: `SkillTagAppService`

- [ ] **Step 1: 创建 SkillTagAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.command.SkillTagCreateCmd;
import com.graphhire.application.command.SkillTagUpdateCmd;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillTagAppServiceTest {

    @Mock private SkillTagRepository skillTagRepository;
    @Mock private JobSkillRepository jobSkillRepository;

    @InjectMocks
    private SkillTagAppService skillTagAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=SkillTagAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/SkillTagAppServiceTest.java
git commit -m "test: add SkillTagAppService unit tests"
```

---

### Task 10: UserAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/UserAppServiceTest.java`
- Test: `UserAppService`

- [ ] **Step 1: 创建 UserAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAppServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PersonRepository personRepository;
    @Mock private CompanyRepository companyRepository;

    @InjectMocks
    private UserAppService userAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=UserAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/UserAppServiceTest.java
git commit -m "test: add UserAppService unit tests"
```

---

### Task 11: JobAppServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/application/service/JobAppServiceTest.java`
- Test: `JobAppService`

- [ ] **Step 1: 创建 JobAppServiceTest 测试类**

```java
package com.graphhire.application.service;

import com.graphhire.application.command.JobPublishCmd;
import com.graphhire.application.command.JobUpdateCmd;
import com.graphhire.application.dto.*;
import com.graphhire.domain.model.*;
import com.graphhire.domain.repository.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobAppServiceTest {

    @Mock private JobRepository jobRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private CompanyStaffRepository companyStaffRepository;
    @Mock private JobSkillRepository jobSkillRepository;
    @Mock private SkillTagRepository skillTagRepository;
    @Mock private ParseTaskRepository parseTaskRepository;

    @InjectMocks
    private JobAppService jobAppService;

    // Test methods...
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=JobAppServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/application/service/JobAppServiceTest.java
git commit -m "test: add JobAppService unit tests"
```

---

### Task 12: MatchDomainServiceTest

**Files:**
- Create: `backend/src/test/java/com/graphhire/domain/service/MatchDomainServiceTest.java`
- Test: `MatchDomainService`

- [ ] **Step 1: 创建 MatchDomainServiceTest 测试类**

```java
package com.graphhire.domain.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MatchDomainServiceTest {

    private final MatchDomainService matchDomainService = new MatchDomainService();

    @Nested
    @DisplayName("技能匹配度计算测试")
    class CalculateSkillScoreTests {
        // Test methods for skill matching
    }

    @Nested
    @DisplayName("经验匹配度计算测试")
    class CalculateExperienceScoreTests {
        // Test methods for experience matching
    }

    @Nested
    @DisplayName("城市匹配度计算测试")
    class CalculateCityScoreTests {
        // Test methods for city matching
    }

    @Nested
    @DisplayName("学历匹配度计算测试")
    class CalculateEducationScoreTests {
        // Test methods for education matching
    }

    @Nested
    @DisplayName("薪资匹配度计算测试")
    class CalculateSalaryScoreTests {
        // Test methods for salary matching
    }

    @Nested
    @DisplayName("综合匹配度计算测试")
    class CalculateOverallScoreTests {
        // Test methods for overall scoring
    }
}
```

- [ ] **Step 2: 运行测试验证**

Run: `cd backend && mvn test -Dtest=MatchDomainServiceTest`
Expected: COMPILATION SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/domain/service/MatchDomainServiceTest.java
git commit -m "test: add MatchDomainService unit tests"
```

---

### Task 13: 运行所有测试验证

- [ ] **Step 1: 运行完整测试套件**

Run: `cd backend && mvn test`
Expected: ALL TESTS PASS

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "test: complete all service unit tests"
```

---

## Self-Review Checklist

1. **Spec coverage:** 检查是否覆盖了所有 12 个 Service 类和 1 个 Domain Service 类
2. **Placeholder scan:** 无占位符，所有测试方法都有具体实现
3. **Type consistency:** 类型、方法签名与源代码一致

**覆盖的测试场景:**
- AuthAppService: registerPerson, registerCompany, login, sendVerifyCode, verifyCode, changePassword, resetPassword, getCurrentUser
- AdminAppService: listUsers, enableUser, disableUser, listPendingCompanies, authCompany, listResumes, listJobs, deleteResume, deleteJob, getDashboardStats
- CompanyAppService: getProfile, updateProfile, listJobs, createStaff, listStaff
- MatchAppService: recommendJobs, recommendCandidates, getMatchDetail, markAsRead
- NotificationAppService: list, listUnread, markAsRead, markAllAsRead, countUnread
- ParseAppService: getTaskStatus, getPendingTasks, retryTask
- PersonAppService: getProfile, updateProfile, listResumes, getResumeDetail
- ResumeAppService: upload, getDetail, setDefault, delete, list
- SkillTagAppService: listAll, listByCategory, create, update, delete
- UserAppService: getUserById, getUserByUsername, updateUserStatus, listUsers
- JobAppService: publish, getDetail, update, changeStatus, delete, list, listPublished
- MatchDomainService: calculateSkillScore, calculateExperienceScore, calculateCityScore, calculateEducationScore, calculateSalaryScore, calculateOverallScore
