/**
 * Gate: every vi.mock of an @/ alias must target a module that exists.
 * Vitest silently accepts a mock of a missing path, so a deleted or moved
 * module leaves a dead mock and the test runs against the real code unnoticed.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const EXTENSIONS = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

function testFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return testFiles(path);
    return /\.(test|spec)\.tsx?$/.test(name) ? [path] : [];
  });
}

function aliasTargetExists(specifier: string): boolean {
  const base = specifier.replace(/^@\//, '');
  return EXTENSIONS.some((ext) => existsSync(base + ext));
}

describe('vi.mock alias paths', () => {
  it('only mocks modules that exist', () => {
    const missing = testFiles('tests').flatMap((file) =>
      [
        ...readFileSync(file, 'utf8').matchAll(
          /vi\.mock\(\s*['"](@\/[^'"]+)['"]/g
        ),
      ]
        .map((match) => match[1] ?? '')
        .filter((specifier) => !aliasTargetExists(specifier))
        .map((specifier) => `${file}: ${specifier}`)
    );
    expect(missing).toEqual([]);
  });
});
