package com.graphhire.job.infrastructure.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component
public class RustFSClient {

    @Value("${rustfs.endpoint:http://localhost:8081}")
    private String endpoint;

    public String upload(byte[] fileBytes, String fileName) {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
        String filePath = "jobs/" + uniqueFileName;
        return endpoint + "/" + filePath;
    }

    public String upload(MultipartFile file) throws IOException {
        return upload(file.getBytes(), file.getOriginalFilename());
    }

    public void delete(String filePath) {
    }

    public byte[] download(String filePath) {
        return new byte[0];
    }
}
