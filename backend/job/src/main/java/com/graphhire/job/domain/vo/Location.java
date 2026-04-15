package com.graphhire.job.domain.vo;

public final class Location {
    private final String city;
    private final String district;
    private final String detailAddress;

    private Location(String city, String district, String detailAddress) {
        this.city = city;
        this.district = district;
        this.detailAddress = detailAddress;
    }

    public static Location of(String city, String district, String detailAddress) {
        return new Location(city, district, detailAddress);
    }

    public static Location of(String city, String district) {
        return new Location(city, district, null);
    }

    public String getCity() {
        return city;
    }

    public String getDistrict() {
        return district;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public String getFullAddress() {
        if (detailAddress == null || detailAddress.isEmpty()) {
            return city + (district != null ? " " + district : "");
        }
        return city + (district != null ? " " + district : "") + " " + detailAddress;
    }
}
