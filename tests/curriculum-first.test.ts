import { describe, expect, it } from 'vitest';
import { lessons as diagnosticLessons } from '../src/curriculum/diagnostics.js';
import { lessons as genericLessons } from '../src/curriculum/generics.js';
import { lessons as transformLessons } from '../src/curriculum/transforms.js';
import { fixtures as diagnosticFixtures } from '../server/curriculum/diagnostics.js';
import { fixtures as genericFixtures } from '../server/curriculum/generics.js';
import { fixtures as transformFixtures } from '../server/curriculum/transforms.js';

const lessons = [...diagnosticLessons, ...genericLessons, ...transformLessons];
const fixtures = [...diagnosticFixtures, ...genericFixtures, ...transformFixtures];

describe('첫 세 장의 커리큘럼 내용', () => {
  it('진단 4개와 실습 16개를 설계 순서대로 제공한다', () => {
    expect(diagnosticLessons.map(lesson => lesson.id)).toEqual(['d1', 'd2', 'd3', 'd4']);
    expect(genericLessons.map(lesson => lesson.id)).toEqual(['g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08']);
    expect(transformLessons.map(lesson => lesson.id)).toEqual(['t09', 't10', 't11', 't12', 't13', 't14', 't15', 't16']);
    expect(diagnosticLessons.every(lesson => lesson.kind === 'diagnostic' && lesson.chapter === 0)).toBe(true);
    expect(lessons.filter(lesson => lesson.kind === 'practice')).toHaveLength(16);
  });

  it('각 수업은 편집 가능한 시작 코드, 해답, 근거와 짧은 학습 자료를 갖는다', () => {
    for (const lesson of lessons) {
      expect(lesson.revision).toBe(1);
      expect(lesson.checkedAt).toBe('2026-09-08');
      expect(lesson.compilerVersion).toBe('7.0.2');
      expect(lesson.story.length).toBeGreaterThan(40);
      expect(lesson.concept.length).toBeGreaterThanOrEqual(2);
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.explanation.length).toBeGreaterThanOrEqual(2);
      expect(lesson.sources.some(source => source.url.startsWith('https://www.typescriptlang.org/'))).toBe(true);
      expect(lesson.editableFiles).toEqual(['index.ts']);
      expect(lesson.starter['index.ts'].trim()).not.toBe('');
      expect(lesson.solution['index.ts'].trim()).not.toBe('');
    }
  });

  it('각 수업의 서버 fixture는 신뢰된 계약, 대안과 실패 증거를 가진다', () => {
    expect(new Set(fixtures.map(fixture => fixture.lessonId)).size).toBe(20);
    expect(fixtures.map(fixture => fixture.lessonId).sort()).toEqual(lessons.map(lesson => lesson.id).sort());
    for (const fixture of fixtures) {
      expect(fixture.typeTests).toContain("./index.js");
      expect(fixture.alternatives.length).toBeGreaterThanOrEqual(1);
      expect(fixture.invalid.length).toBeGreaterThanOrEqual(1);
      expect(fixture.alternatives.every(files => Boolean(files['index.ts']?.trim()))).toBe(true);
      expect(fixture.invalid.every(invalid => Boolean(invalid.name) && Boolean(invalid.files['index.ts']?.trim()))).toBe(true);
    }
  });

  it('런타임 fixture는 신뢰된 JavaScript 본문으로만 점검한다', () => {
    for (const fixture of genericFixtures.filter(fixture => ['g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g08'].includes(fixture.lessonId))) {
      expect(fixture.runtimeTests).toContain('learner.');
      expect(fixture.runtimeTests).toContain('check(');
      expect(fixture.runtimeTests).not.toContain(': string');
      expect(fixture.runtimeTests).not.toContain('import ');
    }
  });
});
