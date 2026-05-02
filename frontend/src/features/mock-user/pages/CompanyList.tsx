import React, { useState } from 'react';
import { Search, Bell, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_COMPANIES } from '../mockData';
import { useLoading } from '../hooks/useLoading';
import { Skeleton } from '../components/Skeleton';

const FILTER_CATEGORIES = [
  { id: 'location', name: '公司地点', options: ['不限', '全国', '北京', '上海', '广州', '深圳', '杭州', '天津', '西安', '苏州', '武汉', '厦门', '长沙', '成都', '郑州', '重庆', '全部城市'] },
  { id: 'industry', name: '行业类型', options: ['不限', '电子商务', '游戏', '社交网络与媒体', '广告营销', '大数据', '医疗健康', '生活服务(O2O)', 'O2O', '旅游', '分类信息', '计算机软件', '通信设备', '其他行业'] }
];

const ADVANCED_FILTERS = [
  { id: 'size', name: '公司规模', options: ['不限', '0-20人', '20-99人', '100-499人', '500-999人', '1000-9999人', '10000人以上'] }
];

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{id: string, label: string}[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeAdvancedCategory, setActiveAdvancedCategory] = useState(ADVANCED_FILTERS[0].id);
  const isLoading = useLoading(600);

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const toggleFilter = (categoryId: string, categoryName: string, option: string) => {
    if (option === '不限' || option === '全部城市' || option === '全国') {
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

  const filteredCompanies = MOCK_COMPANIES.filter(c => 
    (c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase())) &&
    selectedFilters.every(filter => {
      if (filter.id.startsWith('location:')) return c.headquarters.includes(filter.id.split(':')[1]);
      if (filter.id.startsWith('industry:')) return c.industry.includes(filter.id.split(':')[1]);
      if (filter.id.startsWith('size:')) return c.size.includes(filter.id.split(':')[1]);
      return true;
    })
  );

  const currentAdvancedOptions = ADVANCED_FILTERS.find(cat => cat.id === activeAdvancedCategory)?.options || [];

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-12 bg-surface-background">
      {/* Mobile Header & Search & Filter */}
      <header className="md:hidden sticky top-0 z-50 bg-surface-lowest flex flex-col shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-mid">
          <div className="flex-1 flex items-center bg-surface-low rounded-full h-9 px-3">
            <Search className="text-outline mr-2 shrink-0" size={16} />
            <input 
              type="text" 
              placeholder="搜索公司关键词" 
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
                     {label === '不限' || label === '全国' || label === '全部城市' ? cat.name : label} 
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
                    const isActive = opt === '不限' || opt === '全国' || opt === '全部城市'
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

        {/* Advanced Filter Dropdown */}
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
                      确定 ({filteredCompanies.length} 家公司)
                    </button>
                 </div>
              </motion.div>
              {/* Dimmed backdrop area (clickable to close) */}
              <div className="flex-1" onClick={() => setIsFilterOpen(false)} />
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Header Region */}
      <div className="bg-surface-lowest pb-6">
        <main className="pt-4 md:pt-8 flex flex-col gap-6 md:gap-8 max-w-[1200px] mx-auto w-full px-5 md:px-8">
          
          {/* Search Box */}
          <div className="flex w-full md:w-3/4 mx-auto md:mx-0">
            <div className="flex flex-1 items-center bg-surface-lowest border border-primary md:border-2 md:border-r-0 md:border-primary md:rounded-l-lg overflow-hidden h-12 md:h-12 shadow-sm">
              <input 
                type="text" 
                placeholder="搜索公司" 
                className="flex-1 h-full px-4 bg-transparent outline-none text-body-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-primary text-white font-bold px-6 md:px-10 h-12 md:h-12 rounded-r-lg hover:bg-primary/90 transition-colors shadow-sm text-sm md:text-base">
              搜索
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-col gap-5 mt-2">
            {[...FILTER_CATEGORIES, ...ADVANCED_FILTERS].map(category => (
              <div key={category.id} className="flex items-start text-sm">
                <div className="w-24 text-on-surface-variant font-bold shrink-0 pt-1 tracking-widest">{category.name}</div>
                <div className="flex flex-wrap gap-x-1 gap-y-2 flex-1">
                  {category.options.map((opt, i) => {
                     const filterId = `${category.id}:${opt}`;
                     const isActive = opt === '不限' || opt === '全国' || opt === '全部城市'
                       ? !selectedFilters.some(f => f.id.startsWith(`${category.id}:`))
                       : selectedFilters.some(f => f.id === filterId);
                     return (
                    <button 
                      key={opt} 
                      onClick={() => toggleFilter(category.id, category.name, opt)}
                      className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                        isActive 
                          ? 'text-primary font-bold bg-primary/5' 
                          : 'text-on-surface hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {opt}
                    </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={clearFilters} className="text-on-surface-variant hover:text-primary text-sm transition-colors">
                清空筛选条件
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <main className="flex flex-col gap-6 md:gap-6 max-w-[1200px] mx-auto w-full px-5 md:px-8 mt-6">
        
        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-surface-mid/50 h-[160px] flex flex-col justify-between">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg mt-4" />
              </div>
            ))
          ) : (
            [...filteredCompanies, ...filteredCompanies].slice(0, 12).map((company, index) => (
              <Link 
                key={`${company.id}-${index}`}
                to={`/companies/${company.id}`}
                className="bg-surface-lowest rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm border border-surface-mid/80 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl border border-surface-mid/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-1.5 flex items-center justify-center bg-white">
                    <img src={company.logo} className="w-full h-full object-contain" alt={company.name} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-black text-base text-on-surface truncate tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-surface-low text-on-surface-variant text-[11px] font-bold rounded flex items-center shrink-0">
                        {company.stage}
                      </span>
                      <span className="px-2 py-0.5 bg-surface-low text-on-surface-variant text-[11px] font-bold rounded truncate shrink-0">
                        {company.industry}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto border-t border-surface-mid/40 pt-3 flex justify-between items-center group-hover:bg-primary/5 -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 pb-4 md:pb-5 rounded-b-xl md:rounded-b-2xl transition-colors">
                  <div className="text-xs md:text-sm text-on-surface-variant truncate pr-2 flex items-center">
                    热招 <span className="text-surface-mid mx-2">|</span> 
                    <span className="group-hover:text-primary transition-colors truncate">
                      {company.industry === '电子商务' ? '前/后端开发工程师' : company.industry.includes('游戏') ? '架构师' : '算法工程师'}
                    </span>
                  </div>
                  <span className="text-primary font-black text-xs md:text-sm shrink-0">
                    {company.industry === '电子商务' ? '15-25K' : company.industry.includes('游戏') ? '25-45K' : '30-60K'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
