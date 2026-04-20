package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.io.FileUtil;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.springframework.stereotype.Component;

@Component
public class FileContentLoader {

    private static final String S3_PREFIX = "s3://";

    private final RustFSClient rustFSClient;

    public FileContentLoader(RustFSClient rustFSClient) {
        this.rustFSClient = rustFSClient;
    }

    public byte[] load(String filePath) {
        if (filePath != null && filePath.startsWith(S3_PREFIX)) {
            return rustFSClient.download(filePath);
        }
        return FileUtil.readBytes(filePath);
    }
}
