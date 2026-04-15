package com.graphhire.domain.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MatchDomainServiceTest {

    private final MatchDomainService matchDomainService = new MatchDomainService();

    @Nested
    @DisplayName("技能匹配度计算测试")
    class CalculateSkillScoreTests {

        @Test
        @DisplayName("技能完全匹配时返回高分")
        void calculateSkillScore_FullMatch() {
            // Given
            List<String> personSkills = Arrays.asList("Java", "Python", "Spring Boot");
            List<String> jobSkills = Arrays.asList("Java", "Python", "Spring Boot");

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            // 3/3 * 100 = 100
            assertEquals(0, BigDecimal.valueOf(100).compareTo(score));
        }

        @Test
        @DisplayName("技能部分匹配时返回相应分数")
        void calculateSkillScore_PartialMatch() {
            // Given
            List<String> personSkills = Arrays.asList("Java", "Python");
            List<String> jobSkills = Arrays.asList("Java", "Python", "Spring Boot", "Docker", "Kubernetes");

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            // 2/5 * 100 = 40
            assertEquals(0, BigDecimal.valueOf(40).compareTo(score));
        }

        @Test
        @DisplayName("技能完全不匹配时返回0分")
        void calculateSkillScore_NoMatch() {
            // Given
            List<String> personSkills = Arrays.asList("Java", "Python");
            List<String> jobSkills = Arrays.asList("Go", "Rust", "C++");

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("人员无技能时返回0分")
        void calculateSkillScore_NoPersonSkills() {
            // Given
            List<String> personSkills = Arrays.asList();
            List<String> jobSkills = Arrays.asList("Java", "Python");

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("人员技能为空列表时返回0分")
        void calculateSkillScore_NullPersonSkills() {
            // Given
            List<String> personSkills = null;
            List<String> jobSkills = Arrays.asList("Java", "Python");

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("职位无技能要求时返回0分")
        void calculateSkillScore_NoJobSkills() {
            // Given
            List<String> personSkills = Arrays.asList("Java", "Python");
            List<String> jobSkills = Arrays.asList();

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("职位技能要求为空列表时返回0分")
        void calculateSkillScore_NullJobSkills() {
            // Given
            List<String> personSkills = Arrays.asList("Java", "Python");
            List<String> jobSkills = null;

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("技能模糊匹配成功")
        void calculateSkillScore_FuzzyMatch() {
            // Given - person has "Spring" and job requires "Spring Boot"
            List<String> personSkills = Arrays.asList("Spring");
            List<String> jobSkills = Arrays.asList("Spring Boot");

            // When
            BigDecimal score = matchDomainService.calculateSkillScore(personSkills, jobSkills);

            // Then
            assertNotNull(score);
            // Spring contains Spring Boot's substring or vice versa
            assertEquals(0, BigDecimal.valueOf(100).compareTo(score));
        }
    }

    @Nested
    @DisplayName("经验匹配度计算测试")
    class CalculateExperienceScoreTests {

        @Test
        @DisplayName("经验完全匹配时返回100分")
        void calculateExperienceScore_FullMatch() {
            // Given
            Integer personYears = 5;
            String jobExperience = "5-10年";

            // When
            BigDecimal score = matchDomainService.calculateExperienceScore(personYears, jobExperience);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("经验超过要求时返回100分")
        void calculateExperienceScore_ExceedRequirement() {
            // Given
            Integer personYears = 10;
            String jobExperience = "3-5年";

            // When
            BigDecimal score = matchDomainService.calculateExperienceScore(personYears, jobExperience);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("经验不足时返回相应分数")
        void calculateExperienceScore_Insufficient() {
            // Given
            Integer personYears = 2;
            String jobExperience = "3-5年";

            // When
            BigDecimal score = matchDomainService.calculateExperienceScore(personYears, jobExperience);

            // Then
            assertNotNull(score);
            // 2/3 * 100 ≈ 66.67
            assertTrue(score.compareTo(new BigDecimal("60")) > 0);
            assertTrue(score.compareTo(new BigDecimal("70")) < 0);
        }

        @Test
        @DisplayName("经验不限时返回100分")
        void calculateExperienceScore_NoLimit() {
            // Given
            Integer personYears = 0;
            String jobExperience = "经验不限";

            // When
            BigDecimal score = matchDomainService.calculateExperienceScore(personYears, jobExperience);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("人员无经验信息时返回0分")
        void calculateExperienceScore_NoPersonExperience() {
            // Given
            Integer personYears = null;
            String jobExperience = "3-5年";

            // When
            BigDecimal score = matchDomainService.calculateExperienceScore(personYears, jobExperience);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("解析数字经验要求")
        void calculateExperienceScore_NumericOnly() {
            // Given
            Integer personYears = 3;
            String jobExperience = "3年";

            // When
            BigDecimal score = matchDomainService.calculateExperienceScore(personYears, jobExperience);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }
    }

    @Nested
    @DisplayName("城市匹配度计算测试")
    class CalculateCityScoreTests {

        @Test
        @DisplayName("城市完全匹配时返回100分")
        void calculateCityScore_FullMatch() {
            // Given
            String targetCity = "北京";
            String jobCity = "北京";

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("目标城市包含职位城市时返回100分")
        void calculateCityScore_TargetContainsJob() {
            // Given
            String targetCity = "北京朝阳区";
            String jobCity = "北京";

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("职位城市包含目标城市时返回100分")
        void calculateCityScore_JobContainsTarget() {
            // Given
            String targetCity = "北京";
            String jobCity = "北京朝阳区";

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("城市不匹配时返回0分")
        void calculateCityScore_NoMatch() {
            // Given
            String targetCity = "北京";
            String jobCity = "上海";

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, BigDecimal.ZERO.compareTo(score));
        }

        @Test
        @DisplayName("人员无目标城市时返回50分")
        void calculateCityScore_NoTargetCity() {
            // Given
            String targetCity = null;
            String jobCity = "北京";

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }

        @Test
        @DisplayName("人员目标城市为空时返回50分")
        void calculateCityScore_EmptyTargetCity() {
            // Given
            String targetCity = "";
            String jobCity = "北京";

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }

        @Test
        @DisplayName("职位无城市要求时返回50分")
        void calculateCityScore_NoJobCity() {
            // Given
            String targetCity = "北京";
            String jobCity = null;

            // When
            BigDecimal score = matchDomainService.calculateCityScore(targetCity, jobCity);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }
    }

    @Nested
    @DisplayName("学历匹配度计算测试")
    class CalculateEducationScoreTests {

        @Test
        @DisplayName("学历完全匹配时返回100分")
        void calculateEducationScore_FullMatch() {
            // Given
            String education = "本科";
            String requiredEducation = "本科";

            // When
            BigDecimal score = matchDomainService.calculateEducationScore(education, requiredEducation);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("学历超过要求时返回100分")
        void calculateEducationScore_ExceedRequirement() {
            // Given
            String education = "硕士";
            String requiredEducation = "本科";

            // When
            BigDecimal score = matchDomainService.calculateEducationScore(education, requiredEducation);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("博士超过硕士要求时返回100分")
        void calculateEducationScore_DoctorExceedsMaster() {
            // Given
            String education = "博士";
            String requiredEducation = "硕士";

            // When
            BigDecimal score = matchDomainService.calculateEducationScore(education, requiredEducation);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("学历低于要求时返回较低分数")
        void calculateEducationScore_BelowRequirement() {
            // Given
            String education = "大专";
            String requiredEducation = "本科";

            // When
            BigDecimal score = matchDomainService.calculateEducationScore(education, requiredEducation);

            // Then
            assertNotNull(score);
            // 大专(2)/本科(3) * 100 ≈ 66.67
            assertTrue(score.compareTo(new BigDecimal("60")) > 0);
            assertTrue(score.compareTo(new BigDecimal("70")) < 0);
        }

        @Test
        @DisplayName("无学历要求时返回50分")
        void calculateEducationScore_NoRequirement() {
            // Given
            String education = "本科";
            String requiredEducation = null;

            // When
            BigDecimal score = matchDomainService.calculateEducationScore(education, requiredEducation);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }

        @Test
        @DisplayName("人员无学历信息时返回50分")
        void calculateEducationScore_NoPersonEducation() {
            // Given
            String education = null;
            String requiredEducation = "本科";

            // When
            BigDecimal score = matchDomainService.calculateEducationScore(education, requiredEducation);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }

        @Test
        @DisplayName("学历等级测试")
        void calculateEducationScore_AllLevels() {
            // 博士 = 5
            assertEquals(0, new BigDecimal("100").compareTo(
                    matchDomainService.calculateEducationScore("博士", "高中")));
            // 硕士 = 4
            assertEquals(0, new BigDecimal("100").compareTo(
                    matchDomainService.calculateEducationScore("硕士", "大专")));
            // 本科 = 3
            assertEquals(0, new BigDecimal("100").compareTo(
                    matchDomainService.calculateEducationScore("本科", "初中")));
            // 大专 = 2
            assertEquals(0, new BigDecimal("100").compareTo(
                    matchDomainService.calculateEducationScore("大专", "高中")));
        }
    }

    @Nested
    @DisplayName("薪资匹配度计算测试")
    class CalculateSalaryScoreTests {

        @Test
        @DisplayName("薪资在范围内时返回100分")
        void calculateSalaryScore_InRange() {
            // Given
            Integer expectedSalary = 20000;
            Integer salaryMin = 15000;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("期望薪资等于最低薪资时返回100分")
        void calculateSalaryScore_EqualsMin() {
            // Given
            Integer expectedSalary = 15000;
            Integer salaryMin = 15000;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("期望薪资等于最高薪资时返回100分")
        void calculateSalaryScore_EqualsMax() {
            // Given
            Integer expectedSalary = 30000;
            Integer salaryMin = 15000;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("期望薪资低于最低薪资时返回较低分数")
        void calculateSalaryScore_BelowMin() {
            // Given
            Integer expectedSalary = 10000;
            Integer salaryMin = 15000;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            // 10000/15000 * 100 ≈ 66.67
            assertTrue(score.compareTo(new BigDecimal("60")) > 0);
            assertTrue(score.compareTo(new BigDecimal("70")) < 0);
        }

        @Test
        @DisplayName("期望薪资高于最高薪资时返回较低分数")
        void calculateSalaryScore_AboveMax() {
            // Given
            Integer expectedSalary = 50000;
            Integer salaryMin = 15000;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            // 30000/50000 * 100 = 60
            assertTrue(score.compareTo(new BigDecimal("55")) > 0);
            assertTrue(score.compareTo(new BigDecimal("65")) < 0);
        }

        @Test
        @DisplayName("人员无期望薪资时返回50分")
        void calculateSalaryScore_NoExpectedSalary() {
            // Given
            Integer expectedSalary = null;
            Integer salaryMin = 15000;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }

        @Test
        @DisplayName("只有最低薪资时在范围内返回100分")
        void calculateSalaryScore_OnlyMin_InRange() {
            // Given
            Integer expectedSalary = 20000;
            Integer salaryMin = 15000;
            Integer salaryMax = null;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("只有最高薪资时在范围内返回100分")
        void calculateSalaryScore_OnlyMax_InRange() {
            // Given
            Integer expectedSalary = 20000;
            Integer salaryMin = null;
            Integer salaryMax = 30000;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("100").compareTo(score));
        }

        @Test
        @DisplayName("薪资范围都为null时返回50分")
        void calculateSalaryScore_BothNull() {
            // Given
            Integer expectedSalary = 20000;
            Integer salaryMin = null;
            Integer salaryMax = null;

            // When
            BigDecimal score = matchDomainService.calculateSalaryScore(expectedSalary, salaryMin, salaryMax);

            // Then
            assertNotNull(score);
            assertEquals(0, new BigDecimal("50").compareTo(score));
        }
    }

    @Nested
    @DisplayName("综合匹配度计算测试")
    class CalculateOverallScoreTests {

        @Test
        @DisplayName("所有维度满分时综合分为满分")
        void calculateOverallScore_AllPerfect() {
            // Given
            BigDecimal skillScore = new BigDecimal("100");
            BigDecimal experienceScore = new BigDecimal("100");
            BigDecimal cityScore = new BigDecimal("100");
            BigDecimal educationScore = new BigDecimal("100");
            BigDecimal salaryScore = new BigDecimal("100");

            // When
            BigDecimal overallScore = matchDomainService.calculateOverallScore(
                    skillScore, experienceScore, cityScore, educationScore, salaryScore);

            // Then
            assertNotNull(overallScore);
            // 权重: skill=0.35, experience=0.20, city=0.15, education=0.15, salary=0.15
            // 100*0.35 + 100*0.20 + 100*0.15 + 100*0.15 + 100*0.15 = 100
            assertEquals(0, new BigDecimal("100.00").compareTo(overallScore));
        }

        @Test
        @DisplayName("各维度不同分数时综合分为加权平均")
        void calculateOverallScore_MixedScores() {
            // Given
            BigDecimal skillScore = new BigDecimal("80");
            BigDecimal experienceScore = new BigDecimal("60");
            BigDecimal cityScore = new BigDecimal("100");
            BigDecimal educationScore = new BigDecimal("40");
            BigDecimal salaryScore = new BigDecimal("100");

            // When
            BigDecimal overallScore = matchDomainService.calculateOverallScore(
                    skillScore, experienceScore, cityScore, educationScore, salaryScore);

            // Then
            assertNotNull(overallScore);
            // 80*0.35 + 60*0.20 + 100*0.15 + 40*0.15 + 100*0.15
            // = 28 + 12 + 15 + 6 + 15 = 76
            assertEquals(0, new BigDecimal("76.00").compareTo(overallScore));
        }

        @Test
        @DisplayName("所有维度零分时综合分为零")
        void calculateOverallScore_AllZero() {
            // Given
            BigDecimal skillScore = BigDecimal.ZERO;
            BigDecimal experienceScore = BigDecimal.ZERO;
            BigDecimal cityScore = BigDecimal.ZERO;
            BigDecimal educationScore = BigDecimal.ZERO;
            BigDecimal salaryScore = BigDecimal.ZERO;

            // When
            BigDecimal overallScore = matchDomainService.calculateOverallScore(
                    skillScore, experienceScore, cityScore, educationScore, salaryScore);

            // Then
            assertNotNull(overallScore);
            assertEquals(0, BigDecimal.ZERO.compareTo(overallScore.setScale(2, RoundingMode.HALF_UP)));
        }

        @Test
        @DisplayName("综合分保留两位小数")
        void calculateOverallScore_DecimalPrecision() {
            // Given
            BigDecimal skillScore = new BigDecimal("77");
            BigDecimal experienceScore = new BigDecimal("77");
            BigDecimal cityScore = new BigDecimal("77");
            BigDecimal educationScore = new BigDecimal("77");
            BigDecimal salaryScore = new BigDecimal("77");

            // When
            BigDecimal overallScore = matchDomainService.calculateOverallScore(
                    skillScore, experienceScore, cityScore, educationScore, salaryScore);

            // Then
            assertNotNull(overallScore);
            assertEquals(2, overallScore.scale());
        }

        @Test
        @DisplayName("技能权重最高")
        void calculateOverallScore_SkillHasHighestWeight() {
            // Given - only skill score is 100, others are 0
            BigDecimal skillScore = new BigDecimal("100");
            BigDecimal experienceScore = BigDecimal.ZERO;
            BigDecimal cityScore = BigDecimal.ZERO;
            BigDecimal educationScore = BigDecimal.ZERO;
            BigDecimal salaryScore = BigDecimal.ZERO;

            // When
            BigDecimal overallScore = matchDomainService.calculateOverallScore(
                    skillScore, experienceScore, cityScore, educationScore, salaryScore);

            // Then
            assertNotNull(overallScore);
            // 100 * 0.35 = 35
            assertEquals(0, new BigDecimal("35.00").compareTo(overallScore));
        }
    }
}
