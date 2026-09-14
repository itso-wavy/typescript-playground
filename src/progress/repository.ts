import type { LessonProgress, SaveResult } from '../shared/contracts.js';
import { getSupabaseClient } from '../auth/client.js';
import {
  clearLocalDraft,
  getLocalDraft,
  getPendingLogoutState,
  recordSyncConflict,
  saveLocalDraft,
} from './local-drafts.js';

export interface ProgressRepository {
  load(lessonId: string): Promise<LessonProgress | null>;
  save(progress: LessonProgress, expectedVersion: number): Promise<SaveResult>;
  loadAll(): Promise<LessonProgress[]>;
  getLastLesson(): Promise<string | null>;
  setLastLesson(lessonId: string): Promise<void>;
}

export interface ProgressRepositoryOptions {
  mode: 'local' | 'cloud';
  userId: string;
}

type ProgressRow = {
  lesson_id: string;
  lesson_revision: number;
  files: Record<string, string>;
  revision: number;
  completed_at: string | null;
  completed_code: string | null;
  note: string;
  updated_at: string;
};

const volatileProgress = new Map<string, LessonProgress[]>();
const volatilePreferences = new Map<string, string>();

function progressKey(userId: string): string {
  return `tiny-dev-lab:progress:${encodeURIComponent(userId)}`;
}

function preferencesKey(userId: string): string {
  return `tiny-dev-lab:preferences:${encodeURIComponent(userId)}`;
}

function readLocalProgress(userId: string): LessonProgress[] {
  const volatile = volatileProgress.get(userId);
  if (volatile) return volatile;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(progressKey(userId)) ?? '[]');
    return Array.isArray(value) ? value as LessonProgress[] : [];
  } catch {
    return [];
  }
}

function writeLocalProgress(userId: string, progress: LessonProgress[]): boolean {
  volatileProgress.set(userId, progress);
  try {
    localStorage.setItem(progressKey(userId), JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

function readLastLesson(userId: string): string | null {
  const volatile = volatilePreferences.get(userId);
  if (volatile) return volatile;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(preferencesKey(userId)) ?? '{}');
    return value && typeof value === 'object' && typeof (value as { lastLesson?: unknown }).lastLesson === 'string'
      ? (value as { lastLesson: string }).lastLesson
      : null;
  } catch {
    return null;
  }
}

function writeLastLesson(userId: string, lessonId: string): boolean {
  volatilePreferences.set(userId, lessonId);
  try {
    localStorage.setItem(preferencesKey(userId), JSON.stringify({ lastLesson: lessonId }));
    return true;
  } catch {
    return false;
  }
}

function toProgress(row: ProgressRow): LessonProgress {
  return {
    lessonId: row.lesson_id,
    lessonRevision: row.lesson_revision,
    files: row.files,
    version: row.revision,
    completedAt: row.completed_at,
    completedCode: row.completed_code,
    note: row.note,
    updatedAt: row.updated_at,
  };
}

function cloneWithVersion(progress: LessonProgress, version: number): LessonProgress {
  return { ...progress, files: { ...progress.files }, version, updatedAt: new Date().toISOString() };
}

function clientOrThrow() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Cloud progress is not configured.');
  return client;
}

function localRepository({ userId }: ProgressRepositoryOptions): ProgressRepository {
  return {
    async load(lessonId) {
      return readLocalProgress(userId).find((item) => item.lessonId === lessonId) ?? null;
    },
    async save(progress, expectedVersion) {
      const all = readLocalProgress(userId);
      const current = all.find((item) => item.lessonId === progress.lessonId);
      const currentVersion = current?.version ?? 0;
      if (currentVersion !== expectedVersion) return { status: 'conflict', remote: current ?? cloneWithVersion(progress, 0) };
      const saved = cloneWithVersion(progress, expectedVersion + 1);
      if (!writeLocalProgress(userId, [...all.filter((item) => item.lessonId !== progress.lessonId), saved])) {
        return { status: 'offline', message: 'Browser storage is unavailable; the draft remains only in this page.' };
      }
      return { status: 'saved', progress: saved };
    },
    async loadAll() {
      return readLocalProgress(userId);
    },
    async getLastLesson() {
      return readLastLesson(userId);
    },
    async setLastLesson(lessonId) {
      writeLastLesson(userId, lessonId);
    },
  };
}

function cloudRepository({ userId }: ProgressRepositoryOptions): ProgressRepository {
  return {
    async load(lessonId) {
      const client = clientOrThrow();
      const { data, error } = await client.from('lesson_progress')
        .select('lesson_id,lesson_revision,files,revision,completed_at,completed_code,note,updated_at')
        .eq('lesson_id', lessonId)
        .maybeSingle<ProgressRow>();
      if (error) {
        const draft = getLocalDraft(userId, lessonId);
        if (draft) return draft.progress;
        throw new Error(error.message);
      }
      const remote = data ? toProgress(data) : null;
      const draft = getLocalDraft(userId, lessonId);
      if (!draft) return remote;
      if (remote && remote.version !== draft.baseVersion) recordSyncConflict(userId, draft, remote);
      return draft.progress;
    },
    async save(progress, expectedVersion) {
      try {
        const { data, error } = await clientOrThrow().rpc('save_lesson_progress', {
          p_lesson_id: progress.lessonId,
          p_lesson_revision: progress.lessonRevision,
          p_files: progress.files,
          p_completed_at: progress.completedAt,
          p_completed_code: progress.completedCode,
          p_note: progress.note,
          p_expected_version: expectedVersion,
        });
        if (error) throw new Error(error.message);
        const result = data as { status?: string; progress?: ProgressRow } | null;
        if (!result?.progress) throw new Error('The server returned an invalid save response.');
        const remote = toProgress(result.progress);
        if (result.status === 'conflict') {
          saveLocalDraft(userId, progress, expectedVersion);
          recordSyncConflict(userId, getLocalDraft(userId, progress.lessonId) ?? {
            progress, baseVersion: expectedVersion, storedAt: new Date().toISOString(),
          }, remote);
          return { status: 'conflict', remote };
        }
        if (result.status !== 'saved') throw new Error('The server returned an unknown save status.');
        clearLocalDraft(userId, progress.lessonId);
        return { status: 'saved', progress: remote };
      } catch (error) {
        saveLocalDraft(userId, progress, expectedVersion);
        return { status: 'offline', message: error instanceof Error ? error.message : 'Cloud save failed.' };
      }
    },
    async loadAll() {
      const { data, error } = await clientOrThrow().from('lesson_progress')
        .select('lesson_id,lesson_revision,files,revision,completed_at,completed_code,note,updated_at');
      if (error) {
        const drafts = getPendingLogoutState(userId).drafts;
        if (drafts.length) return drafts.map((draft) => draft.progress);
        throw new Error(error.message);
      }
      const remoteProgress = (data ?? [] as ProgressRow[]).map(toProgress);
      const remoteByLesson = new Map(remoteProgress.map((item) => [item.lessonId, item]));
      for (const draft of getPendingLogoutState(userId).drafts) {
        const remote = remoteByLesson.get(draft.progress.lessonId);
        if (remote && remote.version !== draft.baseVersion) recordSyncConflict(userId, draft, remote);
        remoteByLesson.set(draft.progress.lessonId, draft.progress);
      }
      return [...remoteByLesson.values()];
    },
    async getLastLesson() {
      const { data, error } = await clientOrThrow().from('preferences')
        .select('value')
        .eq('key', 'last_lesson')
        .maybeSingle<{ value: unknown }>();
      if (error) return readLastLesson(userId);
      const lessonId = data && typeof data.value === 'string' ? data.value : null;
      if (lessonId) writeLastLesson(userId, lessonId);
      return lessonId;
    },
    async setLastLesson(lessonId) {
      writeLastLesson(userId, lessonId);
      const { error } = await clientOrThrow().from('preferences').upsert({
        user_id: userId,
        key: 'last_lesson',
        value: lessonId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' });
      if (error) throw new Error(error.message);
    },
  };
}

export function createProgressRepository(options: ProgressRepositoryOptions): ProgressRepository {
  return options.mode === 'local' ? localRepository(options) : cloudRepository(options);
}
