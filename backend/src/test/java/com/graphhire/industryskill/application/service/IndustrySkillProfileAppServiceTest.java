package com.graphhire.industryskill.application.service;

import com.graphhire.industryskill.domain.model.IndustrySkillProfile;
import com.graphhire.industryskill.domain.repository.IndustrySkillProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndustrySkillProfileAppServiceTest {

    @Mock
    private IndustrySkillProfileRepository repository;

    @InjectMocks
    private IndustrySkillProfileAppService appService;

    @Test
    @DisplayName("按行业ID查询技能分类配置")
    void shouldGetProfileByPositionTypeId() {
        IndustrySkillProfile profile = new IndustrySkillProfile();
        profile.setId(10L);
        profile.setPositionTypeId(100101L);
        profile.setProfileJson("{\"categories\":[{\"code\":\"backend\",\"name\":\"后端开发\"}]}");
        when(repository.findByPositionTypeId(100101L)).thenReturn(Optional.of(profile));

        Optional<IndustrySkillProfile> result = appService.getByPositionTypeId(100101L);

        assertTrue(result.isPresent());
        assertEquals(100101L, result.get().getPositionTypeId());
        assertEquals("{\"categories\":[{\"code\":\"backend\",\"name\":\"后端开发\"}]}", result.get().getProfileJson());
    }

    @Test
    @DisplayName("保存或更新技能分类配置")
    void shouldSaveOrUpdateProfile() {
        IndustrySkillProfile saved = new IndustrySkillProfile();
        saved.setId(11L);
        saved.setPositionTypeId(100102L);
        saved.setProfileJson("{\"categories\":[{\"code\":\"frontend\",\"name\":\"前端开发\"}]}");
        when(repository.save(any(IndustrySkillProfile.class))).thenReturn(saved);

        IndustrySkillProfile result = appService.saveOrUpdate(
            100102L,
            "{\"categories\":[{\"code\":\"frontend\",\"name\":\"前端开发\"}]}"
        );

        assertEquals(100102L, result.getPositionTypeId());
        assertEquals("{\"categories\":[{\"code\":\"frontend\",\"name\":\"前端开发\"}]}", result.getProfileJson());
        verify(repository).save(any(IndustrySkillProfile.class));
    }
}
