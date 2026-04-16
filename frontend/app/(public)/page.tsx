'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const hotJobs = [
  { id: 1, title: '前端开发工程师', company: '字节跳动', salary: '25-40K', location: '北京' },
  { id: 2, title: '后端开发工程师', company: '阿里巴巴', salary: '30-50K', location: '杭州' },
  { id: 3, title: '算法工程师', company: '腾讯', salary: '35-60K', location: '深圳' },
  { id: 4, title: '产品经理', company: '美团', salary: '20-35K', location: '北京' },
  { id: 5, title: 'UI设计师', company: '网易', salary: '18-30K', location: '杭州' },
  { id: 6, title: '数据分析师', company: '京东', salary: '20-35K', location: '北京' },
];

const hotCompanies = [
  { id: 1, name: '字节跳动', logo: '📦' },
  { id: 2, name: '阿里巴巴', logo: '🟠' },
  { id: 3, name: '腾讯', logo: '🐧' },
  { id: 4, name: '美团', logo: '🟡' },
  { id: 5, name: '网易', logo: '🎮' },
  { id: 6, name: '京东', logo: '🟢' },
];

export default function PublicHomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/login?redirect=/person/jobs&search=${encodeURIComponent(searchValue)}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">GraphHire 图谱智聘</h1>
          <p className="text-xl text-white/90 mb-8">基于 AI 能力图谱的智能招聘平台，让人才与职位精准匹配</p>
          <div className="flex gap-4 justify-center">
            <Button type="primary" size="large" onClick={() => router.push('/login')}>
              立即开始
            </Button>
            <Button size="large" ghost onClick={() => document.getElementById('hot-jobs')?.scrollIntoView({ behavior: 'smooth' })}>
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-6 -mt-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex gap-2">
            <Input
              size="large"
              placeholder="搜索职位、公司..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button type="primary" size="large" onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </div>
      </section>

      {/* Hot Jobs Section */}
      <section id="hot-jobs" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">热门职位</h2>
          <Row gutter={[16, 16]}>
            {hotJobs.map((job) => (
              <Col key={job.id} xs={24} sm={12} md={8}>
                <Card hoverable className="h-full" onClick={() => router.push('/login')}>
                  <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">{job.company}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span className="text-primary font-medium">{job.salary}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Hot Companies Section */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">热门企业</h2>
          <Row gutter={[16, 16]}>
            {hotCompanies.map((company) => (
              <Col key={company.id} xs={12} sm={8} md={4}>
                <Card hoverable className="text-center" onClick={() => router.push('/login')}>
                  <div className="text-4xl mb-2">{company.logo}</div>
                  <p className="font-medium">{company.name}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
}