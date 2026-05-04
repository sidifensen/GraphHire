'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, CheckCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { collectLeafNameSet, flattenLeafNameMap, treeChildrenById } from '@/features/user-filters/tree';

const STORAGE_KEY = 'graphhire.user.companies.filters.v1';
const DEFAULT_AVATAR = '/default-avatar.svg';
const FILTER_ROW_GAP_PX = 8;
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
  const [openDropdown, setOpenDropdown] = useState<'city' | 'industry' | 'scale' | null>(null);
  const [draftIndustryNames, setDraftIndustryNames] = useState<string[]>([]);
  const [draftCityNames, setDraftCityNames] = useState<string[]>([]);
  const [activeIndustryRootId, setActiveIndustryRootId] = useState<number | null>(null);
  const [activeIndustryMidId, setActiveIndustryMidId] = useState<number | null>(null);
  const [visibleCityOptions, setVisibleCityOptions] = useState<string[]>(['全国']);
  const [visibleIndustryOptions, setVisibleIndustryOptions] = useState<string[]>(['不限']);

  const cityRowRef = useRef<HTMLDivElement | null>(null);
  const cityLabelRef = useRef<HTMLSpanElement | null>(null);
  const cityMoreRef = useRef<HTMLButtonElement | null>(null);
  const industryRowRef = useRef<HTMLDivElement | null>(null);
  const industryLabelRef = useRef<HTMLSpanElement | null>(null);
  const industryMoreRef = useRef<HTMLButtonElement | null>(null);

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
    const allLeafNames = Array.from(industryLeafSet).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    const others = allLeafNames.filter((name) => !hot.includes(name));
    return ['不限', ...hot, ...others];
  }, [industryLeafSet]);

  useEffect(() => {
    const measureOptionWidth = (text: string) => {
      const probe = document.createElement('span');
      probe.textContent = text;
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.whiteSpace = 'nowrap';
      probe.style.fontSize = '14px';
      probe.style.fontWeight = '500';
      probe.style.lineHeight = '20px';
      probe.style.padding = '4px 12px';
      document.body.appendChild(probe);
      const width = probe.getBoundingClientRect().width;
      document.body.removeChild(probe);
      return Math.ceil(width) + 2;
    };

    const fitOneLine = (
      options: string[],
      rowRef: React.RefObject<HTMLDivElement | null>,
      labelRef: React.RefObject<HTMLElement | null>,
      moreRef: React.RefObject<HTMLElement | null>,
      setVisible: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
      const row = rowRef.current;
      const label = labelRef.current;
      const more = moreRef.current;
      if (!row || !label || !more) return;

      const available =
        row.clientWidth - label.getBoundingClientRect().width - more.getBoundingClientRect().width - FILTER_ROW_GAP_PX * 3;

      if (available <= 0) {
        setVisible(options.slice(0, 1));
        return;
      }

      const fitted: string[] = [];
      let used = 0;

      for (const option of options) {
        const optionWidth = measureOptionWidth(option);
        const nextUsed = fitted.length === 0 ? optionWidth : used + FILTER_ROW_GAP_PX + optionWidth;
        if (nextUsed > available) break;
        fitted.push(option);
        used = nextUsed;
      }

      setVisible(fitted.length > 0 ? fitted : options.slice(0, 1));
    };

    const updateVisibleOptions = () => {
      fitOneLine(cityQuickOptions, cityRowRef, cityLabelRef, cityMoreRef, setVisibleCityOptions);
      fitOneLine(hotIndustryOptions, industryRowRef, industryLabelRef, industryMoreRef, setVisibleIndustryOptions);
    };

    updateVisibleOptions();
    const observer = new ResizeObserver(updateVisibleOptions);
    if (cityRowRef.current) observer.observe(cityRowRef.current);
    if (industryRowRef.current) observer.observe(industryRowRef.current);
    window.addEventListener('resize', updateVisibleOptions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateVisibleOptions);
    };
  }, [cityQuickOptions, hotIndustryOptions]);

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

  const selectedScaleLabel = selectedScaleCode ? '公司规模·1' : '公司规模';
  const selectedCityLabel = selectedCityNames.length > 0 ? `工作地点·${selectedCityNames.length}` : '工作地点';
  const selectedIndustryLabel = selectedIndustryNames.length > 0 ? `行业类型·${selectedIndustryNames.length}` : '行业类型';
  const selectedScaleText = COMPANY_SCALE_OPTIONS.find((item) => item.value === selectedScaleCode)?.label;

  const selectedFilterTags = useMemo(() => {
    const tags: Array<{ id: string; label: string }> = [];
    if (search.trim()) {
      tags.push({ id: 'keyword', label: `关键词: ${search.trim()}` });
    }
    for (const city of selectedCityNames) {
      tags.push({ id: `city:${city}`, label: `工作地点: ${city}` });
    }
    for (const industry of selectedIndustryNames) {
      tags.push({ id: `industry:${industry}`, label: `行业类型: ${industry}` });
    }
    if (selectedScaleCode && selectedScaleText) {
      tags.push({ id: `scale:${selectedScaleCode}`, label: `公司规模: ${selectedScaleText}` });
    }
    return tags;
  }, [search, selectedCityNames, selectedIndustryNames, selectedScaleCode, selectedScaleText]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCityNames([]);
    setSelectedIndustryNames([]);
    setSelectedScaleCode(undefined);
  };

  const removeSelectedFilter = (id: string) => {
    if (id === 'keyword') {
      setSearch('');
      return;
    }
    if (id.startsWith('city:')) {
      const value = id.slice('city:'.length);
      setSelectedCityNames((prev) => prev.filter((city) => city !== value));
      return;
    }
    if (id.startsWith('industry:')) {
      const value = id.slice('industry:'.length);
      setSelectedIndustryNames((prev) => prev.filter((name) => name !== value));
      return;
    }
    if (id.startsWith('scale:')) {
      setSelectedScaleCode(undefined);
    }
  };

  const mobileDropdownOptions = {
    city: ['全国', ...cityQuickOptions.filter((city) => city !== '全国').slice(0, 10)],
    industry: hotIndustryOptions,
    scale: ['不限', ...COMPANY_SCALE_OPTIONS.map((item) => item.label)],
  } as const;

  const openEmbeddedLocationDropdown = () => {
    setDraftCityNames(selectedCityNames);
    setOpenDropdown('city');
  };

  const openEmbeddedIndustryDropdown = () => {
    setDraftIndustryNames(selectedIndustryNames);
    setOpenDropdown('industry');
  };

  const mobileIndustryLeafOptions = useMemo(() => {
    const roots = treeChildrenById(industryTree, activeIndustryRootId);
    return roots.flatMap((node) => (node.children && node.children.length > 0 ? node.children : [node]));
  }, [industryTree, activeIndustryRootId]);

  return (
    <div className="flex flex-col bg-surface-background pb-24 md:pb-0">
      <header className="sticky top-0 z-50 bg-surface-lowest shadow-sm md:hidden">
        <div className="border-b border-surface-mid px-4 py-2">
          <div className="flex h-9 items-center rounded-full bg-surface-low px-3">
            <Search className="mr-2 shrink-0 text-outline" size={16} />
            <input
              type="text"
              placeholder="搜索公司"
              className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between bg-surface-lowest px-4 py-2 text-sm text-on-surface-variant">
          <div className="hide-scrollbar flex w-full items-center gap-6 overflow-x-auto">
            <button
              onClick={() => {
                if (openDropdown === 'city') {
                  setOpenDropdown(null);
                } else {
                  openEmbeddedLocationDropdown();
                }
              }}
              className={`flex shrink-0 items-center gap-1 ${openDropdown === 'city' || selectedCityNames.length > 0 ? 'font-bold text-primary' : ''}`}
            >
              {selectedCityLabel}
              <ChevronDown size={14} className={`opacity-60 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (openDropdown === 'industry') {
                  setOpenDropdown(null);
                } else {
                  openEmbeddedIndustryDropdown();
                }
              }}
              className={`flex shrink-0 items-center gap-1 ${openDropdown === 'industry' || selectedIndustryNames.length > 0 ? 'font-bold text-primary' : ''}`}
            >
              {selectedIndustryLabel}
              <ChevronDown size={14} className={`opacity-60 transition-transform ${openDropdown === 'industry' ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => {
                setOpenDropdown(openDropdown === 'scale' ? null : 'scale');
              }}
              className={`flex shrink-0 items-center gap-1 ${openDropdown === 'scale' || selectedScaleCode ? 'font-bold text-primary' : ''}`}
            >
              {selectedScaleLabel}
              <ChevronDown size={14} className={`opacity-60 transition-transform ${openDropdown === 'scale' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {openDropdown && (
            <div className="absolute left-0 top-full z-[60] flex h-[calc(100vh-80px)] w-full flex-col bg-black/40">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className={`w-full rounded-b-2xl bg-surface-lowest shadow-md overflow-hidden ${
                  openDropdown === 'city' || openDropdown === 'industry'
                    ? 'h-[50vh] p-0'
                    : 'max-h-[50vh] flex flex-wrap gap-2 overflow-y-auto p-4'
                }`}
              >
                {openDropdown === 'city' ? (
                  <div
                    data-testid="mobile-company-location-dropdown"
                    className="w-full h-full rounded-none bg-surface-lowest border border-surface-mid/70 overflow-hidden flex flex-col"
                  >
                    <div className="px-4 py-3 border-b bg-surface-lowest text-base font-bold">选择公司地点</div>
                    <div className="px-4 py-2 border-b bg-primary/5 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-primary">已选（{draftCityNames.length}）：</span>
                        <div data-testid="mobile-company-city-selected-tags" className="flex items-center gap-2 flex-wrap">
                          {draftCityNames.length === 0 ? (
                            <span className="text-on-surface-variant">暂无</span>
                          ) : (
                            draftCityNames.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setDraftCityNames((prev) => prev.filter((item) => item !== name))}
                                className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/30 bg-white px-3 text-xs text-primary hover:bg-primary/10"
                              >
                                <span>{name}</span>
                                <X size={12} />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 flex-1 min-h-0 bg-surface-lowest">
                      <div data-testid="mobile-company-location-province-list" className="border-r overflow-y-auto p-2 min-h-0">
                        {provinceCities.map((item) => (
                          <button
                            key={item.province}
                            onClick={() => setActiveProvince(item.province)}
                            className={`flex h-9 w-full items-center rounded-lg border px-2 mb-1 text-xs transition-colors ${
                              activeProvince === item.province
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                            }`}
                          >
                            {item.province}
                          </button>
                        ))}
                      </div>
                      <div data-testid="mobile-company-location-city-list" className="overflow-y-auto p-2 min-h-0">
                        {(provinceCities.find((item) => item.province === activeProvince)?.cities ?? []).map((city) => {
                          const active = draftCityNames.includes(city);
                          return (
                            <button
                              key={city}
                              aria-pressed={active}
                              onClick={() =>
                                setDraftCityNames((prev) =>
                                  active ? prev.filter((item) => item !== city) : [...prev, city],
                                )
                              }
                              className={`inline-flex mr-2 mb-2 px-2 h-8 items-center justify-between min-w-[72px] rounded-lg border text-xs transition-colors ${
                                active
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-surface-mid text-on-surface hover:border-primary/20 hover:bg-primary/5'
                              }`}
                            >
                              <span>{city}</span>
                              {active && <CheckCircle size={12} className="ml-1 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="px-3 py-2 border-t flex justify-end gap-2 bg-surface-lowest shrink-0">
                      <button
                        onClick={() => setDraftCityNames([])}
                        className="px-3 h-8 rounded-full border border-surface-mid text-on-surface text-xs"
                      >
                        清空筛选
                      </button>
                      <button
                        onClick={() => setOpenDropdown(null)}
                        className="px-3 h-8 rounded-full border border-surface-mid text-on-surface text-xs"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCityNames(Array.from(new Set(draftCityNames)));
                          setOpenDropdown(null);
                        }}
                        className="px-3 h-8 rounded-full bg-primary text-white hover:bg-primary-container transition-colors text-xs"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                ) : openDropdown === 'industry' ? (
                  <div
                    data-testid="mobile-company-industry-dropdown"
                    className="w-full h-full rounded-none bg-surface-lowest border border-surface-mid/70 overflow-hidden flex flex-col"
                  >
                    <div className="px-4 py-3 border-b bg-surface-lowest text-base font-bold">选择公司行业</div>
                    <div className="px-4 py-2 border-b bg-primary/5 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-primary">已选（{draftIndustryNames.length}）：</span>
                        <div data-testid="mobile-company-industry-selected-tags" className="flex items-center gap-2 flex-wrap">
                          {draftIndustryNames.length === 0 ? (
                            <span className="text-on-surface-variant">暂无</span>
                          ) : (
                            draftIndustryNames.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setDraftIndustryNames((prev) => prev.filter((item) => item !== name))}
                                className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/30 bg-white px-3 text-xs text-primary hover:bg-primary/10"
                              >
                                <span>{name}</span>
                                <X size={12} />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 flex-1 min-h-0 bg-surface-lowest">
                      <div className="border-r overflow-y-auto p-2 min-h-0">
                        {industryTree.map((root) => (
                          <button
                            key={root.id}
                            onClick={() => {
                              setActiveIndustryRootId(root.id);
                            }}
                            className={`flex h-9 w-full items-center rounded-lg border px-2 mb-1 text-xs transition-colors ${
                              activeIndustryRootId === root.id
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                            }`}
                          >
                            {root.name}
                          </button>
                        ))}
                      </div>
                      <div className="overflow-y-auto p-2 min-h-0">
                        {mobileIndustryLeafOptions.map((leaf) => {
                          const active = draftIndustryNames.includes(leaf.name);
                          return (
                            <button
                              key={leaf.id}
                              aria-pressed={active}
                              onClick={() =>
                                setDraftIndustryNames((prev) =>
                                  active ? prev.filter((item) => item !== leaf.name) : [...prev, leaf.name],
                                )
                              }
                              className={`flex h-9 w-full items-center justify-between rounded-lg border px-2 mb-1 text-xs transition-colors ${
                                active
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                              }`}
                            >
                              <span className="truncate pr-1">{leaf.name}</span>
                              {active && <CheckCircle size={12} className="text-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="px-3 py-2 border-t flex justify-end gap-2 bg-surface-lowest shrink-0">
                      <button
                        onClick={() => setDraftIndustryNames([])}
                        className="px-3 h-8 rounded-full border border-surface-mid text-on-surface text-xs"
                      >
                        清空筛选
                      </button>
                      <button
                        onClick={() => setOpenDropdown(null)}
                        className="px-3 h-8 rounded-full border border-surface-mid text-on-surface text-xs"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIndustryNames(Array.from(new Set(draftIndustryNames)));
                          setOpenDropdown(null);
                        }}
                        className="px-3 h-8 rounded-full bg-primary text-white hover:bg-primary-container transition-colors text-xs"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                ) : mobileDropdownOptions[openDropdown].map((opt) => {
                  const isActive = opt === '不限'
                    ? !selectedScaleCode
                    : COMPANY_SCALE_OPTIONS.find((item) => item.value === selectedScaleCode)?.label === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        if (opt === '不限') {
                          setSelectedScaleCode(undefined);
                        } else {
                          const matched = COMPANY_SCALE_OPTIONS.find((item) => item.label === opt);
                          setSelectedScaleCode(matched?.value);
                        }
                        setOpenDropdown(null);
                      }}
                      className={`flex h-9 items-center justify-center rounded-lg px-4 text-sm transition-colors ${
                        isActive ? 'bg-primary/10 font-bold text-primary' : 'bg-surface-low text-on-surface'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </motion.div>
              <div className="flex-1" onClick={() => setOpenDropdown(null)} />
            </div>
          )}
        </AnimatePresence>

      </header>

      <main className="mt-2 flex w-full flex-col gap-6 md:mt-0">
        <section data-testid="desktop-company-filter-band" className="hidden w-full bg-surface-low md:block">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-5 py-6 md:px-8">
            <div data-testid="desktop-company-search-row" className="flex w-full md:mx-0 md:w-full">
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
              <div ref={cityRowRef} className="flex items-center gap-2 overflow-hidden">
                <span ref={cityLabelRef} className="shrink-0 text-sm font-bold text-on-surface-variant">公司地点</span>
                {visibleCityOptions.map((city) => {
                  const active = city === '全国' ? selectedCityNames.length === 0 : selectedCityNames.includes(city);
                  return (
                    <button
                      key={city}
                      onClick={() => toggleHotCity(city)}
                      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm transition-colors ${
                        active ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
                <button
                  ref={cityMoreRef}
                  onClick={() => { setDraftCityNames(selectedCityNames); setShowLocationModal(true); }}
                  className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm text-primary hover:bg-primary/5"
                >
                  更多地点
                </button>
              </div>

              <div ref={industryRowRef} className="flex items-center gap-2 overflow-hidden">
                <span ref={industryLabelRef} className="shrink-0 text-sm font-bold text-on-surface-variant">行业类型</span>
                {visibleIndustryOptions.map((name) => {
                  const active = name === '不限' ? selectedIndustryNames.length === 0 : selectedIndustryNames.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleHotIndustry(name)}
                      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm transition-colors ${
                        active ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
                <button
                  ref={industryMoreRef}
                  onClick={() => { setDraftIndustryNames(selectedIndustryNames); setShowIndustryModal(true); }}
                  className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm text-primary hover:bg-primary/5"
                >
                  更多行业
                </button>
              </div>

              <div data-testid="desktop-company-scale-row" className="flex items-center gap-3 overflow-hidden">
                <span className="shrink-0 text-sm font-bold text-on-surface-variant">公司规模</span>
                <div className="hide-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedScaleCode(undefined)}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm transition-colors ${
                      !selectedScaleCode ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    不限
                  </button>
                  {COMPANY_SCALE_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setSelectedScaleCode(item.value)}
                      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm transition-colors ${
                        selectedScaleCode === item.value
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="shrink-0 text-sm text-on-surface-variant hover:text-primary"
                >
                  清空筛选
                </button>
              </div>

              {selectedFilterTags.length > 0 && (
                <div className="flex items-center gap-3 border-t border-surface-mid/50 pt-4">
                  <div className="shrink-0 text-sm font-bold text-on-surface-variant">已选条件</div>
                  <div className="hide-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                    {selectedFilterTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary bg-primary/5"
                      >
                        {tag.label}
                        <button
                          type="button"
                          onClick={() => removeSelectedFilter(tag.id)}
                          aria-label={`移除${tag.label}`}
                          className="rounded-full text-primary hover:text-primary-container"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="shrink-0 text-sm text-on-surface-variant hover:text-primary"
                  >
                    清空筛选
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 md:px-8">

          {error && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="h-[160px] rounded-2xl border border-surface-mid/50 dark:border-transparent bg-surface-lowest p-5 shadow-sm">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="mt-4 h-10 w-full rounded-lg" />
                  </div>
                ))
              : companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex flex-col rounded-2xl border border-surface-mid/80 dark:border-transparent bg-surface-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-surface-mid/60 dark:border-transparent bg-white dark:bg-surface-low">
                        <img src={resolveLogoUrl(company.avatarUrl)} className="h-full w-full object-cover" alt={company.name} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-black text-on-surface">{company.name}</h3>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate text-xs text-on-surface-variant">{company.city || '地点待补充'}</p>
                          <span className="shrink-0 inline-flex items-center whitespace-nowrap text-[11px] font-medium text-on-surface-variant">
                            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                            {formatCompanyScale(company.scale)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="min-w-0 flex-1 truncate rounded-md border border-surface-mid/70 dark:border-transparent bg-surface-low px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant"
                        title={company.industryName || '未知行业'}
                      >
                        {company.industryName || '未知行业'}
                      </span>
                      <span className="shrink-0 whitespace-nowrap rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        在招 {company.jobCount ?? 0}
                      </span>
                    </div>

                  </Link>
                ))}
          </div>

          {!loading && !error && companies.length === 0 && (
            <div className="rounded-2xl border border-dashed border-surface-mid p-10 text-center text-on-surface-variant">暂无符合条件的公司</div>
          )}
        </div>
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
        onClearSelected={() => setDraftIndustryNames([])}
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
        onClearSelected={() => setDraftCityNames([])}
      />
    </div>
  );
}
