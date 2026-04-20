import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillGraphPage from '@/app/skill-graph/page';

describe('SkillGraphPage', () => {
  it('renders page title', () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('认知导视体系')).toBeDefined();
  });

  it('renders AI evaluation section', () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('AI 综合能力评估')).toBeDefined();
  });

  it('renders skill dimensions', () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('核心维度重合度')).toBeDefined();
    expect(screen.getByText('前端架构体系')).toBeDefined();
  });

  it('renders skill suggestions', () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('技能提升建议')).toBeDefined();
  });

  it('renders learning route button', () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('生成专属学习路线')).toBeDefined();
  });
});
