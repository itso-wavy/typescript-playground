// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import { fixtures } from '../server/curriculum/typescript/runtime-boundaries.js';

const runtimeTests = fixtures.find(({ lessonId }) => lessonId === 'ts17.patch-json-boundary')!.runtimeTests!;

function grade(implementation: string): boolean[] {
  const checks: boolean[] = [];
  runInNewContext(`const learner={makeOrderPatch:${implementation}};${runtimeTests}`, { check: (_name: string, passed: boolean) => checks.push(passed) });
  return checks;
}

describe('ts17 JSON Patch runtime grading', () => {
  it('rejects an implementation that loses explicit null', () => {
    expect(grade('(note)=>note==null?{}:{note}')).toContain(false);
  });

  it('rejects an implementation that serializes undefined as an owned key', () => {
    expect(grade('(note)=>({note})')).toContain(false);
  });

  it('accepts omission, string update, and explicit null clearing', () => {
    const checks = grade('(note)=>note===undefined?{}:{note}');
    expect(checks.length).toBeGreaterThan(0);
    expect(checks.every(Boolean)).toBe(true);
  });
});
