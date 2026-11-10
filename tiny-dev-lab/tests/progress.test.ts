import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonProgress } from '../src/shared/contracts.js';

const FIRST_LESSON = 'ts01.inference-literals';
const SECOND_LESSON = 'ts02.tuple-readonly';
const FIFTH_LESSON = 'ts05.unions-narrowing';

function progress(lessonId: string, files: Record<string, string>, version = 0): LessonProgress {
  return {
    lessonId,
    lessonRevision: 1,
    files,
    version,
    completedAt: null,
    completedCode: null,
    note: '',
    updatedAt: '2026-09-08T00:00:00.000Z',
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe('local progress repository', () => {
  it('serializes first-write races so exactly one simultaneous draft is saved', async () => {
    const { createProgressRepository } = await import('../src/progress/repository.js');
    const repository = createProgressRepository({ mode: 'local', userId: 'preview-owner' });

    const [first, second] = await Promise.all([
      repository.save(progress(FIRST_LESSON, { 'index.ts': 'first' }), 0),
      repository.save(progress(FIRST_LESSON, { 'index.ts': 'second' }), 0),
    ]);

    expect([first.status, second.status].sort()).toEqual(['conflict', 'saved']);
    expect(await repository.load(FIRST_LESSON)).toMatchObject({ files: { 'index.ts': 'first' }, version: 1 });
  });

  it('keeps local drafts private to the current preview user', async () => {
    const { createProgressRepository } = await import('../src/progress/repository.js');
    const alice = createProgressRepository({ mode: 'local', userId: 'alice' });
    const bob = createProgressRepository({ mode: 'local', userId: 'bob' });

    await alice.save(progress(FIRST_LESSON, { 'index.ts': 'alice' }), 0);

    await expect(bob.load(FIRST_LESSON)).resolves.toBeNull();
  });

  it('returns the requested lesson after switching lessons instead of reusing a stale load', async () => {
    const { createProgressRepository } = await import('../src/progress/repository.js');
    const repository = createProgressRepository({ mode: 'local', userId: 'preview-owner' });
    await repository.save(progress(FIRST_LESSON, { 'index.ts': 'first lesson' }), 0);
    await repository.save(progress(SECOND_LESSON, { 'index.ts': 'second lesson' }), 0);

    await expect(repository.load(SECOND_LESSON)).resolves.toMatchObject({
      lessonId: SECOND_LESSON,
      files: { 'index.ts': 'second lesson' },
    });
  });

  it('stores and restores the last lesson for the same user', async () => {
    const { createProgressRepository } = await import('../src/progress/repository.js');
    const repository = createProgressRepository({ mode: 'local', userId: 'preview-owner' });

    await repository.setLastLesson(FIFTH_LESSON);

    await expect(repository.getLastLesson()).resolves.toBe(FIFTH_LESSON);
  });
});

describe('offline cloud drafts', () => {
  it('preserves the unsynced draft and base version when cloud saving fails', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === '/api/config') {
        return new Response(JSON.stringify({
          localPreview: false,
          supabaseUrl: 'https://owner-test.supabase.co',
          supabasePublishableKey: 'public-test-key',
        }), { headers: { 'content-type': 'application/json' } });
      }
      throw new TypeError('Network unavailable');
    });
    vi.stubGlobal('fetch', fetch);
    const { loadAppConfig } = await import('../src/auth/client.js');
    const { getPendingLogoutState } = await import('../src/progress/local-drafts.js');
    const { createProgressRepository } = await import('../src/progress/repository.js');
    await loadAppConfig();
    const repository = createProgressRepository({ mode: 'cloud', userId: 'owner-uuid' });

    await expect(repository.save(progress(FIRST_LESSON, { 'index.ts': 'offline' }), 7)).resolves.toMatchObject({ status: 'offline' });
    expect(getPendingLogoutState('owner-uuid')).toEqual(expect.objectContaining({
      pending: true,
      drafts: [expect.objectContaining({ baseVersion: 7, progress: expect.objectContaining({ lessonId: FIRST_LESSON }) })],
    }));
  });

  it('keeps pending drafts available for a logout prompt instead of discarding them', async () => {
    const { saveLocalDraft, getPendingLogoutState } = await import('../src/progress/local-drafts.js');
    saveLocalDraft('owner-uuid', progress(FIRST_LESSON, { 'index.ts': 'unsaved' }), 2);

    expect(getPendingLogoutState('owner-uuid').drafts).toHaveLength(1);
    expect(getPendingLogoutState('owner-uuid').drafts[0]?.progress.files['index.ts']).toBe('unsaved');
  });

  it('keeps both versions after reconnecting to a newer remote draft and prepares an explicit retry', async () => {
    let online = false;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/config') {
        return new Response(JSON.stringify({
          localPreview: false,
          supabaseUrl: 'https://owner-test.supabase.co',
          supabasePublishableKey: 'public-test-key',
        }), { headers: { 'content-type': 'application/json' } });
      }
      if (!online) throw new TypeError('Network unavailable');
      return new Response(JSON.stringify([{
        lesson_id: FIRST_LESSON, lesson_revision: 1, files: { 'index.ts': 'remote' }, revision: 8,
        completed_at: null, completed_code: null, note: 'remote note', updated_at: '2026-09-08T01:00:00.000Z',
      }]), { headers: { 'content-type': 'application/json' } });
    }));
    const { loadAppConfig } = await import('../src/auth/client.js');
    const { getSyncConflict, prepareConflictResolution } = await import('../src/progress/local-drafts.js');
    const { createProgressRepository } = await import('../src/progress/repository.js');
    await loadAppConfig();
    const repository = createProgressRepository({ mode: 'cloud', userId: 'owner-uuid' });

    await repository.save(progress(FIRST_LESSON, { 'index.ts': 'local' }), 7);
    online = true;

    await expect(repository.load(FIRST_LESSON)).resolves.toMatchObject({ files: { 'index.ts': 'local' }, version: 0 });
    expect(getSyncConflict('owner-uuid', FIRST_LESSON)).toMatchObject({
      local: { baseVersion: 7, progress: { files: { 'index.ts': 'local' } } },
      remote: { files: { 'index.ts': 'remote' }, version: 8 },
    });
    expect(prepareConflictResolution('owner-uuid', FIRST_LESSON, 'keep-local')).toMatchObject({
      expectedVersion: 8,
      progress: { files: { 'index.ts': 'local' } },
    });
  });
});
