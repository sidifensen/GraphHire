export interface ProvinceCityItem {
  province: string;
  cities: string[];
}

export const CHINA_PROVINCES_CITIES: ProvinceCityItem[] = [
  { province: '北京', cities: ['北京'] },
  { province: '上海', cities: ['上海'] },
  { province: '天津', cities: ['天津'] },
  { province: '重庆', cities: ['重庆'] },
  { province: '广东', cities: ['广州', '深圳', '珠海', '东莞', '佛山'] },
  { province: '浙江', cities: ['杭州', '宁波', '温州', '绍兴', '嘉兴'] },
  { province: '江苏', cities: ['南京', '苏州', '无锡', '常州', '南通'] },
  { province: '四川', cities: ['成都', '绵阳', '德阳', '乐山'] },
  { province: '湖北', cities: ['武汉', '宜昌', '襄阳'] },
  { province: '陕西', cities: ['西安', '咸阳', '宝鸡'] },
  { province: '山东', cities: ['济南', '青岛', '烟台', '潍坊'] },
  { province: '福建', cities: ['福州', '厦门', '泉州'] },
  { province: '辽宁', cities: ['沈阳', '大连', '鞍山'] },
  { province: '吉林', cities: ['长春', '吉林'] },
  { province: '黑龙江', cities: ['哈尔滨', '大庆'] },
  { province: '河南', cities: ['郑州', '洛阳', '许昌'] },
  { province: '江西', cities: ['南昌', '九江', '赣州'] },
  { province: '湖南', cities: ['长沙', '株洲', '湘潭'] },
  { province: '安徽', cities: ['合肥', '芜湖', '蚌埠'] },
  { province: '河北', cities: ['石家庄', '唐山', '保定'] },
];
