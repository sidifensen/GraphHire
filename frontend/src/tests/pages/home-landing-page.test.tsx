import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage dual-funnel landing', () => {
  test('renders dual CTAs in hero and final sections', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('link', { name: '免费发布职位' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: '开始找工作' })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: '立即找工作' })).toHaveLength(1);
  });

  test('renders trust metrics section with at least four indicators', () => {
    render(<HomePage />);
    const trustSection = screen.getByLabelText('信任背书');
    expect(trustSection).toBeInTheDocument();
    expect(trustSection).toHaveTextContent('活跃企业');
    expect(trustSection).toHaveTextContent('活跃职位');
    expect(trustSection).toHaveTextContent('平均匹配时长');
    expect(trustSection).toHaveTextContent('投递响应率');
  });

  test('renders dual value flows and capability matrix', () => {
    render(<HomePage />);
    expect(screen.getByLabelText('企业招聘流程')).toBeInTheDocument();
    expect(screen.getByLabelText('求职者流程')).toBeInTheDocument();
    expect(screen.getByLabelText('能力矩阵对照')).toBeInTheDocument();
    expect(screen.getByLabelText('双侧案例')).toBeInTheDocument();
  });

  test('keeps CTA navigation targets', () => {
    render(<HomePage />);
    const enterpriseCtas = screen.getAllByRole('link', { name: '免费发布职位' });
    const heroJobCta = screen.getByRole('link', { name: '开始找工作' });
    expect(enterpriseCtas[0]).toHaveAttribute('href', '/register?role=enterprise');
    expect(heroJobCta).toHaveAttribute('href', '/jobs');
  });
});
