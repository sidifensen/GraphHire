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

    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Long userId = StpUtil.getLoginIdAsLong();

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("文件大小不能超过2MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = userId + "_" + System.currentTimeMillis() + extension;

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            String avatarUrl = "/avatars/" + filename;

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

    @GetMapping("/avatar")
    public Result<String> getAvatar() {
        Long userId = StpUtil.getLoginIdAsLong();

        PersonInfo personInfo = personInfoRepository.findByUserId(userId)
            .orElse(null);

        if (personInfo != null && personInfo.getAvatarUrl() != null) {
            return Result.success(personInfo.getAvatarUrl());
        }

        return Result.success("/avatars/default.png");
    }
}