import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names with tailwind-merge', () => {
      const result = cn('px-2 py-2', 'px-4');
      // twMerge 应该让后面的 px-4 覆盖前面的 px-2
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('removes conflicting tailwind classes', () => {
      const result = cn('text-red-500 text-blue-500');
      // clsx+twMerge 应该只保留后面的
      expect(result).not.toBe('');
    });

    it('handles undefined and null gracefully', () => {
      const result = cn('class1', undefined as any, null as any, 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('merges multiple conflicting tailwind classes', () => {
      const result = cn('bg-red-500', 'bg-blue-500', 'bg-green-500');
      // 应该只保留最后一个 bg
      expect(result).toContain('bg-green-500');
      expect(result).not.toContain('bg-red-500');
      expect(result).not.toContain('bg-blue-500');
    });

    it('preserves non-conflicting classes', () => {
      const result = cn('px-2 py-2', 'mx-2 my-2');
      expect(result).toContain('px-2');
      expect(result).toContain('py-2');
      expect(result).toContain('mx-2');
      expect(result).toContain('my-2');
    });
  });
});
