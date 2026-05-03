export const HOT_CITY_PRIORITY = ['北京', '上海', '广州', '深圳', '杭州', '武汉', '成都', '南京', '重庆', '西安', '天津', '苏州'];

export const DEFAULT_CITY_OPTIONS = ['全国', ...HOT_CITY_PRIORITY];

export const HOT_INDUSTRY_PRIORITY = [
  '电子商务',
  '游戏',
  '社交网络与媒体',
  '广告营销',
  '大数据',
  '医疗健康',
  '生活服务',
  '计算机软件',
  '通信设备',
];

export const COMPANY_SCALE_OPTIONS = [
  { label: '0-20人', value: '1' },
  { label: '20-99人', value: '2' },
  { label: '100-499人', value: '3' },
  { label: '500-999人', value: '4' },
  { label: '1000-9999人', value: '5' },
  { label: '10000人以上', value: '6' },
];

export function formatCompanyScale(scale?: string | null) {
  if (!scale) return '未知规模';
  return COMPANY_SCALE_OPTIONS.find((item) => item.value === scale)?.label ?? scale;
}

