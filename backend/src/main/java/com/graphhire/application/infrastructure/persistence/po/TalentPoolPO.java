package com.graphhire.application.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("talent_pool")
public class TalentPoolPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long companyId;
    private Long resumeId;
    private LocalDateTime addedAt;
    private String note;
    private String status;
}
