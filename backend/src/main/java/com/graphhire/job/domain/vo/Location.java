package com.graphhire.job.domain.vo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 工作地点值对象
 *
 * 【模块说明】表示职位的地理位置信息，包含城市、区县和详细地址。
 *            支持组合完整地址的构建。
 */
public final class Location {
    /** 城市 */
    private final String city;
    /** 区县 */
    private final String district;
    /** 详细地址 */
    private final String detailAddress;

    private Location(String city, String district, String detailAddress) {
        this.city = city;
        this.district = district;
        this.detailAddress = detailAddress;
    }

    /** 工厂方法：创建完整地点（包含详细地址） */
    @JsonCreator
    public static Location of(@JsonProperty("city") String city,
                              @JsonProperty("district") String district,
                              @JsonProperty("detailAddress") String detailAddress) {
        return new Location(city, district, detailAddress);
    }

    /** 工厂方法：创建地点（不含详细地址） */
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

    /** 获取完整地址（城市 + 区县 + 详细地址，空值自动省略） */
    public String getFullAddress() {
        if (detailAddress == null || detailAddress.isEmpty()) {
            return city + (district != null ? " " + district : "");
        }
        return city + (district != null ? " " + district : "") + " " + detailAddress;
    }
}
