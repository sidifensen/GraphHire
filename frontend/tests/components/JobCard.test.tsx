import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobCard from '@/components/JobCard';
import { HomeJobCard } from '@/lib/types/home';

const mockJob: HomeJobCard = {
  id: 1,
  title: '前端工程师',
  companyName: '测试公司',
  city: '北京',
  district: '朝阳区',
  salaryText: '20k-30k',
  requiredSkills: ['React', 'TypeScript', 'Node.js'],
  hrName: '张三',
  hrTitle: 'HR经理',
  matchScore: 85,
};

describe('JobCard', () => {
  it('renders job title', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('前端工程师')).toBeDefined();
  });

  it('renders company name', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('测试公司')).toBeDefined();
  });

  it('renders location', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(/北京·朝阳区/)).toBeDefined();
  });

  it('renders salary', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('20k-30k')).toBeDefined();
  });

  it('renders required skills', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Node.js')).toBeDefined();
  });

  it('renders HR info', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(/张三/)).toBeDefined();
    expect(screen.getByText(/HR经理/)).toBeDefined();
  });

  it('renders match score', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(/AI匹配度：85%/)).toBeDefined();
  });
});
