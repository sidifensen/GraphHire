'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/app/(user)/_mock/components/Skeleton';
import { publicApi, type Company, type ProvinceCityItem } from '@/lib/api/public';
import { getApiBaseUrl } from '@/lib/api/base-url';
import {
  COMPANY_SCALE_OPTIONS,
  DEFAULT_CITY_OPTIONS,
  HOT_INDUSTRY_PRIORITY,
  formatCompanyScale,
} from '@/features/user-filters/constants';
import { IndustryFilterModal } from '@/features/user-filters/IndustryFilterModal';
import { LocationFilterModal } from '@/features/user-filters/LocationFilterModal';
import { buildHotCityOptions, normalizeCityName } from '@/features/user-filters/location';
import { collectLeafNameSet, flattenLeafNameMap } from '@/features/user-filters/tree';

const STORAGE_KEY = 'graphhire.user.companies.filters.v1';
const DEFAULT_AVATAR = '/default-avatar.svg';
const FALLBACK_PROVINCE_CITIES: ProvinceCityItem[] = [
  { province: '北京市', cities: ['北京市'] },
  { province: '上海市', cities: ['上海市'] },
  { province: '天津市', cities: ['天津市'] },
  { province: '重庆市', cities: ['重庆市'] },
  { province: '广东省', cities: ['广州', '深圳', '珠海', '东莞', '佛山'] },
  { province: '浙江省', cities: ['杭州', '宁波', '温州', '绍兴', '嘉兴'] },
  { province: '江苏省', cities: ['南京', '苏州', '无锡', '常州', '南通'] },
  { province: '四川省', cities: ['成都', '绵阳', '德阳', '乐山'] },
  { province: '湖北省', cities: ['武汉', '宜昌', '襄阳'] },
  { province: '陕西省', cities: ['西安', '咸阳', '宝鸡'] },
];

function resolveLogoUrl(url?: string | null) {
  if (!url) return DEFAULT_AVATAR;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  if (url.startsWith('/')) return `${getApiBaseUrl()}${url}`;
  return `${getApiBaseUrl()}/${url}`;
}

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metadataReady, setMetadataReady] = useState(false);
  const [restored, setRestored] = useState(false);

  const [industryTree, setIndustryTree] = useState<any[]>([]);
  const [provinceCities, setProvinceCities] = useState<ProvinceCityItem[]>(FALLBACK_PROVINCE_CITIES);
  const [cityQuickOptions, setCityQuickOptions] = useState<string[]>(DEFAULT_CITY_OPTIONS);
  const [activeProvince, setActiveProvince] = useState(FALLBACK_PROVINCE_CITIES[0].province);

  const [selectedIndustryNames, setSelectedIndustryNames] = useState<string[]>([]);
  const [selectedCityNames, setSelectedCityNames] = useState<string[]>([]);
  const [selectedScaleCode, setSelectedScaleCode] = useState<string | undefined>(undefined);

  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [draftIndustryNames, setDraftIndustryNames] = useState<string[]>([]);
  const [draftCityNames, setDraftCityNames] = useState<string[]>([]);
  const [activeIndustryRootId, setActiveIndustryRootId] = useState<number | null>(null);
  const [activeIndustryMidId, setActiveIndustryMidId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const [industryData, provinceData] = await Promise.all([
        publicApi.jobs.getIndustryTree().catch(() => []),
        publicApi.jobs.getProvinceCities().catch(() => FALLBACK_PROVINCE_CITIES),
      ]);
      if (!active) return;

      setIndustryTree(industryData);
      setActiveIndustryRootId(industryData[0]?.id ?? null);
      setActiveIndustryMidId(industryData[0]?.children?.[0]?.id ?? null);

      const normalized = provinceData
        .filter((item) => item && typeof item.province === 'string' && Array.isArray(item.cities))
        .map((item) => ({
          province: item.province.trim(),
          cities: item.cities.map((city) => city.trim()).filter(Boolean),
        }))
        .filter((item) => item.province && item.cities.length > 0);

      if (normalized.length > 0) {
        setProvinceCities(normalized);
        setActiveProvince(normalized[0].province);
        setCityQuickOptions(buildHotCityOptions(normalized));
      }

      setMetadataReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  const industryLeafMap = useMemo(() => flattenLeafNameMap(industryTree), [industryTree]);
  const industryLeafSet = useMemo(() => collectLeafNameSet(industryTree), [industryTree]);
  const hotIndustryOptions = useMemo(() => {
    const hot = HOT_INDUSTRY_PRIORITY.filter((name) => industryLeafSet.has(name));
    return ['不限', ...hot];
  }, [industryLeafSet]);

  useEffect(() => {
    if (!metadataReady || restored) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setRestored(true);
        return;
      }
      const parsed = JSON.parse(raw) as {
        keyword?: string;
        cityNames?: string[];
        industryNames?: string[];
        companyScaleCode?: string;
      };

      if (typeof parsed.keyword === 'string') {
        setSearch(parsed.keyword);
      }

      const validIndustryNames = (parsed.industryNames ?? []).filter((name) => industryLeafMap.has(name));
      setSelectedIndustryNames(Array.from(new Set(validIndustryNames)));

      const cityPool = new Set(
        provinceCities.flatMap((item) => item.cities.map((city) => city.trim())).filter(Boolean),
      );
      const validCityNames = (parsed.cityNames ?? []).filter((city) => cityPool.has(city));
      setSelectedCityNames(Array.from(new Set(validCityNames)));

      if (parsed.companyScaleCode && COMPANY_SCALE_OPTIONS.some((item) => item.value === parsed.companyScaleCode)) {
        setSelectedScaleCode(parsed.companyScaleCode);
      }
    } catch {
      // ignore broken local cache
    }

    setRestored(true);
  }, [metadataReady, restored, industryLeafMap, provinceCities]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        keyword: search,
        cityNames: selectedCityNames,
        industryNames: selectedIndustryNames,
        companyScaleCode: selectedScaleCode,
      }),
    );
  }, [restored, search, selectedCityNames, selectedIndustryNames, selectedScaleCode]);

  useEffect(() => {
    if (!metadataReady || !restored) return;

    const industryLeafIds = selectedIndustryNames
      .map((name) => industryLeafMap.get(name))
      .filter((id): id is number => typeof id === 'number');

    const cityList = selectedCityNames
      .map((city) => normalizeCityName(city))
      .filter(Boolean);

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await publicApi.companies.search({
          keyword: search.trim() || undefined,
          industryLeafIds: industryLeafIds.length > 0 ? industryLeafIds : undefined,
          cityList: cityList.length > 0 ? cityList : undefined,
          companyScaleCode: selectedScaleCode,
          page: 1,
          size: 20,
        });
        setCompanies(result.records ?? []);
      } catch (err) {
        setCompanies([]);
        setError(err instanceof Error ? err.message : '公司列表加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [metadataReady, restored, search, selectedIndustryNames, selectedCityNames, selectedScaleCode, industryLeafMap]);

  const toggleHotIndustry = (name: string) => {
    if (name === '不限') {
      setSelectedIndustryNames([]);
      return;
    }
    setSelectedIndustryNames((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const toggleHotCity = (name: string) => {
    if (name === '全国') {
      setSelectedCityNames([]);
      return;
    }
    setSelectedCityNames((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-background pb-24 md:pb-12">
      <main className="mx-auto mt-6 flex w-full max-w-[1200px] flex-col gap-6 px-5 md:px-8">
        <div className="flex w-full md:w-3/4 md:mx-0">
          <div className="flex h-12 flex-1 items-center overflow-hidden rounded-l-lg border border-primary bg-surface-lowest shadow-sm md:border-2 md:border-r-0 md:border-primary">
            <Search className="ml-3 mr-2 text-outline" size={16} />
            <input
              type="text"
              placeholder="搜索公司"
              className="h-full flex-1 bg-transparent px-1 text-body-md outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="h-12 rounded-r-lg bg-primary px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 md:px-10 md:text-base">
            搜索
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-surface-lowest p-4 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-on-surface-variant">公司地点</span>
            {cityQuickOptions.slice(0, 10).map((city) => {
              const active = city === '全国' ? selectedCityNames.length === 0 : selectedCityNames.includes(city);
              return (
                <button
                  key={city}
                  onClick={() => toggleHotCity(city)}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    active ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  {city}
                </button>
              );
            })}
            <button onClick={() => { setDraftCityNames(selectedCityNames); setShowLocationModal(true); }} className="rounded-lg px-3 py-1 text-sm text-primary hover:bg-primary/5">
              更多地点
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-on-surface-variant">行业类型</span>
            {hotIndustryOptions.map((name) => {
              const active = name === '不限' ? selectedIndustryNames.length === 0 : selectedIndustryNames.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleHotIndustry(name)}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    active ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  {name}
                </button>
              );
            })}
            <button onClick={() => { setDraftIndustryNames(selectedIndustryNames); setShowIndustryModal(true); }} className="rounded-lg px-3 py-1 text-sm text-primary hover:bg-primary/5">
              更多行业
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-on-surface-variant">公司规模</span>
            <div className="w-56">
              <Select value={selectedScaleCode ?? 'all'} onValueChange={(value) => setSelectedScaleCode(value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="不限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限</SelectItem>
                  {COMPANY_SCALE_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCityNames([]);
                setSelectedIndustryNames([]);
                setSelectedScaleCode(undefined);
              }}
              className="text-sm text-on-surface-variant hover:text-primary"
            >
              清空筛选
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="h-[160px] rounded-2xl border border-surface-mid/50 bg-surface-lowest p-5 shadow-sm">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="mt-4 h-10 w-full rounded-lg" />
                </div>
              ))
            : companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="flex flex-col rounded-2xl border border-surface-mid/80 bg-surface-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-surface-mid/60 bg-white p-1.5">
                      <img src={resolveLogoUrl(company.avatarUrl)} className="h-full w-full rounded object-contain" alt={company.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-black text-on-surface">{company.name}</h3>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{company.city || '地点待补充'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded bg-surface-low px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">{company.industryName || '未知行业'}</span>
                    <span className="rounded bg-surface-low px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">{formatCompanyScale(company.scale)}</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">在招 {company.jobCount ?? 0}</span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs text-on-surface-variant">{company.summary || '已认证企业'}</p>
                </Link>
              ))}
        </div>

        {!loading && !error && companies.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-mid p-10 text-center text-on-surface-variant">暂无符合条件的公司</div>
        )}
      </main>

      <IndustryFilterModal
        open={showIndustryModal}
        tree={industryTree}
        selectedNames={draftIndustryNames}
        activeRootId={activeIndustryRootId}
        activeMidId={activeIndustryMidId}
        onClose={() => setShowIndustryModal(false)}
        onApply={() => {
          setSelectedIndustryNames(Array.from(new Set(draftIndustryNames)));
          setShowIndustryModal(false);
        }}
        onSelectRoot={(id, defaultMidId) => {
          setActiveIndustryRootId(id);
          setActiveIndustryMidId(defaultMidId);
        }}
        onSelectMid={(id, isLeaf, name) => {
          setActiveIndustryMidId(id);
          if (isLeaf) {
            setDraftIndustryNames((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
          }
        }}
        onToggleLeaf={(name) => {
          setDraftIndustryNames((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
        }}
        onRemoveSelected={(name) => {
          setDraftIndustryNames((prev) => prev.filter((item) => item !== name));
        }}
      />

      <LocationFilterModal
        open={showLocationModal}
        provinceCities={provinceCities}
        activeProvince={activeProvince}
        selectedCities={draftCityNames}
        title="选择公司地点"
        onClose={() => setShowLocationModal(false)}
        onApply={() => {
          setSelectedCityNames(Array.from(new Set(draftCityNames)));
          setShowLocationModal(false);
        }}
        onSelectProvince={setActiveProvince}
        onToggleCity={(city) => {
          setDraftCityNames((prev) => (prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city]));
        }}
        onRemoveSelected={(city) => {
          setDraftCityNames((prev) => prev.filter((item) => item !== city));
        }}
      />
    </div>
  );
}
