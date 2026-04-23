package com.graphhire.admin.application.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminSettingsService {

    private final ConcurrentHashMap<String, Object> settings = new ConcurrentHashMap<>();

    public AdminSettingsService() {
        settings.put("allowRegister", true);
        settings.put("maintenanceMode", false);
        settings.put("maxUploadSizeMb", 20);
    }

    public Map<String, Object> getSettings() {
        return Map.copyOf(settings);
    }

    public Map<String, Object> updateSettings(Map<String, Object> updates) {
        if (updates != null) {
            settings.putAll(updates);
        }
        return getSettings();
    }
}

