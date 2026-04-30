import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const enterprisePages = [
  'src/app/enterprise/candidates/[id]/page.tsx',
  'src/app/enterprise/dashboard/page.tsx',
  'src/app/enterprise/employees/page.tsx',
  'src/app/enterprise/jobs/page.tsx',
  'src/app/enterprise/jobs/new/page.tsx',
  'src/app/enterprise/jobs/[id]/page.tsx',
  'src/app/enterprise/jobs/[id]/edit/page.tsx',
  'src/app/enterprise/notifications/page.tsx',
  'src/app/enterprise/recommendations/page.tsx',
];

describe('enterprise mock pages inline migration', () => {
  it('does not keep _mock/pages indirection in enterprise route pages', () => {
    for (const pagePath of enterprisePages) {
      const source = readFileSync(join(root, pagePath), 'utf8');
      expect(source).not.toContain('/_mock/pages/');
    }
  });

  it('does not rely on react-router-dom in enterprise route pages', () => {
    for (const pagePath of enterprisePages) {
      const source = readFileSync(join(root, pagePath), 'utf8');
      expect(source).not.toContain('react-router-dom');
    }
  });

  it('removes enterprise _mock/pages directory after inlining', () => {
    expect(existsSync(join(root, 'src/app/enterprise/_mock/pages'))).toBe(false);
  });
});
