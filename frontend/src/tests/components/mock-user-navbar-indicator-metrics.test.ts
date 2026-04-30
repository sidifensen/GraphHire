import { describe, expect, test } from 'vitest';
import { resolveHorizontalIndicatorMetrics } from '@/lib/ui/nav-indicator';

describe('resolveHorizontalIndicatorMetrics', () => {
  test('计算结果只包含横向位移和宽度', () => {
    const metrics = resolveHorizontalIndicatorMetrics(
      { left: 40 },
      { left: 148, width: 132 },
    );

    expect(metrics).toEqual({ x: 108, width: 132, y: 0 });
  });

  test('导航项宽度异常时回退到安全值', () => {
    const metrics = resolveHorizontalIndicatorMetrics(
      { left: 16 },
      { left: 32, width: 0 },
    );

    expect(metrics).toEqual({ x: 16, width: 1, y: 0 });
  });
});
