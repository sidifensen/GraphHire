import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UploadPage from '@/app/resume/upload/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/resume/upload',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('UploadPage', () => {
  it('renders page title', () => {
    render(<UploadPage />);
    expect(screen.getByText('解析您的职业履历')).toBeDefined();
  });

  it('renders file info', () => {
    render(<UploadPage />);
    expect(screen.getByText(/简历_2024.pdf/)).toBeDefined();
  });

  it('renders progress indicator', () => {
    render(<UploadPage />);
    expect(screen.getByText('AI 认知引擎解析中...')).toBeDefined();
    expect(screen.getByText('65%')).toBeDefined();
  });

  it('renders status timeline', () => {
    render(<UploadPage />);
    expect(screen.getByText('文件上传成功')).toBeDefined();
    expect(screen.getByText('文本结构化处理与语义抽取')).toBeDefined();
    expect(screen.getByText('生成多维认知图谱')).toBeDefined();
  });

  it('renders action buttons', () => {
    render(<UploadPage />);
    expect(screen.getByText('重新上传')).toBeDefined();
    expect(screen.getByText('继续完善履历')).toBeDefined();
  });
});
