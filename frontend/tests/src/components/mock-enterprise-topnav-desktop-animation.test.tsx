import { render, screen } from '@testing-library/react';
import { TopNav } from '@/app/enterprise/_mock/components/TopNav';

describe('Enterprise TopNav desktop animation', () => {
  test('桌面导航渲染轨道与激活滑块节点', () => {
    render(<TopNav title="GraphHire 图谱智聘" userAvatar />);

    expect(screen.getByTestId('enterprise-desktop-nav-track')).toBeInTheDocument();
    expect(screen.getByTestId('enterprise-desktop-nav-indicator')).toBeInTheDocument();
  });
});
