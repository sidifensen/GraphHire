package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.io.file.FileNameUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.config.UploadProperties;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/person")
public class PersonAvatarController {

    @Autowired
    private PersonInfoRepository personInfoRepository;

    @Autowired
    private RustFSClient rustFSClient;
    @Autowired
    private UploadProperties uploadProperties;

    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Long userId = StpUtil.getLoginIdAsLong();

        long maxFileSize = uploadProperties.getAvatar().getMaxFileSize().toBytes();
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("文件大小不能超过" + uploadProperties.getAvatar().getMaxFileSize().toMegabytes() + "MB");
        }

        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        if (!contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = FileNameUtil.extName(originalFilename);
        if (ext.isBlank()) {
            ext = "jpg";
        }
        String filename = "avatar/user_" + userId + "_" + System.currentTimeMillis() + "." + ext;

        try {
            String avatarPath = rustFSClient.upload(file.getBytes(), filename);

            PersonInfo personInfo = personInfoRepository.findByUserId(userId)
                .orElseGet(() -> {
                    PersonInfo newInfo = new PersonInfo();
                    newInfo.setUserId(userId);
                    return newInfo;
                });
            personInfo.setAvatarUrl(avatarPath);
            personInfoRepository.save(personInfo);

            return Result.success("/person/avatar/public/" + userId);
        } catch (IOException e) {
            throw new RuntimeException("上传头像失败: " + e.getMessage());
        }
    }

    @GetMapping("/avatar")
    public Result<String> getAvatar() {
        Long userId = StpUtil.getLoginIdAsLong();

        PersonInfo personInfo = personInfoRepository.findByUserId(userId)
            .orElse(null);

        if (personInfo == null || personInfo.getAvatarUrl() == null) {
            return Result.success(null);
        }
        return Result.success("/person/avatar/public/" + userId);
    }

    @GetMapping("/avatar/public/{userId}")
    public ResponseEntity<byte[]> getAvatarPublic(@PathVariable Long userId) {
        PersonInfo personInfo = personInfoRepository.findByUserId(userId).orElse(null);
        if (personInfo == null || personInfo.getAvatarUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] data = rustFSClient.download(personInfo.getAvatarUrl());
        MediaType mediaType = detectMediaType(personInfo.getAvatarUrl());
        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
            .contentType(mediaType)
            .body(data);
    }

    private MediaType detectMediaType(String filePath) {
        String ext = FileNameUtil.extName(filePath).toLowerCase(Locale.ROOT);
        return switch (ext) {
            case "png" -> MediaType.IMAGE_PNG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.IMAGE_JPEG;
        };
    }
}
