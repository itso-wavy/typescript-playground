import { describe, expect, it } from 'vitest';
import { validateCheckRequest } from '../src/shared/validation';

describe('validateCheckRequest', () => {
  it('accepts a minimal valid request', () => {
    expect(validateCheckRequest({
      lessonId: 'ts01.inference-literals',
      files: { 'index.ts': 'export {}' },
      requestId: 'a',
      codeRevision: 1,
    })).toBe(true);
  });

  it('rejects a request without a lesson id', () => {
    expect(validateCheckRequest({
      files: { 'index.ts': 'export {}' },
      requestId: 'a',
      codeRevision: 1,
    })).toBe(false);
  });

  it('rejects traversal paths and non-TypeScript files', () => {
    expect(validateCheckRequest({
      lessonId: 'ts01.inference-literals',
      files: { '../secret.ts': 'x' },
      requestId: 'a',
      codeRevision: 1,
    })).toBe(false);
    expect(validateCheckRequest({
      lessonId: 'ts01.inference-literals',
      files: { 'index.js': 'export {}' },
      requestId: 'a',
      codeRevision: 1,
    })).toBe(false);
  });

  it('rejects source files totaling more than 64 KiB', () => {
    expect(validateCheckRequest({
      lessonId: 'ts01.inference-literals',
      files: { 'index.ts': 'x'.repeat(64 * 1024 + 1) },
      requestId: 'a',
      codeRevision: 1,
    })).toBe(false);
  });
});
