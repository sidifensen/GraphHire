package com.graphhire.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DataSizeUnit;
import org.springframework.stereotype.Component;
import org.springframework.util.unit.DataSize;
import org.springframework.util.unit.DataUnit;

import java.util.LinkedHashSet;
import java.util.Set;

@Component
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {

    private final Resume resume = new Resume();
    private final Avatar avatar = new Avatar();

    public Resume getResume() {
        return resume;
    }

    public Avatar getAvatar() {
        return avatar;
    }

    public static class Resume {
        @DataSizeUnit(DataUnit.MEGABYTES)
        private DataSize maxFileSize = DataSize.ofMegabytes(10);
        private Set<String> allowedExtensions = new LinkedHashSet<>(Set.of("pdf", "doc", "docx"));
        private Set<String> allowedMimeTypes = new LinkedHashSet<>(
            Set.of("application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );

        public DataSize getMaxFileSize() {
            return maxFileSize;
        }

        public void setMaxFileSize(DataSize maxFileSize) {
            this.maxFileSize = maxFileSize;
        }

        public Set<String> getAllowedExtensions() {
            return allowedExtensions;
        }

        public void setAllowedExtensions(Set<String> allowedExtensions) {
            this.allowedExtensions = allowedExtensions;
        }

        public Set<String> getAllowedMimeTypes() {
            return allowedMimeTypes;
        }

        public void setAllowedMimeTypes(Set<String> allowedMimeTypes) {
            this.allowedMimeTypes = allowedMimeTypes;
        }
    }

    public static class Avatar {
        private DataSize maxFileSize = DataSize.ofMegabytes(2);

        public DataSize getMaxFileSize() {
            return maxFileSize;
        }

        public void setMaxFileSize(DataSize maxFileSize) {
            this.maxFileSize = maxFileSize;
        }
    }
}
