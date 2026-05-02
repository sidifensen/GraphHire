'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { publicApi, type Job, type PublicTreeNode } from '@/lib/api/public';
import { CHINA_PROVINCES_CITIES } from '@/lib/constants/china-provinces-cities';

type JobTypeOption = { label: string; value: number };
type EducationOption = { label: string; value: number };
type ScaleOption = { label: string; value: string };

const JOB_TYPE_OPTIONS: JobTypeOption[] = [
  { label: '全职', value: 1 },
  { label: '兼职', value: 2 },
  { label: '实习', value: 3 },
];

const EDUCATION_OPTIONS: EducationOption[] = [
  { label: '中专', value: 1 },
  { label: '大专', value: 2 },
  { label: '本科', value: 3 },
  { label: '硕士', value: 4 },
  { label: '博士', value: 5 },
];

const SCALE_OPTIONS: ScaleOption[] = [
  { label: '0-20人', value: '1' },
  { label: '20-99人', value: '2' },
  { label: '100-499人', value: '3' },
  { label: '500-999人', value: '4' },
  { label: '1000-9999人', value: '5' },
  { label: '10000人以上', value: '6' },
];

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return '薪资面议';
  const minText = min ? `${Math.round(min / 1000)}k` : '';
  const maxText = max ? `${Math.round(max / 1000)}k` : '';
  return minText && maxText ? `${minText}-${maxText}` : minText || maxText;
}

function getChildren(nodes: PublicTreeNode[], id: number | null) {
  if (id == null) return [];
  const stack = [...nodes];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (cur.id === id) return cur.children ?? [];
    stack.push(...(cur.children ?? []));
  }
  return [];
}

export default function JobListPage() {
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [positionTree, setPositionTree] = useState<PublicTreeNode[]>([]);
  const [industryTree, setIndustryTree] = useState<PublicTreeNode[]>([]);

  const [selectedPositionTypeLeafIds, setSelectedPositionTypeLeafIds] = useState<number[]>([]);
  const [selectedIndustryLeafIds, setSelectedIndustryLeafIds] = useState<number[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<number | undefined>(undefined);
  const [selectedEducationCode, setSelectedEducationCode] = useState<number | undefined>(undefined);
  const [selectedCompanyScaleCode, setSelectedCompanyScaleCode] = useState<string | undefined>(undefined);

  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [activePositionRootId, setActivePositionRootId] = useState<number | null>(null);
  const [activePositionMidId, setActivePositionMidId] = useState<number | null>(null);
  const [activeIndustryRootId, setActiveIndustryRootId] = useState<number | null>(null);
  const [activeIndustryMidId, setActiveIndustryMidId] = useState<number | null>(null);
  const [activeProvince, setActiveProvince] = useState<string>('北京');

  const activePositionRoots = positionTree;
  const activePositionMids = useMemo(
    () => getChildren(positionTree, activePositionRootId),
    [positionTree, activePositionRootId],
  );
  const activePositionLeaves = useMemo(
    () => getChildren(positionTree, activePositionMidId),
    [positionTree, activePositionMidId],
  );

  const activeIndustryRoots = industryTree;
  const activeIndustryMids = useMemo(
    () => getChildren(industryTree, activeIndustryRootId),
    [industryTree, activeIndustryRootId],
  );
  const activeIndustryLeaves = useMemo(
    () => getChildren(industryTree, activeIndustryMidId),
    [industryTree, activeIndustryMidId],
  );

  const citiesForActiveProvince = useMemo(() => {
    const item = CHINA_PROVINCES_CITIES.find((entry) => entry.province === activeProvince);
    return item?.cities ?? [];
  }, [activeProvince]);

  useEffect(() => {
    void (async () => {
      const [positionData, industryData] = await Promise.all([
        publicApi.jobs.getPositionTypeTree().catch(() => []),
        publicApi.jobs.getIndustryTree().catch(() => []),
      ]);
      setPositionTree(positionData);
      setIndustryTree(industryData);
      setActivePositionRootId(positionData[0]?.id ?? null);
      setActivePositionMidId(positionData[0]?.children?.[0]?.id ?? null);
      setActiveIndustryRootId(industryData[0]?.id ?? null);
      setActiveIndustryMidId(industryData[0]?.children?.[0]?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const page = await publicApi.jobs.search({
          keyword: keyword || undefined,
          positionTypeLeafIds: selectedPositionTypeLeafIds.length > 0 ? selectedPositionTypeLeafIds : undefined,
          industryLeafIds: selectedIndustryLeafIds.length > 0 ? selectedIndustryLeafIds : undefined,
          cityList: selectedCities.length > 0 ? selectedCities : undefined,
          jobType: selectedJobType,
          educationCode: selectedEducationCode,
          companyScaleCode: selectedCompanyScaleCode,
          page: 1,
          size: 20,
          sortBy: 'createTime',
        });
        setJobs(page.records ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    keyword,
    selectedPositionTypeLeafIds,
    selectedIndustryLeafIds,
    selectedCities,
    selectedJobType,
    selectedEducationCode,
    selectedCompanyScaleCode,
  ]);

  const togglePositionLeaf = (id: number) => {
    setSelectedPositionTypeLeafIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleIndustryLeaf = (id: number) => {
    setSelectedIndustryLeafIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city]));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="搜索职位关键词"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className="rounded border px-3 py-1.5" onClick={() => setShowPositionModal(true)}>
          更多职类
        </button>
        <button className="rounded border px-3 py-1.5" onClick={() => setShowLocationModal(true)}>
          工作地点
        </button>
        <button className="rounded border px-3 py-1.5" onClick={() => setShowIndustryModal(true)}>
          公司行业
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">职位类型</span>
          {JOB_TYPE_OPTIONS.map((item) => (
            <button
              key={item.value}
              className={`rounded border px-3 py-1 text-sm ${selectedJobType === item.value ? 'border-orange-500 text-orange-600' : ''}`}
              onClick={() => setSelectedJobType(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">学历要求</span>
          {EDUCATION_OPTIONS.map((item) => (
            <button
              key={item.value}
              className={`rounded border px-3 py-1 text-sm ${selectedEducationCode === item.value ? 'border-orange-500 text-orange-600' : ''}`}
              onClick={() => setSelectedEducationCode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">公司规模</span>
          {SCALE_OPTIONS.map((item) => (
            <button
              key={item.value}
              className={`rounded border px-3 py-1 text-sm ${selectedCompanyScaleCode === item.value ? 'border-orange-500 text-orange-600' : ''}`}
              onClick={() => setSelectedCompanyScaleCode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="py-12 text-center text-slate-500">加载中...</div> : null}
      {!loading && jobs.length === 0 ? <div className="py-12 text-center text-slate-500">暂无匹配职位</div> : null}

      <div className="space-y-3">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded border p-4 hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{job.title}</h3>
              <span className="text-orange-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {job.companyName || '未知企业'} · {job.city || '未知城市'}
            </p>
          </Link>
        ))}
      </div>

      {showPositionModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-5xl rounded bg-white">
            <div className="border-b px-4 py-3 text-lg font-semibold">选择职能</div>
            <div className="grid h-[360px] grid-cols-3">
              <div className="overflow-auto border-r p-2">
                {activePositionRoots.map((root) => (
                  <button
                    key={root.id}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${activePositionRootId === root.id ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => {
                      setActivePositionRootId(root.id);
                      setActivePositionMidId(root.children?.[0]?.id ?? null);
                    }}
                  >
                    {root.name}
                  </button>
                ))}
              </div>
              <div className="overflow-auto border-r p-2">
                {activePositionMids.map((mid) => (
                  <button
                    key={mid.id}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${activePositionMidId === mid.id ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => setActivePositionMidId(mid.id)}
                  >
                    {mid.name}
                  </button>
                ))}
              </div>
              <div className="overflow-auto p-2">
                {activePositionLeaves.map((leaf) => (
                  <button
                    key={leaf.id}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${selectedPositionTypeLeafIds.includes(leaf.id) ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => togglePositionLeaf(leaf.id)}
                  >
                    {leaf.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t p-3">
              <button className="rounded border px-4 py-1.5" onClick={() => setShowPositionModal(false)}>取消</button>
              <button className="rounded bg-orange-500 px-4 py-1.5 text-white" onClick={() => setShowPositionModal(false)}>确定</button>
            </div>
          </div>
        </div>
      ) : null}

      {showIndustryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-5xl rounded bg-white">
            <div className="border-b px-4 py-3 text-lg font-semibold">选择公司行业</div>
            <div className="grid h-[360px] grid-cols-3">
              <div className="overflow-auto border-r p-2">
                {activeIndustryRoots.map((root) => (
                  <button
                    key={root.id}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${activeIndustryRootId === root.id ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => {
                      setActiveIndustryRootId(root.id);
                      setActiveIndustryMidId(root.children?.[0]?.id ?? null);
                    }}
                  >
                    {root.name}
                  </button>
                ))}
              </div>
              <div className="overflow-auto border-r p-2">
                {activeIndustryMids.map((mid) => (
                  <button
                    key={mid.id}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${activeIndustryMidId === mid.id ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => setActiveIndustryMidId(mid.id)}
                  >
                    {mid.name}
                  </button>
                ))}
              </div>
              <div className="overflow-auto p-2">
                {activeIndustryLeaves.map((leaf) => (
                  <button
                    key={leaf.id}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${selectedIndustryLeafIds.includes(leaf.id) ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => toggleIndustryLeaf(leaf.id)}
                  >
                    {leaf.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t p-3">
              <button className="rounded border px-4 py-1.5" onClick={() => setShowIndustryModal(false)}>取消</button>
              <button className="rounded bg-orange-500 px-4 py-1.5 text-white" onClick={() => setShowIndustryModal(false)}>确定</button>
            </div>
          </div>
        </div>
      ) : null}

      {showLocationModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-4xl rounded bg-white">
            <div className="border-b px-4 py-3 text-lg font-semibold">选择工作地点</div>
            <div className="grid h-[320px] grid-cols-2">
              <div className="overflow-auto border-r p-2">
                {CHINA_PROVINCES_CITIES.map((item) => (
                  <button
                    key={item.province}
                    className={`mb-1 block w-full rounded px-2 py-2 text-left ${activeProvince === item.province ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => setActiveProvince(item.province)}
                  >
                    {item.province}
                  </button>
                ))}
              </div>
              <div className="overflow-auto p-2">
                {citiesForActiveProvince.map((city) => (
                  <button
                    key={city}
                    className={`mb-1 mr-1 inline-block rounded border px-2 py-1 ${selectedCities.includes(city) ? 'border-orange-500 text-orange-600' : ''}`}
                    onClick={() => toggleCity(city)}
                  >
                    {city}
                  </button>
                ))}
                {citiesForActiveProvince.length === 0 ? <div className="text-sm text-slate-500">暂无城市数据</div> : null}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t p-3">
              <button className="rounded border px-4 py-1.5" onClick={() => setShowLocationModal(false)}>取消</button>
              <button className="rounded bg-orange-500 px-4 py-1.5 text-white" onClick={() => setShowLocationModal(false)}>确定</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
