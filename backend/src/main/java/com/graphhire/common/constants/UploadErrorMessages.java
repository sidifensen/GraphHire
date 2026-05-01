package com.graphhire.common.constants;

import java.util.Locale;
import java.util.Set;

public final class UploadErrorMessages {

    private UploadErrorMessages() {
    }

    public static final String RESUME_LIMIT_REACHED = "最多上传3份简历，请先删除旧简历";
    public static final String RESUME_INVALID_MIME = "简历文件类型不合法，请上传 PDF、DOC、DOCX 文件";
    public static final String AVATAR_INVALID_TYPE = "只能上传图片文件";
    public static final String UPLOAD_SIZE_EXCEEDED = "文件超过上传大小限制";
    public static final String UPLOAD_FAILED_GENERIC = "文件上传失败，请检查文件格式和大小";

    public static String resumeInvalidExtension(Set<String> extensions) {
        return "仅支持上传 " + String.join("、", extensions).toUpperCase(Locale.ROOT) + " 格式的简历";
    }

    public static String resumeTooLarge(long maxMb) {
        return "简历文件超过大小限制，最大支持 " + maxMb + "MB";
    }

    public static String avatarTooLarge(long maxMb) {
        return "文件大小不能超过" + maxMb + "MB";
    }

    public static String avatarUploadFailed(String detail) {
        return "上传头像失败: " + detail;
    }

    public static String companyAvatarUploadFailed(String detail) {
        return "上传企业头像失败: " + detail;
    }
}
