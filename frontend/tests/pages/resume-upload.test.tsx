import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UploadPage from '@/app/(user)/resume/upload/page';

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

  it('renders upload area in idle state', () => {
    render(<UploadPage />);
    // Idle state shows upload area
    expect(screen.getByText('点击选择简历文件')).toBeDefined();
    expect(screen.getByText(/支持 PDF、Word 格式，最大 10MB/)).toBeDefined();
  });

  it('renders upload tips', () => {
    render(<UploadPage />);
    expect(screen.getByText('上传须知')).toBeDefined();
    expect(screen.getByText(/支持 PDF、DOC、DOCX 格式简历/)).toBeDefined();
  });

  it('renders back link', () => {
    render(<UploadPage />);
    expect(screen.getByText('返回')).toBeDefined();
  });
});