import HomePageClient from '@/app/HomePageClient';
import { fetchHomeOverview } from '@/lib/api/homeApi';
import type { HomeOverview } from '@/lib/types/home';

const emptyOverview: HomeOverview = {
  featuredJobs: [],
  popularCompanies: [],
  hotCities: [],
};

export default async function HomePage() {
  try {
    const overview = await fetchHomeOverview();
    return <HomePageClient initialOverview={overview} initialError="" />;
  } catch (error) {
    const message = error instanceof Error ? error.message : '首页数据加载失败';
    return <HomePageClient initialOverview={emptyOverview} initialError={message} />;
  }
}

