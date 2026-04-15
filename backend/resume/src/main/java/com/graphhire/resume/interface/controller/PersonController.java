package com.graphhire.resume.interface.controller;

import com.graphhire.common.vo.Result;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/person")
public class PersonController {

    @GetMapping("/{id}/resume")
    public Result<Object> getResume(@PathVariable Long id) {
        return Result.success(null);
    }

    @PostMapping("/{id}/resume")
    public Result<Object> createResume(@PathVariable Long id) {
        return Result.success(null);
    }

    @PutMapping("/{id}/resume")
    public Result<Object> updateResume(@PathVariable Long id) {
        return Result.success(null);
    }
}
