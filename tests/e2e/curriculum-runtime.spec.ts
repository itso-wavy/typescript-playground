import { expect, test } from '@playwright/test';
import { lessons } from '../../src/curriculum/index.js';
import type { FileMap, Lesson, RuntimeResult } from '../../src/shared/contracts.js';
import { checkLesson } from '../../server/check.js';
import { fixtures } from '../../server/curriculum/index.js';

const requestedChapter = process.env.CURRICULUM_CHAPTER === undefined ? undefined : Number(process.env.CURRICULUM_CHAPTER);
if (requestedChapter !== undefined && (!Number.isInteger(requestedChapter) || requestedChapter < 1)) {
  throw new Error('CURRICULUM_CHAPTER must be a positive integer');
}

const runtimeFixtures = fixtures.filter((fixture) => fixture.runtimeTests !== undefined).filter((fixture) => {
  const lesson = lessons.find((candidate) => candidate.id === fixture.lessonId);
  return lesson !== undefined && (requestedChapter === undefined || lesson.chapter === requestedChapter);
});

let accepted = 0;
let compilerRejected = 0;
let runtimeRejected = 0;
let failures = 0;

function lessonFor(lessonId: string): Lesson {
  const lesson = lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson) throw new Error(`Lesson ${lessonId} is missing from the published curriculum`);
  return lesson;
}

function editable(lesson: Lesson, files: FileMap): FileMap {
  return Object.fromEntries(Object.entries(files).filter(([path]) => lesson.editableFiles.includes(path)));
}

function resultSummary(result: Awaited<ReturnType<typeof checkLesson>>): string {
  return [result.status, result.message, result.diagnostics[0]?.message].filter(Boolean).join(': ');
}

async function runInBrowser(page: import('@playwright/test').Page, bundle: string): Promise<RuntimeResult> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      return await page.evaluate(async (runtimeBundle) => {
        const modulePath = '/src/runner/browser-runner.ts';
        const { runBundle } = await import(/* @vite-ignore */ modulePath);
        return runBundle(runtimeBundle);
      }, bundle) as RuntimeResult;
    } catch (error) {
      if (attempt === 0 && error instanceof Error && error.message.includes('Execution context was destroyed')) continue;
      throw error;
    }
  }
  throw new Error('browser runtime did not start');
}

test.describe('published curriculum runtime matrix', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(30_000);

  for (const fixture of runtimeFixtures) {
    test(`${fixture.lessonId}: solution, alternatives, and plausible invalid variants`, async ({ page }) => {
      const lesson = lessonFor(fixture.lessonId);
      const passingCandidates = [lesson.solution, ...fixture.alternatives];

      for (const [candidateIndex, files] of passingCandidates.entries()) {
        const result = await checkLesson({
          lessonId: lesson.id,
          files: editable(lesson, files),
          requestId: `${lesson.id}-runtime-pass-${candidateIndex}`,
          codeRevision: candidateIndex,
        });
        try {
          expect(result.status, `${lesson.id} passing candidate ${candidateIndex}: ${resultSummary(result)}`).toBe('ready');
          expect(result.bundle, `${lesson.id} passing candidate ${candidateIndex} did not receive a runtime bundle`).toEqual(expect.any(String));
          const runtime = await runInBrowser(page, result.bundle!);
          expect(runtime.status, `${lesson.id} passing candidate ${candidateIndex}: ${runtime.error ?? 'runtime checks failed'}`).toBe('passed');
          expect(runtime.checks.every((check) => check.passed), `${lesson.id} passing candidate ${candidateIndex} returned a failed check`).toBe(true);
          accepted += 1;
        } catch (error) {
          failures += 1;
          throw error;
        }
      }

      for (const invalid of fixture.invalid) {
        const result = await checkLesson({
          lessonId: lesson.id,
          files: editable(lesson, invalid.files),
          requestId: `${lesson.id}-runtime-invalid-${invalid.name}`,
          codeRevision: 1,
        });
        if (result.status !== 'ready') {
          try {
            expect(result.status, `${lesson.id}/${invalid.name} must be rejected by TypeScript contracts, not a system failure: ${resultSummary(result)}`).toMatch(/^(type-error|contract-error)$/);
          } catch (error) {
            failures += 1;
            throw error;
          }
          compilerRejected += 1;
          continue;
        }
        try {
          expect(result.bundle, `${lesson.id}/${invalid.name} received no runtime bundle`).toEqual(expect.any(String));
          const runtime = await runInBrowser(page, result.bundle!);
          expect(runtime.status, `${lesson.id}/${invalid.name} was type-valid and passed every runtime check; fix the lesson fixture or invalid case`).not.toBe('passed');
          runtimeRejected += 1;
        } catch (error) {
          failures += 1;
          throw error;
        }
      }
    });
  }

  test.afterAll(() => {
    console.log(JSON.stringify({
      event: 'curriculum-browser-runtime-matrix',
      runtimeLessons: runtimeFixtures.length,
      accepted,
      compilerRejected,
      runtimeRejected,
      failures,
    }));
  });
});

test('selects at least one runtime fixture', () => {
  expect(runtimeFixtures, requestedChapter === undefined ? 'curriculum has no runtime fixtures' : `chapter ${requestedChapter} has no runtime fixtures`).not.toHaveLength(0);
});
