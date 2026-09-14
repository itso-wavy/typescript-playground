// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { lessons } from '../src/curriculum/index.js';
import { fixtures } from '../server/curriculum/index.js';
import { checkLesson } from '../server/check.js';

function editable(lessonId: string, files: Record<string, string>): Record<string, string> {
  const lesson = lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson) throw new Error(`lesson missing: ${lessonId}`);
  return Object.fromEntries(Object.entries(files).filter(([path]) => lesson.editableFiles.includes(path)));
}

describe('native TypeScript 7 fixture matrix', () => {
  it('accepts every published solution and alternate, and rejects each known-invalid source', async () => {
    const failures: string[] = [];
    for (const fixture of fixtures) {
      const lesson = lessons.find((candidate) => candidate.id === fixture.lessonId)!;
      const candidates = [lesson.solution, ...fixture.alternatives];
      for (const files of candidates) {
        const result = await checkLesson({ lessonId: fixture.lessonId, files: editable(fixture.lessonId, files), requestId: `${fixture.lessonId}-pass`, codeRevision: 1 });
        if (result.status !== 'ready') failures.push(`${fixture.lessonId} expected ready: ${result.status} ${result.message ?? result.diagnostics[0]?.message ?? ''}`);
      }
      for (const invalid of fixture.invalid) {
        const result = await checkLesson({ lessonId: fixture.lessonId, files: editable(fixture.lessonId, invalid.files), requestId: `${fixture.lessonId}-invalid`, codeRevision: 1 });
        // A runtime lesson can intentionally be type-correct but behaviorally wrong.
        // Those variants are rejected by the real-browser runtime matrix, not here.
        if (result.status === 'ready' && !fixture.runtimeTests) failures.push(`${fixture.lessonId}/${invalid.name} unexpectedly passed type contracts`);
      }
    }
    expect(failures).toEqual([]);
  }, 180_000);
});
