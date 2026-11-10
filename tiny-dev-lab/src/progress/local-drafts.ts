import type { LessonProgress } from '../shared/contracts.js';

export interface LocalDraft {
  progress: LessonProgress;
  baseVersion: number;
  storedAt: string;
}

export interface PendingLogoutState {
  pending: boolean;
  drafts: LocalDraft[];
}

export interface SyncConflict {
  local: LocalDraft;
  remote: LessonProgress;
}

export interface ConflictResolution {
  progress: LessonProgress;
  expectedVersion: number;
}

const volatileDrafts = new Map<string, LocalDraft[]>();
const volatileConflicts = new Map<string, SyncConflict[]>();

function keyFor(userId: string): string {
  return `tiny-dev-lab:pending-drafts:${encodeURIComponent(userId)}`;
}

function conflictKeyFor(userId: string): string {
  return `tiny-dev-lab:progress-conflicts:${encodeURIComponent(userId)}`;
}

function readDrafts(userId: string): LocalDraft[] {
  const volatile = volatileDrafts.get(userId);
  if (volatile) return volatile;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]');
    return Array.isArray(value) ? value as LocalDraft[] : [];
  } catch {
    return [];
  }
}

function writeDrafts(userId: string, drafts: LocalDraft[]): void {
  volatileDrafts.set(userId, drafts);
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(drafts));
  } catch {
    // Quota/privacy failures still retain the user's draft until this page is closed.
  }
}

function readConflicts(userId: string): SyncConflict[] {
  const volatile = volatileConflicts.get(userId);
  if (volatile) return volatile;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(conflictKeyFor(userId)) ?? '[]');
    return Array.isArray(value) ? value as SyncConflict[] : [];
  } catch {
    return [];
  }
}

function writeConflicts(userId: string, conflicts: SyncConflict[]): void {
  volatileConflicts.set(userId, conflicts);
  try {
    localStorage.setItem(conflictKeyFor(userId), JSON.stringify(conflicts));
  } catch {
    // The in-memory conflict remains resolvable even if browser storage is unavailable.
  }
}

export function saveLocalDraft(userId: string, progress: LessonProgress, baseVersion: number): void {
  const draft: LocalDraft = { progress, baseVersion, storedAt: new Date().toISOString() };
  const existing = readDrafts(userId).filter((item) => item.progress.lessonId !== progress.lessonId);
  writeDrafts(userId, [...existing, draft]);
}

export function getLocalDraft(userId: string, lessonId: string): LocalDraft | null {
  return readDrafts(userId).find((draft) => draft.progress.lessonId === lessonId) ?? null;
}

export function clearLocalDraft(userId: string, lessonId: string): void {
  writeDrafts(userId, readDrafts(userId).filter((draft) => draft.progress.lessonId !== lessonId));
}

export function recordSyncConflict(userId: string, local: LocalDraft, remote: LessonProgress): void {
  const remaining = readConflicts(userId).filter((conflict) => conflict.local.progress.lessonId !== local.progress.lessonId);
  writeConflicts(userId, [...remaining, { local, remote }]);
}

export function getSyncConflict(userId: string, lessonId: string): SyncConflict | null {
  return readConflicts(userId).find((conflict) => conflict.local.progress.lessonId === lessonId) ?? null;
}

export function prepareConflictResolution(
  userId: string,
  lessonId: string,
  choice: 'keep-local' | 'use-remote',
): ConflictResolution | null {
  const conflict = getSyncConflict(userId, lessonId);
  if (!conflict) return null;
  writeConflicts(userId, readConflicts(userId).filter((item) => item.local.progress.lessonId !== lessonId));
  if (choice === 'use-remote') {
    clearLocalDraft(userId, lessonId);
    return { progress: conflict.remote, expectedVersion: conflict.remote.version };
  }
  saveLocalDraft(userId, conflict.local.progress, conflict.remote.version);
  return { progress: conflict.local.progress, expectedVersion: conflict.remote.version };
}

export function getPendingLogoutState(userId: string): PendingLogoutState {
  const drafts = readDrafts(userId);
  return { pending: drafts.length > 0, drafts };
}

export function exportPendingDrafts(userId: string): string {
  return JSON.stringify(getPendingLogoutState(userId).drafts);
}
