package com.graphhire.job.interfaces.dto.request;

public class CompanyProfileUpdateRequest {
    private String name;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String description;
    private String website;
    private Long industryId;
    private String scale;
    private String address;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public Long getIndustryId() { return industryId; }
    public void setIndustryId(Long industryId) { this.industryId = industryId; }
    public String getScale() { return scale; }
    public void setScale(String scale) { this.scale = scale; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
