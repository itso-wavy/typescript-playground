// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { checkLesson } from '../server/check.js';

const request = (files: Record<string, string>) => ({ lessonId: 'ts08.generic-basics', files, requestId: 'one', codeRevision: 1 });

describe('checkLesson', () => {
  it('uses the pinned compiler for a generic alternative and creates a browser bundle', async () => {
    const result = await checkLesson(request({ 'index.ts': 'export const first = <T,>(items: readonly T[]): T | undefined => items.at(0); export const mapItems = <T, U>(items: readonly T[], project: (item: T) => U): U[] => Array.from(items, project);' }));
    expect(result.status).toBe('ready');
    expect(result.compilerVersion).toBe('7.0.2');
    expect(result.bundle).toContain('__TRUSTED_RUNNER_CAPABILITY__');
  }, 20_000);

  it('separates learner errors from unmet trusted contracts', async () => {
    const mismatch = await checkLesson(request({ 'index.ts': 'export const first = (items: string[]) => items[0]; export const mapItems = (items: readonly number[], project: (item: number) => string): string[] => items.map(project);' }));
    expect(mismatch.status).toBe('contract-error');
    const syntax = await checkLesson(request({ 'index.ts': 'export const first = <T,>(items: readonly T[]): T | undefined => {' }));
    expect(syntax.status).toBe('type-error');
  }, 20_000);

  it('rejects empty source and suppressed diagnostics', async () => {
    expect((await checkLesson(request({ 'index.ts': '' }))).status).toBe('type-error');
    expect((await checkLesson(request({ 'index.ts': '// @ts-ignore\nexport const first = (x: any[]) => x[0];' }))).status).toBe('type-error');
  });

  it.each([
    "import value from '../secret.js'; export const first = value;",
    "import value from 'https://example.test/a.js'; export const first = value;",
    "import value from '\\uD800'; export const first = value;",
    '/// <reference path="../secret.d.ts" />\nexport const first = () => undefined;',
    "import('react'); export const first = () => undefined;",
  ])('rejects unsafe source policy', async (source) => {
    expect((await checkLesson(request({ 'index.ts': source }))).status).toBe('type-error');
  });
});
