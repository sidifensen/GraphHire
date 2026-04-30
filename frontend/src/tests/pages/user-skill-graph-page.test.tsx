import { render, screen } from '@testing-library/react';
import SkillGraphPage from '@/app/(user)/skill-graph/page';

describe('User Skill Graph page', () => {
  it('renders sidebar and graph sections', () => {
    render(<SkillGraphPage />);

    expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
    expect(screen.getByText('全景图谱')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '重新生成分析视图' })).not.toBeInTheDocument();
  });
});
