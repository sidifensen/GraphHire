package com.graphhire.job.interface.controller;

import com.graphhire.common.vo.Result;
import com.graphhire.job.application.command.PublishJobCmd;
import com.graphhire.job.application.service.JobAppService;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job")
public class JobController {

    @Autowired
    private JobAppService jobAppService;

    @PostMapping("/create")
    public Result<Long> createJob(@RequestParam Long companyId,
                                  @RequestParam String title,
                                  @RequestParam(required = false) String department,
                                  @RequestParam(required = false) Integer headcount,
                                  @RequestParam(required = false) String city,
                                  @RequestParam(required = false) String district,
                                  @RequestParam(required = false) String detailAddress,
                                  @RequestParam(required = false) Integer salaryMin,
                                  @RequestParam(required = false) Integer salaryMax,
                                  @RequestParam(required = false) String salaryUnit,
                                  @RequestParam(required = false) List<String> requiredSkills,
                                  @RequestParam(required = false) List<String> preferredSkills,
                                  @RequestParam(required = false) String description) {
        Location location = Location.of(city, district, detailAddress);
        SalaryRange salaryRange = SalaryRange.of(salaryMin, salaryMax, salaryUnit);
        Job job = jobAppService.createJob(companyId, title, department, headcount,
                location, salaryRange, requiredSkills, preferredSkills, description);
        return Result.success(job.getId());
    }

    @PostMapping("/{id}/publish")
    public Result<Long> publishJob(@PathVariable Long id, @RequestBody PublishJobCmd cmd) {
        Job job = jobAppService.publishJob(id, cmd);
        return Result.success(job.getId());
    }

    @PostMapping("/{id}/close")
    public Result<Void> closeJob(@PathVariable Long id) {
        jobAppService.closeJob(id);
        return Result.success();
    }

    @PutMapping("/{id}/salary")
    public Result<Void> updateSalary(@PathVariable Long id,
                                     @RequestParam Integer min,
                                     @RequestParam Integer max,
                                     @RequestParam String unit) {
        SalaryRange salaryRange = SalaryRange.of(min, max, unit);
        jobAppService.updateSalary(id, salaryRange);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Job> getJob(@PathVariable Long id) {
        return Result.success(jobAppService.getJobById(id));
    }

    @GetMapping("/company/{companyId}")
    public Result<List<Job>> getJobsByCompany(@PathVariable Long companyId) {
        return Result.success(jobAppService.getJobsByCompany(companyId));
    }

    @GetMapping("/published")
    public Result<List<Job>> getPublishedJobs() {
        return Result.success(jobAppService.getPublishedJobs());
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteJob(@PathVariable Long id) {
        jobAppService.deleteJob(id);
        return Result.success();
    }
}
