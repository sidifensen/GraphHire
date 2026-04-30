import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('mobile removal', () => {
  it('removes internal mobile app directories and rewrite entrypoints', () => {
    expect(existsSync(join(root, 'src/app/mobile-user'))).toBe(false);
    expect(existsSync(join(root, 'src/app/mobile-enterprise'))).toBe(false);
    expect(existsSync(join(root, 'src/lib/device-routing.ts'))).toBe(false);
    expect(existsSync(join(root, 'middleware.ts'))).toBe(false);
    expect(existsSync(join(root, 'src/proxy.ts'))).toBe(false);
  });
});

