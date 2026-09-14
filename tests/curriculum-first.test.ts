import { describe, expect, it } from 'vitest';
import { lessons as diagnosticLessons } from '../src/curriculum/typescript/diagnostics.js';
import { lessons as foundationLessons } from '../src/curriculum/typescript/foundations.js';
import { lessons as functionLessons } from '../src/curriculum/typescript/functions.js';
import { fixtures as diagnosticFixtures } from '../server/curriculum/typescript/diagnostics.js';
import { fixtures as foundationFixtures } from '../server/curriculum/typescript/foundations.js';
import { fixtures as functionFixtures } from '../server/curriculum/typescript/functions.js';

const lessons = [...diagnosticLessons, ...foundationLessons, ...functionLessons];
const fixtures = [...diagnosticFixtures, ...foundationFixtures, ...functionFixtures];

describe('진단과 첫 두 단계 커리큘럼', () => {
  it('진단 4개와 정식 실습 12개를 설계 순서대로 제공한다', () => {
    expect(diagnosticLessons.map(({ id }) => id)).toEqual(['d1', 'd2', 'd3', 'd4']);
    expect(foundationLessons.map(({ id }) => id)).toEqual(['ts01.inference-literals', 'ts02.tuple-readonly', 'ts03.top-bottom-types', 'ts04.models-alias-interface', 'ts05.unions-narrowing', 'ts06.structural-typing']);
    expect(functionLessons.map(({ id }) => id)).toEqual(['ts07.function-contracts', 'ts08.generic-basics', 'ts09.generic-constraints', 'ts10.generic-models', 'ts11.utility-update-contract', 'ts12.conditional-response']);
  });

  it('모든 레슨과 fixture가 실행 가능한 학습 자료를 갖는다', () => {
    expect(fixtures.map(({ lessonId }) => lessonId).sort()).toEqual(lessons.map(({ id }) => id).sort());
    for (const lesson of lessons) {
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.concept.length).toBeGreaterThanOrEqual(2);
      expect(lesson.sources.some(({ url }) => url.startsWith('https://www.typescriptlang.org/'))).toBe(true);
      expect(lesson.editableFiles.every((path) => Boolean(lesson.starter[path]?.trim()))).toBe(true);
      expect(lesson.editableFiles.every((path) => Boolean(lesson.solution[path]?.trim()))).toBe(true);
    }
    for (const fixture of fixtures) {
      expect(fixture.alternatives.length).toBeGreaterThan(0);
      expect(fixture.invalid.length).toBeGreaterThan(0);
    }
  });
});
