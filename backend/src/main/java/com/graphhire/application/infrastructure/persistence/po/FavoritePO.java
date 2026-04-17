package com.graphhire.application.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("favorite")
public class FavoritePO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long jobId;
    private LocalDateTime createdAt;
}
