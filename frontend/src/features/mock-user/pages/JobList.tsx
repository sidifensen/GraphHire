import React, { useState } from 'react';
import { Search, ChevronDown, Zap, CheckCircle, SlidersHorizontal, MapPin, Briefcase, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_JOBS } from '../mockData';
import { useLoading } from '../hooks/useLoading';
import { JobCardSkeleton, Skeleton } from '../components/Skeleton';

const FILTER_CATEGORIES = [
  { id: 'category', name: '职位类别', options: ['不限', '房产销售', '兼职教师', '管培生/储备干部', '销售顾问', '外贸业务员', '人力资源专员/助理', '销售工程师', '储备干部'] },
  { id: 'city', name: '工作地点', options: ['全国', '九江', '北京', '上海', '广州', '重庆', '深圳', '天津', '武汉', '西安', '成都', '大连', '长春', '沈阳', '南京'] },
  { id: 'type', name: '职位类型', options: ['不限', '全职', '兼职/临时', '实习'] },
];

const ADVANCED_FILTERS = [
  { id: 'education', name: '学历要求', options: ['不限', '初中及以下', '高中', '大专', '本科', '硕士', '博士'] },
  { id: 'industry', name: '公司行业', options: ['不限', '移动互联网', '电子商务', '游戏', '社交网络与媒体', '广告营销', '大数据', '医疗健康'] },
  { id: 'size', name: '公司规模', options: ['不限', '少于50人', '50-150人', '150-500人', '500-1000人', '1000-5000人', '10000人以上'] },
];

export default function JobList() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeAdvancedCategory, setActiveAdvancedCategory] = useState(ADVANCED_FILTERS[0].id);
  const isLoading = useLoading();
  const [activeTab, setActiveTab] = useState('按职类筛选');
  
  const [selectedFilters, setSelectedFilters] = useState([
    { id: 'category:房产销售', label: '职位类别: 房产销售' },
    { id: 'city:九江、北京', label: '工作地点: 九江、北京' },
    { id: 'type:全职', label: '职位类型: 全职' }
  ]);

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
        // Here we remove existing filters for the same category to make it single selection per click
        // Or keep it multi-select. The design shows "九江、北京" but for simplicity we can just add it.
        // Let's just make it single selection per category for cleaner UI, or multi-select if they keep clicking. Let's do multi-select.
        return [...prev, { id: filterId, label: `${categoryName}: ${option}` }];
      }
    });
  };

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.company.toLowerCase().includes(search.toLowerCase())
  );

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
             {FILTER_CATEGORIES.map(cat => {
                const selectedForCat = selectedFilters.find(f => f.id.startsWith(`${cat.id}:`));
                const label = selectedForCat ? selectedForCat.label.split(': ')[1] : cat.name;
                const isOpen = openDropdown === cat.id;
                return (
                   <button 
                     key={cat.id} 
                     onClick={() => {
                        setOpenDropdown(isOpen ? null : cat.id);
                        setIsFilterOpen(false);
                     }}
                     className={`flex items-center gap-1 shrink-0 ${selectedForCat || isOpen ? 'text-primary font-bold' : ''}`}
                   >
                     {label === '不限' || label === '全国' ? cat.name : label} 
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
                 className="w-full bg-surface-lowest max-h-[50vh] overflow-y-auto rounded-b-2xl p-2 shadow-md flex flex-wrap gap-2"
                 style={{ padding: '16px' }}
               >
                 {FILTER_CATEGORIES.find(c => c.id === openDropdown)?.options.map(opt => {
                    const filterId = `${openDropdown}:${opt}`;
                    const isActive = opt === '不限' || opt === '全国'
                      ? !selectedFilters.some(f => f.id.startsWith(`${openDropdown}:`))
                      : selectedFilters.some(f => f.id === filterId);
                    
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                           toggleFilter(openDropdown, FILTER_CATEGORIES.find(c => c.id === openDropdown)?.name || '', opt);
                           setOpenDropdown(null);
                        }}
                        className={`h-9 px-4 rounded-lg text-sm flex items-center justify-center transition-colors ${
                          isActive ? 'bg-primary/10 text-primary font-bold' : 'bg-surface-low text-on-surface'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                 })}
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
                    {/* Left Sidebar */}
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
                    {/* Right Options */}
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
                 {/* Footer */}
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
                      确定 ({filteredJobs.length * 3}+ 件职位)
                    </button>
                 </div>
              </motion.div>
              {/* Dimmed backdrop area (clickable to close) */}
              <div className="flex-1" onClick={() => setIsFilterOpen(false)} />
            </div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full px-5 md:px-8 mt-5 md:mt-8">
        {/* Search Header Container */}
        <div className="flex flex-col gap-4">
          
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
              {FILTER_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-start text-sm">
                  <div className="w-24 text-on-surface-variant font-bold shrink-0 pt-1 tracking-widest">{category.name}</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-2 flex-1 items-center">
                    {category.options.map((opt, i) => {
                       const filterId = `${category.id}:${opt}`;
                       const isActive = opt === '不限' 
                         ? !selectedFilters.some(f => f.id.startsWith(`${category.id}:`))
                         : selectedFilters.some(f => f.id === filterId);
                       return (
                      <button 
                        key={opt}
                        onClick={() => toggleFilter(category.id, category.name, opt)}
                        className={`px-3 py-1 rounded-[12px] transition-colors whitespace-nowrap text-sm ${
                          isActive
                            ? 'text-primary font-bold bg-primary/10' 
                            : 'text-on-surface hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {opt}
                      </button>
                    )})}
                    {category.options.length > 5 && (
                       <button className="text-on-surface-variant text-xs flex items-center ml-auto hover:text-primary">
                          更多职类 <ChevronRight size={12} className="ml-1" />
                       </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Other Filters */}
              <div className="flex items-center text-sm">
                <div className="w-24 text-on-surface-variant font-bold shrink-0 tracking-widest">其他筛选</div>
                <div className="flex gap-3">
                   {['学历', '公司行业', '公司规模'].map(filter => (
                      <button key={filter} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-low rounded-[12px] text-on-surface hover:bg-surface-mid transition-colors">
                        {filter} <ChevronDown size={14} className="text-outline" />
                      </button>
                   ))}
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
        <div className="flex gap-6 mt-2">
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
             ) : (
                [...filteredJobs, ...filteredJobs].slice(0, 6).map((job, idx) => (
                  <motion.div
                    key={`${job.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link 
                      to={`/jobs/${job.id}`}
                      className="flex flex-col bg-surface-lowest rounded-[16px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-primary/20 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <h2 className="text-lg md:text-[20px] font-bold text-on-surface group-hover:text-primary transition-colors">{job.title}</h2>
                            {idx === 0 && <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded leading-tight font-bold">校招网申</span>}
                            {idx === 1 && <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded leading-tight font-bold">校招网申</span>}
                            {idx === 1 && <span className="px-1.5 py-0.5 border border-primary text-primary text-[10px] rounded leading-tight font-bold">国企</span>}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {job.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-surface-low text-xs text-on-surface-variant rounded">{tag}</span>
                            ))}
                            {idx === 3 && <span className="px-2 py-0.5 bg-surface-low text-xs text-on-surface-variant rounded">五险一金</span>}
                            {idx === 3 && <span className="px-2 py-0.5 bg-surface-low text-xs text-on-surface-variant rounded">带薪培训</span>}
                          </div>
                        </div>
                        <span className="text-lg md:text-[20px] font-bold text-primary ml-4 whitespace-nowrap">{job.salary}</span>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-3">
                          <img src={job.companyLogo || job.hrAvatar} className="w-10 h-10 md:w-8 md:h-8 rounded object-contain border border-surface-low p-1 bg-white" alt="company logo" />
                          <div className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant">
                             <span className="font-bold text-on-surface">{job.company}</span>
                             <span className="hidden md:inline text-surface-mid">|</span>
                             <span className="hidden md:inline">{job.company === '字节跳动' ? '互联网' : job.company === '阿里巴巴' ? '电子商务' : '其他'}</span>
                             <span className="hidden md:inline text-surface-mid">|</span>
                             <span className="hidden md:inline">{job.company === '字节跳动' ? '10000人以上' : job.company === '小红书' ? '1000-9999人' : '未知规模'}</span>
                          </div>
                        </div>
                        
                        <button className="px-5 py-2 bg-primary/5 text-primary border border-primary/20 rounded-[20px] text-sm font-bold opacity-0 md:opacity-100 group-hover:bg-primary group-hover:text-white transition-all">
                          立即投递
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                ))
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
