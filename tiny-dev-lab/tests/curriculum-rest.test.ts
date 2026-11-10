import { describe, expect, it } from 'vitest';
import { lessons } from '../src/curriculum/index.js';
import { fixtures } from '../server/curriculum/index.js';

describe('후반부 커리큘럼 카탈로그', () => {
  it('진단을 포함한 전체 카탈로그와 모든 fixture를 한 번씩 제공한다', () => {
    expect(lessons.filter((lesson) => lesson.kind === 'practice')).toHaveLength(36);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(40);
    expect(fixtures.map((fixture) => fixture.lessonId).sort()).toEqual(
      lessons.map((lesson) => lesson.id).sort(),
    );
  });

  it('후반부 네 장은 순서, 출처, 편집할 파일, 세 힌트를 갖는다', () => {
    const expected = [
      ['ts13.unknown-guard', 'ts17.patch-json-boundary', 3, 5],
      ['ts18.class-value-type', 'ts26.package-contract', 4, 9],
      ['ts27.mapped-errors', 'ts30.brand-at-boundary', 5, 4],
      ['ts31.framework-contract-handoff', 'ts32.node-module-handoff', 6, 2],
      ['ts33.capstone-validate', 'ts36.capstone-decision', 7, 4],
    ] as const;

    for (const [first, last, chapter, count] of expected) {
      const chapterLessons = lessons.filter((lesson) => lesson.chapter === chapter);
      expect(chapterLessons.map((lesson) => lesson.id)).toContain(first);
      expect(chapterLessons.map((lesson) => lesson.id)).toContain(last);
      expect(chapterLessons).toHaveLength(count);
      for (const lesson of chapterLessons) {
        expect(lesson.hints).toHaveLength(3);
        expect(lesson.editableFiles.length).toBeGreaterThan(0);
        expect(Object.keys(lesson.starter)).toEqual(expect.arrayContaining(lesson.editableFiles));
        expect(lesson.sources.some((source) => source.url.startsWith('https://'))).toBe(true);
        expect(lesson.story.trim()).not.toBe('');
        expect(lesson.concept.join('').trim()).not.toBe('');
      }
    }
  });
});
