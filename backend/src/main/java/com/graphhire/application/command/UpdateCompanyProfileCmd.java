package com.graphhire.application.command;

import lombok.Data;

@Data
public class UpdateCompanyProfileCmd {
    private String companyName;
    private String licensePath;
}
