import type { ProvinceCityItem } from '@/lib/api/public';
import { DEFAULT_CITY_OPTIONS, HOT_CITY_PRIORITY } from './constants';

export function normalizeCityName(raw?: string | null) {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/(特别行政区|自治区|自治州|地区|盟|市)$/u, '');
}

export function buildHotCityOptions(provinceCities: ProvinceCityItem[]) {
  const pool = new Set<string>();
  for (const item of provinceCities) {
    for (const city of item.cities ?? []) {
      const normalized = normalizeCityName(city);
      if (normalized) pool.add(normalized);
    }
  }
  const hotCities = HOT_CITY_PRIORITY.filter((city) => pool.has(city));
  return hotCities.length > 0 ? ['全国', ...hotCities] : DEFAULT_CITY_OPTIONS;
}

