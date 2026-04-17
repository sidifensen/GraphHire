package com.graphhire.application.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.graphhire.application.domain.model.ApplicationStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("application")
public class ApplicationPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long resumeId;
    private Long jobId;
    private Long userId;
    private Long companyId;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String note;
}
