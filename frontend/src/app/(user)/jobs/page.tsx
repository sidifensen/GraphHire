'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, CheckCircle, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/app/(user)/_mock/components/Skeleton';
import { publicApi, type Job, type PublicTreeNode, type ProvinceCityItem } from '@/lib/api/public';
import { getApiBaseUrl } from '@/lib/api/base-url';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_CITY_OPTIONS = ['全国', '北京', '上海', '广州', '深圳', '杭州', '武汉', '成都', '南京', '重庆', '西安', '天津', '苏州'];
const HOT_CITY_PRIORITY = ['北京', '上海', '广州', '深圳', '杭州', '武汉', '成都', '南京', '重庆', '西安', '天津', '苏州'];
const HOT_JOB_CATEGORY_PRIORITY = ['算法工程师', '前端开发工程师', 'Java', '产品经理', '数据分析师', '新媒体运营', '销售专员', '会计', '测试工程师', '运维工程师'];
const TYPE_OPTIONS = ['不限', '全职', '兼职/临时', '实习'];
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
  { province: '山东省', cities: ['济南', '青岛', '烟台', '潍坊'] },
  { province: '福建省', cities: ['福州', '厦门', '泉州'] },
  { province: '辽宁省', cities: ['沈阳', '大连', '鞍山'] },
  { province: '吉林省', cities: ['长春', '吉林'] },
  { province: '黑龙江省', cities: ['哈尔滨', '大庆'] },
  { province: '河南省', cities: ['郑州', '洛阳', '许昌'] },
  { province: '江西省', cities: ['南昌', '九江', '赣州'] },
  { province: '湖南省', cities: ['长沙', '株洲', '湘潭'] },
  { province: '安徽省', cities: ['合肥', '芜湖', '蚌埠'] },
  { province: '河北省', cities: ['石家庄', '唐山', '保定'] },
];

const ADVANCED_FILTERS = [
  { id: 'education', name: '学历要求', options: ['不限', '初中及以下', '高中', '大专', '本科', '硕士', '博士'] },
  { id: 'industry', name: '公司行业', options: ['不限', '移动互联网', '电子商务', '游戏', '社交网络与媒体', '广告营销', '大数据', '医疗健康'] },
  { id: 'size', name: '公司规模', options: ['不限', '少于50人', '50-150人', '150-500人', '500-1000人', '1000-5000人', '10000人以上'] },
];

const JOB_TYPE_TO_CODE: Record<string, number> = {
  全职: 1,
  '兼职/临时': 2,
  实习: 3,
};

const SCALE_OPTIONS = [
  { label: '0-20人', value: '1' },
  { label: '20-99人', value: '2' },
  { label: '100-499人', value: '3' },
  { label: '500-999人', value: '4' },
  { label: '1000-9999人', value: '5' },
  { label: '10000人以上', value: '6' },
];

const EDUCATION_OPTIONS = [
  { label: '中专', value: 1 },
  { label: '大专', value: 2 },
  { label: '本科', value: 3 },
  { label: '硕士', value: 4 },
  { label: '博士', value: 5 },
];

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return '薪资面议';
  const minText = min ? `${Math.round(min / 1000)}k` : '';
  const maxText = max ? `${Math.round(max / 1000)}k` : '';
  return minText && maxText ? `${minText}-${maxText}` : minText || maxText;
}

function formatCompanyScale(scale?: string | null) {
  if (!scale) return '未知规模';
  const matched = SCALE_OPTIONS.find((item) => item.value === scale);
  return matched?.label ?? scale;
}

function flattenLeafNameMap(tree: PublicTreeNode[]) {
  const map = new Map<string, number>();
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!node.children || node.children.length === 0) {
      map.set(node.name, node.id);
      continue;
    }
    stack.push(...node.children);
  }
  return map;
}

function treeChildrenById(tree: PublicTreeNode[], id: number | null): PublicTreeNode[] {
  if (id == null) return [];
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.id === id) return node.children ?? [];
    stack.push(...(node.children ?? []));
  }
  return [];
}

function treeNodeById(tree: PublicTreeNode[], id: number | null): PublicTreeNode | null {
  if (id == null) return null;
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.id === id) return node;
    stack.push(...(node.children ?? []));
  }
  return null;
}

function collectLeafNames(tree: PublicTreeNode[]) {
  const names: string[] = [];
  const walk = (nodes: PublicTreeNode[]) => {
    nodes.forEach((node) => {
      if (!node.children || node.children.length === 0) {
        names.push(node.name);
        return;
      }
      walk(node.children);
    });
  };
  walk(tree);
  return Array.from(new Set(names));
}

function collectFeaturedLeafNamesByRoot(tree: PublicTreeNode[], limit: number) {
  if (limit <= 0 || tree.length === 0) {
    return [];
  }
  const leafBuckets = tree.map((root) => {
    const names: string[] = [];
    const walk = (nodes: PublicTreeNode[]) => {
      nodes.forEach((node) => {
        if (!node.children || node.children.length === 0) {
          names.push(node.name);
          return;
        }
        walk(node.children);
      });
    };
    walk(root.children ?? []);
    return names;
  });

  const result: string[] = [];
  const seen = new Set<string>();
  let cursor = 0;
  while (result.length < limit) {
    let progressed = false;
    for (let i = 0; i < leafBuckets.length; i++) {
      const bucketIndex = (cursor + i) % leafBuckets.length;
      const bucket = leafBuckets[bucketIndex];
      while (bucket.length > 0) {
        const next = bucket.shift()!;
        if (seen.has(next)) {
          continue;
        }
        result.push(next);
        seen.add(next);
        progressed = true;
        break;
      }
      if (result.length >= limit) {
        break;
      }
    }
    if (!progressed) {
      break;
    }
    cursor = (cursor + 1) % leafBuckets.length;
  }
  return result;
}

function collectLeafNameSet(tree: PublicTreeNode[]) {
  const names = new Set<string>();
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!node.children || node.children.length === 0) {
      names.add(node.name);
      continue;
    }
    stack.push(...node.children);
  }
  return names;
}

function normalizeCityName(raw?: string | null) {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/(特别行政区|自治区|自治州|地区|盟|市)$/u, '');
}

function buildHotCityOptions(provinceCities: ProvinceCityItem[]) {
  const pool = new Set<string>();
  for (const item of provinceCities) {
    for (const city of item.cities ?? []) {
      const normalized = normalizeCityName(city);
      if (normalized) {
        pool.add(normalized);
      }
    }
  }
  const hotCities = HOT_CITY_PRIORITY.filter((city) => pool.has(city));
  return ['全国', ...hotCities];
}

const DEFAULT_COMPANY_LOGO = '/default-avatar.svg';

function resolveLogoUrl(url?: string | null) {
  if (!url) return DEFAULT_COMPANY_LOGO;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  if (url.startsWith('/')) return `${getApiBaseUrl()}${url}`;
  return `${getApiBaseUrl()}/${url}`;
}

export default function JobList() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeAdvancedCategory, setActiveAdvancedCategory] = useState(ADVANCED_FILTERS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [taxonomyReady, setTaxonomyReady] = useState(false);
  const [positionTree, setPositionTree] = useState<PublicTreeNode[]>([]);
  const [industryTree, setIndustryTree] = useState<PublicTreeNode[]>([]);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [draftCategoryNames, setDraftCategoryNames] = useState<string[]>([]);
  const [draftIndustryNames, setDraftIndustryNames] = useState<string[]>([]);
  const [draftCityNames, setDraftCityNames] = useState<string[]>([]);
  const [activePositionRootId, setActivePositionRootId] = useState<number | null>(null);
  const [activePositionMidId, setActivePositionMidId] = useState<number | null>(null);
  const [activeIndustryRootId, setActiveIndustryRootId] = useState<number | null>(null);
  const [activeIndustryMidId, setActiveIndustryMidId] = useState<number | null>(null);
  const [provinceCities, setProvinceCities] = useState<ProvinceCityItem[]>(FALLBACK_PROVINCE_CITIES);
  const [activeProvince, setActiveProvince] = useState<string>(FALLBACK_PROVINCE_CITIES[0]?.province ?? '北京市');
  const [cityQuickOptions, setCityQuickOptions] = useState<string[]>(
    buildHotCityOptions(FALLBACK_PROVINCE_CITIES).length > 1 ? buildHotCityOptions(FALLBACK_PROVINCE_CITIES) : DEFAULT_CITY_OPTIONS,
  );
  const [selectedEducationCode, setSelectedEducationCode] = useState<number | undefined>(undefined);
  const [selectedCompanyScaleCode, setSelectedCompanyScaleCode] = useState<string | undefined>(undefined);
  
  const [selectedFilters, setSelectedFilters] = useState<{ id: string; label: string }[]>([]);
  const [jobs, setJobs] = useState<Array<{
    id: string;
    title: string;
    company: string;
    salary: string;
    tags: string[];
    companyIndustryName?: string;
    companyScaleLabel?: string;
    companyAuthStatus?: string;
    companyLogo?: string;
    hrAvatar?: string;
  }>>([]);

  const currentCategoryNames = useMemo(
    () => selectedFilters.filter((item) => item.id.startsWith('category:')).map((item) => item.id.replace('category:', '')),
    [selectedFilters],
  );
  const currentIndustryNames = useMemo(
    () => selectedFilters.filter((item) => item.id.startsWith('industry:')).map((item) => item.id.replace('industry:', '')),
    [selectedFilters],
  );
  const currentCityNames = useMemo(
    () => selectedFilters.filter((item) => item.id.startsWith('city:')).map((item) => item.id.replace('city:', '')).filter((item) => item !== '全国'),
    [selectedFilters],
  );

  const removeFilter = (id: string) => {
    setSelectedFilters(prev => prev.filter(f => f.id !== id));
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const toggleFilter = (categoryId: string, categoryName: string, option: string) => {
    if (option === '不限') {
      setSelectedFilters(prev => prev.filter(f => !f.id.startsWith(`${categoryId}:`)));
      return;
    }
    
    const filterId = `${categoryId}:${option}`;
    setSelectedFilters(prev => {
      const isSelected = prev.some(f => f.id === filterId);
      if (isSelected) {
        return prev.filter(f => f.id !== filterId);
      } else {
        return [...prev, { id: filterId, label: `${categoryName}: ${option}` }];
      }
    });
  };

  const openCategoryModal = () => {
    setDraftCategoryNames(currentCategoryNames);
    setShowPositionModal(true);
  };

  const openEmbeddedCategoryDropdown = () => {
    setDraftCategoryNames(currentCategoryNames);
    setOpenDropdown('category');
  };

  const openEmbeddedLocationDropdown = () => {
    setDraftCityNames(currentCityNames);
    setOpenDropdown('city');
  };

  const openIndustryModal = () => {
    setDraftIndustryNames(currentIndustryNames);
    setShowIndustryModal(true);
  };

  const openLocationModal = () => {
    setDraftCityNames(currentCityNames);
    setShowLocationModal(true);
  };

  const applyCategoryDraft = () => {
    setSelectedFilters((prev) => {
      const remained = prev.filter((item) => !item.id.startsWith('category:'));
      const next = draftCategoryNames.map((name) => ({ id: `category:${name}`, label: `职位类别: ${name}` }));
      return [...remained, ...next];
    });
    setShowPositionModal(false);
  };

  const applyIndustryDraft = () => {
    setSelectedFilters((prev) => {
      const remained = prev.filter((item) => !item.id.startsWith('industry:'));
      const next = draftIndustryNames.map((name) => ({ id: `industry:${name}`, label: `公司行业: ${name}` }));
      return [...remained, ...next];
    });
    setShowIndustryModal(false);
  };

  const applyLocationDraft = () => {
    setSelectedFilters((prev) => {
      const remained = prev.filter((item) => !item.id.startsWith('city:'));
      const next = draftCityNames.map((name) => ({ id: `city:${name}`, label: `工作地点: ${name}` }));
      return [...remained, ...next];
    });
    setShowLocationModal(false);
  };

  const toggleIndustryDraftName = (name: string) => {
    setDraftIndustryNames((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  useEffect(() => {
    let active = true;

    void (async () => {
      const [positionData, industryData] = await Promise.all([
        publicApi.jobs.getPositionTypeTree().catch(() => []),
        publicApi.jobs.getIndustryTree().catch(() => []),
      ]);
      if (!active) return;
      setPositionTree(positionData);
      setIndustryTree(industryData);
      setActivePositionRootId(positionData[0]?.id ?? null);
      setActivePositionMidId(positionData[0]?.children?.[0]?.id ?? null);
      setActiveIndustryRootId(industryData[0]?.id ?? null);
      setActiveIndustryMidId(industryData[0]?.children?.[0]?.id ?? null);
      setTaxonomyReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const provinceCityData = await publicApi.jobs.getProvinceCities().catch(() => FALLBACK_PROVINCE_CITIES);
      if (!active) return;
      const normalized = provinceCityData
        .filter((item) => item && typeof item.province === 'string' && Array.isArray(item.cities))
        .map((item) => ({
          province: item.province.trim(),
          cities: item.cities.map((city) => city.trim()).filter(Boolean),
        }))
        .filter((item) => item.province && item.cities.length > 0);
      if (normalized.length > 0) {
        setProvinceCities(normalized);
        setActiveProvince(normalized[0].province);
        const nextQuickOptions = buildHotCityOptions(normalized);
        setCityQuickOptions(nextQuickOptions.length > 1 ? nextQuickOptions : DEFAULT_CITY_OPTIONS);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const positionLeafMap = useMemo(() => flattenLeafNameMap(positionTree), [positionTree]);
  const industryLeafMap = useMemo(() => flattenLeafNameMap(industryTree), [industryTree]);
  const leafNameSet = useMemo(() => collectLeafNameSet(positionTree), [positionTree]);
  const categoryOptions = useMemo(
    () => {
      const hotExisting = HOT_JOB_CATEGORY_PRIORITY.filter((name) => leafNameSet.has(name));
      return ['不限', ...hotExisting.slice(0, 9)];
    },
    [leafNameSet],
  );
  const filterCategories = useMemo(
    () => [
      { id: 'category', name: '职位类别', options: categoryOptions },
      { id: 'city', name: '工作地点', options: cityQuickOptions },
      { id: 'type', name: '职位类型', options: TYPE_OPTIONS },
    ],
    [categoryOptions, cityQuickOptions],
  );

  const selectedCategoryNames = useMemo(
    () => selectedFilters.filter((item) => item.id.startsWith('category:')).map((item) => item.id.replace('category:', '')),
    [selectedFilters],
  );
  const selectedCityNames = useMemo(
    () => selectedFilters.filter((item) => item.id.startsWith('city:')).map((item) => item.id.replace('city:', '')).filter((item) => item !== '全国'),
    [selectedFilters],
  );
  const selectedCitySearchNames = useMemo(
    () => selectedCityNames.map((city) => normalizeCityName(city)).filter(Boolean),
    [selectedCityNames],
  );
  const selectedTypeLabel = useMemo(
    () => selectedFilters.find((item) => item.id.startsWith('type:'))?.id.replace('type:', ''),
    [selectedFilters],
  );
  const selectedIndustryNames = useMemo(
    () => selectedFilters.filter((item) => item.id.startsWith('industry:')).map((item) => item.id.replace('industry:', '')),
    [selectedFilters],
  );

  useEffect(() => {
    if (!taxonomyReady) {
      return;
    }

    const positionTypeLeafIds = selectedCategoryNames
      .map((name) => positionLeafMap.get(name))
      .filter((id): id is number => typeof id === 'number');
    const industryLeafIds = selectedIndustryNames
      .map((name) => industryLeafMap.get(name))
      .filter((id): id is number => typeof id === 'number');
    const jobType = selectedTypeLabel ? JOB_TYPE_TO_CODE[selectedTypeLabel] : undefined;
    const educationCode = selectedEducationCode;
    const companyScaleCode = selectedCompanyScaleCode;

    void (async () => {
      setIsLoading(true);
      try {
        const result = await publicApi.jobs.search({
          keyword: search || undefined,
          positionTypeLeafIds: positionTypeLeafIds.length > 0 ? positionTypeLeafIds : undefined,
          industryLeafIds: industryLeafIds.length > 0 ? industryLeafIds : undefined,
          cityList: selectedCitySearchNames.length > 0 ? selectedCitySearchNames : undefined,
          jobType,
          educationCode,
          companyScaleCode,
          page: 1,
          size: 20,
          sortBy: 'createTime',
        });
        setJobs(
          (result.records ?? []).map((job: Job) => {
            const record = job as Job & {
              companyLogo?: string | null;
              companyLogoUrl?: string | null;
              logo?: string | null;
              hrAvatar?: string | null;
              hrAvatarUrl?: string | null;
            };
            return {
              id: String(job.id),
              title: job.title || '未知职位',
              company: job.companyName || '未知企业',
              salary: formatSalary(job.salaryMin, job.salaryMax),
              tags: [
                [job.city, job.district].filter(Boolean).join(' · ') || '城市待补充',
                job.experience || '',
                job.educationCode ? (['中专', '大专', '本科', '硕士', '博士'][job.educationCode - 1] || '学历待补充') : '学历待补充',
              ].filter(Boolean),
              companyIndustryName: job.companyIndustryName || undefined,
              companyScaleLabel: formatCompanyScale(job.companyScale),
              companyAuthStatus: job.companyAuthStatus || undefined,
              companyLogo: resolveLogoUrl(job.companyAvatarUrl ?? record.companyLogo ?? record.companyLogoUrl ?? record.logo),
              hrAvatar: resolveLogoUrl(record.hrAvatar ?? record.hrAvatarUrl),
            };
          }),
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [search, selectedCategoryNames, selectedCitySearchNames, selectedTypeLabel, selectedIndustryNames, positionLeafMap, industryLeafMap, selectedEducationCode, selectedCompanyScaleCode, taxonomyReady]);

  const selectedCategoryFilters = selectedFilters.filter((item) => item.id.startsWith('category:'));
  const selectedCityFilters = selectedFilters.filter((item) => item.id.startsWith('city:'));
  const selectedIndustryFilters = selectedFilters.filter((item) => item.id.startsWith('industry:'));
  const educationTriggerLabel = useMemo(() => {
    if (selectedEducationCode == null) return '学历';
    return EDUCATION_OPTIONS.find((opt) => opt.value === selectedEducationCode)?.label ?? '学历';
  }, [selectedEducationCode]);
  const companyScaleTriggerLabel = useMemo(() => {
    if (!selectedCompanyScaleCode) return '公司规模';
    return SCALE_OPTIONS.find((opt) => opt.value === selectedCompanyScaleCode)?.label ?? '公司规模';
  }, [selectedCompanyScaleCode]);

  const filteredJobs = jobs;
  const currentAdvancedOptions = ADVANCED_FILTERS.find(cat => cat.id === activeAdvancedCategory)?.options || [];

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-16 bg-surface-background">
      {/* Mobile Header & Search & Filter */}
      <header className="md:hidden sticky top-0 z-50 bg-surface-lowest flex flex-col shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-mid">
          <div className="flex-1 flex items-center bg-surface-low rounded-full h-9 px-3">
            <Search className="text-outline mr-2 shrink-0" size={16} />
            <input 
              type="text" 
              placeholder="搜索职位关键词" 
              className="flex-1 bg-transparent outline-none text-sm text-on-surface min-w-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter Quick Picks */}
        <div className="flex items-center px-4 py-2 text-sm text-on-surface-variant justify-between relative bg-surface-lowest z-10">
          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar flex-1 pr-4">
             {filterCategories.map(cat => {
                const selectedForCatList = selectedFilters.filter(f => f.id.startsWith(`${cat.id}:`));
                const label = selectedForCatList.length > 0 ? `${cat.name}·${selectedForCatList.length}` : cat.name;
                const isOpen = openDropdown === cat.id;
                return (
                   <button 
                     key={cat.id} 
                     onClick={() => {
                        if (cat.id === 'category') {
                          if (isOpen) {
                            setOpenDropdown(null);
                          } else {
                            openEmbeddedCategoryDropdown();
                          }
                          setIsFilterOpen(false);
                          return;
                        }
                        if (cat.id === 'city') {
                          if (isOpen) {
                            setOpenDropdown(null);
                          } else {
                            openEmbeddedLocationDropdown();
                          }
                          setIsFilterOpen(false);
                          return;
                        }
                        setOpenDropdown(isOpen ? null : cat.id);
                        setIsFilterOpen(false);
                     }}
                     className={`flex items-center gap-1 shrink-0 ${selectedForCatList.length > 0 || isOpen ? 'text-primary font-bold' : ''}`}
                   >
                     {label}
                     <ChevronDown size={14} className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                   </button>
                );
             })}
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-surface-mid bg-surface-lowest">
            <button 
               onClick={() => {
                 setIsFilterOpen(!isFilterOpen);
                 setOpenDropdown(null);
               }}
               className={`flex items-center gap-1 ${isFilterOpen ? 'text-primary font-bold' : ''}`}
            >
              筛选 <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Inline Basic Filter Dropdown */}
        <AnimatePresence>
          {openDropdown && (
             <div className="absolute top-full left-0 w-full h-[calc(100vh-80px)] z-[60] bg-black/40 flex flex-col pointer-events-auto">
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className={`w-full rounded-b-2xl bg-surface-lowest shadow-md overflow-hidden ${
                  openDropdown === 'category' || openDropdown === 'city'
                    ? 'h-[50vh] p-0'
                    : 'max-h-[50vh] overflow-y-auto p-4 flex flex-wrap gap-2'
                }`}
              >
                {openDropdown === 'category' ? (
                  <div
                    data-testid="mobile-category-dropdown"
                    className="w-full h-full rounded-none bg-surface-lowest border border-surface-mid/70 overflow-hidden flex flex-col"
                  >
                    <div className="px-4 py-3 border-b bg-surface-lowest text-base font-bold">选择职位类别</div>
                     <div className="px-4 py-2 border-b bg-primary/5 text-sm">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="font-medium text-primary">已选（{draftCategoryNames.length}）：</span>
                        <div data-testid="mobile-category-selected-tags" className="flex items-center gap-2 flex-wrap">
                          {draftCategoryNames.length === 0 ? (
                            <span className="text-on-surface-variant">暂无</span>
                          ) : (
                            draftCategoryNames.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setDraftCategoryNames((prev) => prev.filter((item) => item !== name))}
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
                    <div className="grid grid-cols-3 flex-1 min-h-0 bg-surface-lowest">
                      <div className="border-r overflow-y-auto hide-scrollbar p-2 min-h-0">
                         {positionTree.map((root) => (
                           <button
                             key={root.id}
                             onClick={() => {
                               setActivePositionRootId(root.id);
                               setActivePositionMidId(root.children?.[0]?.id ?? null);
                             }}
                             className={`flex h-9 w-full items-center rounded-lg border px-2 mb-1 text-xs transition-colors ${
                               activePositionRootId === root.id
                                 ? 'border-primary/30 bg-primary/10 text-primary'
                                 : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                             }`}
                           >
                             {root.name}
                           </button>
                         ))}
                       </div>
                      <div className="border-r overflow-y-auto hide-scrollbar p-2 min-h-0">
                         {treeChildrenById(positionTree, activePositionRootId).map((mid) => (
                           (() => {
                             const isLeafMid = !mid.children || mid.children.length === 0;
                             const active = draftCategoryNames.includes(mid.name);
                             return (
                               <button
                                 key={mid.id}
                                 onClick={() => {
                                   setActivePositionMidId(mid.id);
                                   if (isLeafMid) {
                                     setDraftCategoryNames((prev) =>
                                       active ? prev.filter((item) => item !== mid.name) : [...prev, mid.name],
                                     );
                                   }
                                 }}
                                 className={`flex h-9 w-full items-center rounded-lg border px-2 mb-1 text-xs transition-colors ${
                                   activePositionMidId === mid.id || (isLeafMid && active)
                                     ? 'border-primary bg-primary/10 text-primary'
                                     : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                                 }`}
                               >
                                 {mid.name}
                               </button>
                             );
                           })()
                         ))}
                       </div>
                      <div className="overflow-y-auto hide-scrollbar p-2 min-h-0">
                         {treeChildrenById(positionTree, activePositionMidId).map((leaf) => {
                           const active = draftCategoryNames.includes(leaf.name);
                           return (
                             <button
                               key={leaf.id}
                               aria-pressed={active}
                               onClick={() =>
                                 setDraftCategoryNames((prev) =>
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
                        onClick={() => setDraftCategoryNames([])}
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
                           applyCategoryDraft();
                           setOpenDropdown(null);
                         }}
                         className="px-3 h-8 rounded-full bg-primary text-white hover:bg-primary-container transition-colors text-xs"
                       >
                         确定
                       </button>
                     </div>
                   </div>
                 ) : openDropdown === 'city' ? (
                  <div
                    data-testid="mobile-location-dropdown"
                    className="w-full h-full rounded-none bg-surface-lowest border border-surface-mid/70 overflow-hidden flex flex-col"
                  >
                     <div className="px-4 py-3 border-b bg-surface-lowest text-base font-bold">选择工作地点</div>
                     <div className="px-4 py-2 border-b bg-primary/5 text-sm">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="font-medium text-primary">已选（{draftCityNames.length}）：</span>
                        <div data-testid="mobile-city-selected-tags" className="flex items-center gap-2 flex-wrap">
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
                      <div data-testid="mobile-location-province-list" className="border-r overflow-y-auto hide-scrollbar p-2 min-h-0">
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
                      <div data-testid="mobile-location-city-list" className="overflow-y-auto hide-scrollbar p-2 min-h-0">
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
                           applyLocationDraft();
                           setOpenDropdown(null);
                         }}
                         className="px-3 h-8 rounded-full bg-primary text-white hover:bg-primary-container transition-colors text-xs"
                       >
                         确定
                       </button>
                     </div>
                   </div>
                 ) : (
                   filterCategories.find(c => c.id === openDropdown)?.options.map(opt => {
                      const filterId = `${openDropdown}:${opt}`;
                      const isActive = opt === '不限' || opt === '全国'
                        ? !selectedFilters.some(f => f.id.startsWith(`${openDropdown}:`))
                        : selectedFilters.some(f => f.id === filterId);
                      
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                             toggleFilter(openDropdown, filterCategories.find(c => c.id === openDropdown)?.name || '', opt);
                             setOpenDropdown(null);
                          }}
                          className={`h-9 px-4 rounded-lg text-sm flex items-center justify-center transition-colors ${
                            isActive ? 'bg-primary/10 text-primary font-bold' : 'bg-surface-low text-on-surface'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                   })
                 )}
               </motion.div>
               <div className="flex-1" onClick={() => setOpenDropdown(null)} />
             </div>
          )}
        </AnimatePresence>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <div className="absolute top-full left-0 w-full h-[calc(100vh-80px)] z-[60] bg-black/40 flex flex-col pointer-events-auto">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="w-full bg-surface-lowest flex-1 flex flex-col max-h-[60vh] overflow-hidden rounded-b-2xl"
              >
                 <div className="flex flex-1 overflow-hidden">
                    <div className="w-[100px] bg-surface-low overflow-y-auto">
                       {ADVANCED_FILTERS.map(category => (
                         <button
                           key={category.id}
                           onClick={() => setActiveAdvancedCategory(category.id)}
                           className={`w-full text-left px-3 py-3.5 text-sm relative ${
                             activeAdvancedCategory === category.id ? 'bg-surface-lowest text-primary font-bold' : 'text-on-surface-variant'
                           }`}
                         >
                           {category.name}
                         </button>
                       ))}
                    </div>
                    <div className="flex-1 bg-surface-lowest overflow-y-auto p-4">
                       <h4 className="text-xs text-outline mb-3 font-bold">{ADVANCED_FILTERS.find(c => c.id === activeAdvancedCategory)?.name}</h4>
                       <div className="grid grid-cols-2 gap-2 pb-4">
                          {currentAdvancedOptions.map(opt => {
                             const filterId = `${activeAdvancedCategory}:${opt}`;
                             const isActive = opt === '不限'
                               ? !selectedFilters.some(f => f.id.startsWith(`${activeAdvancedCategory}:`))
                               : selectedFilters.some(f => f.id === filterId);
                             
                             return (
                               <button
                                 key={opt}
                                 onClick={() => toggleFilter(activeAdvancedCategory, ADVANCED_FILTERS.find(c => c.id === activeAdvancedCategory)?.name || '', opt)}
                                 className={`h-9 px-2 rounded-lg text-xs flex items-center justify-center transition-colors truncate ${
                                   isActive ? 'bg-primary/10 text-primary border border-primary/30 font-bold' : 'bg-surface-low text-on-surface border border-transparent'
                                 }`}
                               >
                                 <span className="truncate">{opt}</span>
                               </button>
                             );
                          })}
                       </div>
                    </div>
                 </div>
                 <div className="flex p-3 gap-3 border-t border-surface-mid bg-surface-lowest shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
                    <button 
                      onClick={clearFilters}
                      className="flex-1 h-10 rounded-lg bg-surface-low border border-surface-mid text-on-surface-variant font-bold text-sm"
                    >
                      重置
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 h-10 rounded-lg bg-[#E62E2E] text-white font-bold text-sm shadow-md"
                    >
                      确定 ({filteredJobs.length} 件职位)
                    </button>
                 </div>
              </motion.div>
              <div className="flex-1" onClick={() => setIsFilterOpen(false)} />
            </div>
          )}
        </AnimatePresence>

      </header>

      <main className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full px-5 md:px-8 mt-2 md:mt-8">
        {/* Search Header Container */}
        <div className="hidden md:flex flex-col gap-4">
          
          {/* Desktop Search Bar */}
          <div className="hidden md:flex w-full">
             <div className="flex flex-1 items-center bg-surface-lowest border border-primary md:border-2 md:rounded-[24px] overflow-hidden h-[48px] shadow-sm pl-6 pr-1">
                <Search className="text-outline shrink-0 mr-2" size={18} />
                <input 
                  type="text" 
                  placeholder="输入职位关键词搜索" 
                  className="flex-1 h-full bg-transparent outline-none text-body-md text-on-surface"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="bg-[#4169E1] text-white font-bold h-10 px-8 rounded-[20px] hover:bg-[#3458c9] transition-colors shadow-sm ml-2">
                  搜索
                </button>
             </div>
          </div>

          {/* Desktop Filter Box */}
          <div className="hidden md:flex flex-col bg-surface-lowest rounded-[16px] shadow-sm">
            {/* Filter Rows */}
            <div className="p-6 flex flex-col gap-4">
              {filterCategories.map(category => (
                <div key={category.id} className="flex items-start text-sm">
                  <div className="w-24 text-on-surface-variant font-bold shrink-0 pt-1 tracking-widest">{category.name}</div>
                  <div className={`flex flex-1 items-center ${category.id === 'category' ? 'flex-nowrap overflow-x-auto hide-scrollbar gap-2' : 'flex-wrap gap-x-2 gap-y-2'}`}>
                    {category.options.map((opt, i) => {
                       const filterId = `${category.id}:${opt}`;
                       const isDefaultOption = (category.id === 'city' && opt === '全国') || opt === '不限';
                       const isActive = isDefaultOption
                         ? !selectedFilters.some(f => f.id.startsWith(`${category.id}:`))
                         : selectedFilters.some(f => f.id === filterId);
                       return (
                      <button 
                        key={opt}
                        onClick={() => toggleFilter(category.id, category.name, opt)}
                        className={`inline-flex h-8 items-center px-3 rounded-[12px] transition-colors whitespace-nowrap text-sm ${
                          isActive
                            ? 'text-primary font-bold bg-primary/10' 
                            : 'text-on-surface hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {opt}
                      </button>
                    )})}
                    {(category.id === 'category' || category.id === 'city') && (
                       <button
                         onClick={() => {
                           if (category.id === 'category') openCategoryModal();
                           if (category.id === 'city') openLocationModal();
                         }}
                         className="text-on-surface-variant text-xs flex items-center ml-auto hover:text-primary"
                       >
                          {(category.id === 'city')
                            ? `更多地点${selectedCityFilters.length > 0 ? `(${selectedCityFilters.length})` : ''}`
                            : `更多职类${selectedCategoryFilters.length > 0 ? `(${selectedCategoryFilters.length})` : ''}`} <ChevronRight size={12} className="ml-1" />
                       </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Other Filters */}
              <div className="flex items-center text-sm">
                <div className="w-24 text-on-surface-variant font-bold shrink-0 tracking-widest">其他筛选</div>
                <div className="flex gap-3 items-center flex-nowrap">
                  <Select
                    value={selectedEducationCode == null ? '__none__' : String(selectedEducationCode)}
                    onValueChange={(val) => setSelectedEducationCode(val === '__none__' ? undefined : Number(val))}
                  >
                    <SelectTrigger className="h-9 w-[110px] rounded-[12px] border-0 bg-surface-low px-3 py-1.5 text-sm whitespace-nowrap">
                      <SelectValue aria-label={educationTriggerLabel}>
                        {educationTriggerLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">学历</SelectItem>
                      {EDUCATION_OPTIONS.map((opt, idx) => (
                        <SelectItem key={`${opt.value}-${idx}`} value={String(opt.value)}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    onClick={openIndustryModal}
                    className="inline-flex h-9 items-center gap-1.5 px-3 py-1.5 bg-surface-low rounded-[12px] text-on-surface hover:bg-surface-mid transition-colors whitespace-nowrap"
                  >
                    公司行业{selectedIndustryFilters.length > 0 ? `(${selectedIndustryFilters.length})` : ''} <ChevronDown size={14} className="text-outline" />
                  </button>

                  <Select
                    value={selectedCompanyScaleCode ?? '__none__'}
                    onValueChange={(val) => setSelectedCompanyScaleCode(val === '__none__' ? undefined : val)}
                  >
                    <SelectTrigger className="h-9 w-[132px] rounded-[12px] border-0 bg-surface-low px-3 py-1.5 text-sm whitespace-nowrap">
                      <SelectValue aria-label={companyScaleTriggerLabel}>
                        {companyScaleTriggerLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">公司规模</SelectItem>
                      {SCALE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Filters */}
              {selectedFilters.length > 0 && (
                <div className="flex items-center text-sm mt-4 pt-4 border-t border-surface-mid/50">
                  <div className="w-24 text-on-surface-variant font-bold shrink-0 tracking-widest leading-6">已选条件</div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {selectedFilters.map(filter => (
                      <div key={filter.id} className="flex items-center gap-1.5 px-3 py-1 border border-primary text-primary rounded-[12px] text-xs font-medium bg-primary/5">
                        {filter.label}
                        <button onClick={() => removeFilter(filter.id)} className="hover:text-primary-container"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={clearFilters} className="text-outline text-xs hover:text-primary transition-colors pr-2">
                    清空筛选
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex gap-6 md:mt-2">
          {/* Main Job List */}
          <div className="flex-1 flex flex-col gap-4">
             {isLoading ? (
               [...Array(5)].map((_, i) => (
                 <div key={i} className="bg-surface-lowest rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
                   <Skeleton className="h-6 w-1/2 rounded" />
                   <Skeleton className="h-4 w-1/4 rounded" />
                   <div className="flex justify-between items-center mt-2">
                     <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                     </div>
                     <Skeleton className="h-8 w-24 rounded-full" />
                   </div>
                 </div>
               ))
             ) : filteredJobs.length === 0 ? (
               <div className="bg-surface-lowest rounded-[16px] p-6 md:p-8 border border-dashed border-surface-mid/70 text-center">
                 <p className="text-base md:text-lg font-bold text-on-surface">暂无匹配职位</p>
                 <p className="mt-2 text-sm text-on-surface-variant">试试调整筛选条件或搜索关键词</p>
               </div>
             ) : (
                filteredJobs.map((job, idx) => (
                  <motion.div
                    key={`${job.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link 
                      href={`/jobs/${job.id}`}
                      className="flex flex-col bg-surface-lowest rounded-[16px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-primary/20 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <h2 className="text-lg md:text-[20px] font-bold text-on-surface group-hover:text-primary transition-colors">{job.title}</h2>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {job.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-surface-low text-xs text-on-surface-variant rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-lg md:text-[20px] font-bold text-primary ml-4 whitespace-nowrap">{job.salary}</span>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-8 md:h-8 shrink-0 overflow-hidden rounded border border-surface-low bg-white">
                            <img
                              src={job.companyLogo || job.hrAvatar || DEFAULT_COMPANY_LOGO}
                              onError={(event) => {
                                event.currentTarget.src = DEFAULT_COMPANY_LOGO;
                              }}
                              className="h-full w-full object-cover"
                              alt="company logo"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant">
                             <span className="font-bold text-on-surface">{job.company}</span>
                             <span className="hidden md:inline text-surface-mid">|</span>
                             <span className="hidden md:inline">{job.companyIndustryName || '未知行业'}</span>
                             <span className="hidden md:inline text-surface-mid">|</span>
                             <span className="hidden md:inline">{job.companyScaleLabel || '未知规模'}</span>
                          </div>
                        </div>
                        
                        <button className="px-5 py-2 bg-primary/5 text-primary border border-primary/20 rounded-[20px] text-sm font-bold opacity-0 md:opacity-100 group-hover:bg-primary group-hover:text-white transition-all">
                          立即沟通
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                ))
             )}
          </div>
        </div>
      </main>

      {showPositionModal && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
          <div data-testid="category-modal" className="w-full max-w-5xl rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b text-lg font-bold">选择职能</div>
            <div className="px-6 py-3 border-b bg-primary/5 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-primary">已选（{draftCategoryNames.length}）：</span>
                <div data-testid="category-selected-tags" className="flex items-center gap-2 flex-wrap">
                  {draftCategoryNames.length === 0 ? (
                    <span className="text-on-surface-variant">暂无</span>
                  ) : (
                    draftCategoryNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setDraftCategoryNames((prev) => prev.filter((item) => item !== name))}
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
            <div className="grid grid-cols-3 h-[420px]">
              <div className="border-r overflow-y-auto p-3">
                {positionTree.map((root) => (
                  <button
                    key={root.id}
                    onClick={() => {
                      setActivePositionRootId(root.id);
                      setActivePositionMidId(root.children?.[0]?.id ?? null);
                    }}
                    className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                      activePositionRootId === root.id
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    {root.name}
                  </button>
                ))}
              </div>
              <div className="border-r overflow-y-auto p-3">
                {treeChildrenById(positionTree, activePositionRootId).map((mid) => (
                  (() => {
                    const isLeafMid = !mid.children || mid.children.length === 0;
                    const active = draftCategoryNames.includes(mid.name);
                    return (
                      <button
                        key={mid.id}
                        onClick={() => {
                          setActivePositionMidId(mid.id);
                          if (isLeafMid) {
                            setDraftCategoryNames((prev) =>
                              active ? prev.filter((item) => item !== mid.name) : [...prev, mid.name],
                            );
                          }
                        }}
                        className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                          activePositionMidId === mid.id || (isLeafMid && active)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                        }`}
                      >
                        {mid.name}
                      </button>
                    );
                  })()
                ))}
              </div>
              <div className="overflow-y-auto p-3">
                {treeChildrenById(positionTree, activePositionMidId).map((leaf) => {
                  const active = draftCategoryNames.includes(leaf.name);
                  return (
                    <button
                      key={leaf.id}
                      aria-pressed={active}
                      onClick={() =>
                        setDraftCategoryNames((prev) =>
                          active ? prev.filter((item) => item !== leaf.name) : [...prev, leaf.name],
                        )
                      }
                      className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 mb-1 transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                      }`}
                    >
                      <span>{leaf.name}</span>
                      {active && <CheckCircle size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setDraftCategoryNames([])} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">清空筛选</button>
              <button onClick={() => setShowPositionModal(false)} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">取消</button>
              <button onClick={applyCategoryDraft} className="px-5 h-10 rounded-full bg-primary text-white hover:bg-primary-container transition-colors">确定</button>
            </div>
          </div>
        </div>
      )}

      {showIndustryModal && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
          <div data-testid="industry-modal" className="w-full max-w-5xl rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b text-lg font-bold">选择公司行业</div>
            <div className="px-6 py-3 border-b bg-primary/5 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-primary">已选（{draftIndustryNames.length}）：</span>
                <div data-testid="industry-selected-tags" className="flex items-center gap-2 flex-wrap">
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
            <div className="grid grid-cols-3 h-[420px]">
              <div className="border-r overflow-y-auto p-3">
                {industryTree.map((root) => (
                  <button
                    key={root.id}
                    onClick={() => {
                      setActiveIndustryRootId(root.id);
                      setActiveIndustryMidId(root.children?.[0]?.id ?? null);
                    }}
                    className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                      activeIndustryRootId === root.id
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    {root.name}
                  </button>
                ))}
              </div>
              <div className="border-r overflow-y-auto p-3">
                {treeChildrenById(industryTree, activeIndustryRootId).map((mid) => (
                  (() => {
                    const isLeafMid = !mid.children || mid.children.length === 0;
                    const active = draftIndustryNames.includes(mid.name);
                    return (
                  <button
                    key={mid.id}
                    onClick={() => {
                      setActiveIndustryMidId(mid.id);
                      if (isLeafMid) {
                        toggleIndustryDraftName(mid.name);
                      }
                    }}
                    className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                      activeIndustryMidId === mid.id || (isLeafMid && active)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    {mid.name}
                  </button>
                    );
                  })()
                ))}
              </div>
              <div className="overflow-y-auto p-3">
                {(() => {
                  const activeMidNode = treeNodeById(industryTree, activeIndustryMidId);
                  const leaves = treeChildrenById(industryTree, activeIndustryMidId);
                  if (leaves.length === 0 && activeMidNode) {
                    return null;
                  }
                  return leaves.map((leaf) => {
                    const active = draftIndustryNames.includes(leaf.name);
                    return (
                      <button
                        key={leaf.id}
                        aria-pressed={active}
                        onClick={() => toggleIndustryDraftName(leaf.name)}
                        className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 mb-1 transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                        }`}
                      >
                        <span>{leaf.name}</span>
                        {active && <CheckCircle size={14} className="text-primary" />}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="px-6 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setDraftIndustryNames([])} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">清空筛选</button>
              <button onClick={() => setShowIndustryModal(false)} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">取消</button>
              <button onClick={applyIndustryDraft} className="px-5 h-10 rounded-full bg-primary text-white hover:bg-primary-container transition-colors">确定</button>
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
          <div data-testid="location-modal" className="w-full max-w-4xl rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b text-lg font-bold">选择工作地点</div>
            <div className="px-6 py-3 border-b bg-primary/5 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-primary">已选（{draftCityNames.length}）：</span>
                <div data-testid="city-selected-tags" className="flex items-center gap-2 flex-wrap">
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
            <div className="grid grid-cols-2 h-[380px]">
              <div data-testid="location-province-list" className="border-r overflow-y-auto p-3">
                {provinceCities.map((item) => (
                  <button
                    key={item.province}
                    onClick={() => setActiveProvince(item.province)}
                    className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                      activeProvince === item.province
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    {item.province}
                  </button>
                ))}
              </div>
              <div data-testid="location-city-list" className="overflow-y-auto p-3">
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
                      className={`inline-flex mr-2 mb-2 px-3 h-9 items-center justify-between min-w-[92px] rounded-lg border text-sm transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-surface-mid text-on-surface hover:border-primary/20 hover:bg-primary/5'
                      }`}
                    >
                      <span>{city}</span>
                      {active && <CheckCircle size={13} className="ml-1 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setDraftCityNames([])} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">清空筛选</button>
              <button onClick={() => setShowLocationModal(false)} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">取消</button>
              <button onClick={applyLocationDraft} className="px-5 h-10 rounded-full bg-primary text-white hover:bg-primary-container transition-colors">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


