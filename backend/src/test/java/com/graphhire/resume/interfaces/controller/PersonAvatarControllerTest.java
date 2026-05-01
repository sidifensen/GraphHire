package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.config.UploadProperties;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.springframework.util.unit.DataSize;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PersonAvatarControllerTest {

    @Mock
    private PersonInfoRepository personInfoRepository;

    @Mock
    private RustFSClient rustFSClient;
    @Mock
    private UploadProperties uploadProperties;

    @InjectMocks
    private PersonAvatarController personAvatarController;

    @Test
    @DisplayName("上传头像时应写入 RustFS 并保存头像路径")
    void uploadAvatar_ShouldSaveRustfsPath() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(101L);
            when(personInfoRepository.findByUserId(101L)).thenReturn(Optional.empty());
            when(rustFSClient.upload(any(), any())).thenReturn("s3://resumes/avatars/101.png");
            UploadProperties.Avatar avatar = new UploadProperties.Avatar();
            avatar.setMaxFileSize(DataSize.ofMegabytes(2));
            when(uploadProperties.getAvatar()).thenReturn(avatar);

            MockMultipartFile file = new MockMultipartFile(
                "file",
                "u.png",
                "image/png",
                "avatar".getBytes(StandardCharsets.UTF_8)
            );

            var result = personAvatarController.uploadAvatar(file);

            assertNotNull(result.getData());
            assertEquals("/person/avatar/public/101", result.getData());
            verify(rustFSClient).upload(any(), any());
            ArgumentCaptor<PersonInfo> captor = ArgumentCaptor.forClass(PersonInfo.class);
            verify(personInfoRepository).save(captor.capture());
            assertEquals("s3://resumes/avatars/101.png", captor.getValue().getAvatarUrl());
        }
    }
}
