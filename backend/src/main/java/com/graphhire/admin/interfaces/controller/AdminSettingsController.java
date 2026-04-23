package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.service.AdminSettingsService;
import com.graphhire.common.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    public AdminSettingsController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping
    public Result<Map<String, Object>> getSettings() {
        return Result.success(adminSettingsService.getSettings());
    }

    @PutMapping
    public Result<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> updates) {
        return Result.success(adminSettingsService.updateSettings(updates));
    }
}

