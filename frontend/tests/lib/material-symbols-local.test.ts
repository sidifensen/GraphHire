import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDir, '..', '..');

describe('material symbols local hosting', () => {
  it('removes the google material symbols link from the root layout', () => {
    const layoutContent = fs.readFileSync(path.join(frontendRoot, 'src/app/layout.tsx'), 'utf8');

    expect(layoutContent).not.toContain('Material+Symbols');
    expect(layoutContent).not.toContain('fonts.googleapis.com/css2?family=Material+Symbols');
  });

  it('defines a local font-face for material symbols in globals.css', () => {
    const globalsContent = fs.readFileSync(path.join(frontendRoot, 'src/styles/globals.css'), 'utf8');

    expect(globalsContent).toContain('@font-face');
    expect(globalsContent).toContain("/fonts/material-symbols-outlined-subset.woff2");
    expect(globalsContent).not.toContain("https://fonts.googleapis.com/css2?family=Material+Symbols");
  });

  it('tracks the local font asset and icon list in the repository', () => {
    const fontFile = path.join(frontendRoot, 'public/fonts/material-symbols-outlined-subset.woff2');
    const iconListFile = path.join(frontendRoot, 'public/fonts/material-symbols-outlined-icons.txt');

    expect(fs.existsSync(fontFile)).toBe(true);
    expect(fs.existsSync(iconListFile)).toBe(true);
    expect(fs.readFileSync(iconListFile, 'utf8')).toContain('verified');
    expect(fs.readFileSync(iconListFile, 'utf8')).toContain('autorenew');
  });

  it('documents the local material symbols rule in frontend AGENTS', () => {
    const agentsContent = fs.readFileSync(path.join(frontendRoot, 'AGENTS.md'), 'utf8');

    expect(agentsContent).toContain('Google Material Symbols');
    expect(agentsContent).toContain('material-symbols-outlined');
    expect(agentsContent).toContain('frontend/public/fonts');
  });
});
