import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('enterprise style regressions', () => {
  it('loads a local complete material symbols font source for prototype icon names', () => {
    const css = readFileSync(join(root, 'src/styles/mock-enterprise.css'), 'utf8');
    expect(css).toContain("@font-face");
    expect(css).toContain("Material Symbols Outlined Full");
    expect(css).toContain("material-symbols-outlined-full.ttf");
    expect(existsSync(join(root, 'public/fonts/material-symbols-outlined-full.ttf'))).toBe(true);
  });

  it('keeps enterprise spacing tokens required by the migrated prototype', () => {
    const tailwindConfig = readFileSync(join(root, 'tailwind.config.ts'), 'utf8');
    expect(tailwindConfig).toContain("'stack-gap-sm'");
    expect(tailwindConfig).toContain("'stack-gap-md'");
    expect(tailwindConfig).toContain("'stack-gap-lg'");
    expect(tailwindConfig).toContain("'inline-padding-sm'");
    expect(tailwindConfig).toContain("'inline-padding-md'");
    expect(tailwindConfig).toContain("'container-margin'");
  });

  it('does not cap enterprise mobile shell width to 375px', () => {
    // The runtime enterprise prototype now lives under app/enterprise/_mock.
    const shell = readFileSync(join(root, 'src/app/enterprise/_mock/components/MockEnterpriseShell.tsx'), 'utf8');
    const topNav = readFileSync(join(root, 'src/app/enterprise/_mock/components/TopNav.tsx'), 'utf8');
    const bottomNav = readFileSync(join(root, 'src/app/enterprise/_mock/components/BottomNav.tsx'), 'utf8');

    expect(shell).not.toContain('max-w-[375px]');
    expect(topNav).not.toContain('max-w-[375px]');
    expect(bottomNav).not.toContain('max-w-[375px]');
  });

  it('does not cap enterprise recommendations page width to 375px on mobile', () => {
    const recommendationsPage = readFileSync(join(root, 'src/app/enterprise/recommendations/page.tsx'), 'utf8');
    expect(recommendationsPage).not.toContain('max-w-[375px]');
  });
});
