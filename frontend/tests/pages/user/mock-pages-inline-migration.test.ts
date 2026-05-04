import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const userPages = [
  'src/app/page.tsx',
  'src/app/(user)/chat/page.tsx',
  'src/app/(user)/chat/[conversationId]/page.tsx',
  'src/app/(user)/companies/page.tsx',
  'src/app/(user)/companies/[id]/page.tsx',
  'src/app/(user)/jobs/page.tsx',
  'src/app/(user)/jobs/[id]/page.tsx',
  'src/app/(user)/notifications/page.tsx',
  'src/app/(user)/personal-info/page.tsx',
  'src/app/(user)/profile/page.tsx',
  'src/app/(user)/resume/manage/page.tsx',
  'src/app/(user)/resume/upload/page.tsx',
  'src/app/(user)/skill-graph/page.tsx',
];

describe('user mock pages inline migration', () => {
  it('does not keep _mock/pages indirection in user route pages', () => {
    for (const pagePath of userPages) {
      const source = readFileSync(join(root, pagePath), 'utf8');
      expect(source).not.toContain('/(user)/_mock/pages/');
    }
  });

  it('does not rely on react-router-dom in user route pages', () => {
    for (const pagePath of userPages) {
      const source = readFileSync(join(root, pagePath), 'utf8');
      expect(source).not.toContain('react-router-dom');
    }
  });

  it('removes user _mock/pages directory after inlining', () => {
    expect(existsSync(join(root, 'src/app/(user)/_mock/pages'))).toBe(false);
  });
});
