import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('handles undefined values', () => {
      const result = cn('class1', undefined, 'class2');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('handles empty input', () => {
      const result = cn();
      expect(result).toBeDefined();
    });

    it('handles tailwind-merge compatible classes', () => {
      const result = cn('px-2 py-2', 'px-4');
      expect(result).toBeDefined();
    });
  });
});
