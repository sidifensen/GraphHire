import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobCard from '@/components/user/JobCard';
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

  it('renders job card as a clickable element', () => {
    render(<JobCard job={mockJob} />);
    const card = document.querySelector('.cursor-pointer');
    expect(card).toBeTruthy();
  });

  it('renders all skills as tags', () => {
    render(<JobCard job={mockJob} />);
    const skillTags = document.querySelectorAll('span.rounded-full');
    expect(skillTags.length).toBeGreaterThanOrEqual(3);
  });

  it('renders title with heading style', () => {
    render(<JobCard job={mockJob} />);
    const heading = document.querySelector('h3');
    expect(heading?.textContent).toBe('前端工程师');
  });

  it('renders salary with primary color', () => {
    render(<JobCard job={mockJob} />);
    const salary = document.querySelector('.text-primary');
    expect(salary?.textContent).toBe('20k-30k');
  });

  it('renders HR section with avatar placeholder', () => {
    render(<JobCard job={mockJob} />);
    const hrSection = document.querySelector('.rounded-full');
    expect(hrSection).toBeTruthy();
  });

  it('handles job without district', () => {
    const jobWithoutDistrict: HomeJobCard = {
      ...mockJob,
      district: undefined,
    };
    render(<JobCard job={jobWithoutDistrict} />);
    expect(screen.getByText('北京')).toBeDefined();
  });

  it('handles job without match score', () => {
    const jobWithoutScore: HomeJobCard = {
      ...mockJob,
      matchScore: undefined,
    };
    render(<JobCard job={jobWithoutScore} />);
    expect(screen.getByText(/匹配度：0%/)).toBeDefined();
  });

  it('renders correct number of skill tags', () => {
    render(<JobCard job={mockJob} />);
    const skills = mockJob.requiredSkills;
    skills.forEach(skill => {
      expect(screen.getByText(skill)).toBeDefined();
    });
  });

  it('renders with hover effect class', () => {
    render(<JobCard job={mockJob} />);
    const card = document.querySelector('.hover\\:ambient-shadow');
    expect(card).toBeTruthy();
  });
});
