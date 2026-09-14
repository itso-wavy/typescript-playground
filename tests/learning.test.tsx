import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonPage, type ProgressStore } from '../src/learning/LessonPage.js';
import { lessons } from '../src/curriculum/index.js';
import type { CheckResult, Lesson, LessonProgress } from '../src/shared/contracts.js';
import { getSyncConflict, recordSyncConflict } from '../src/progress/local-drafts.js';

const saved: LessonProgress[] = [];

function repository(): ProgressStore & { load: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> } {
  return {
    load: vi.fn(async () => null),
    save: vi.fn(async (progress: LessonProgress) => {
      const item = { ...progress, version: progress.version + 1 };
      saved.push(item);
      return { status: 'saved' as const, progress: item };
    }),
  };
}

function ready(request: { lessonId: string; requestId: string; codeRevision: number }): CheckResult {
  return { lessonId: request.lessonId, requestId: request.requestId, codeRevision: request.codeRevision, status: 'ready', diagnostics: [], checks: [{ name: '타입 계약', passed: true }], compilerVersion: '7.0.2' };
}

function page(lesson: Lesson, check = vi.fn(async (request) => ready(request))) {
  const store = repository();
  const navigation = vi.fn();
  render(<LessonPage lesson={lesson} position={lesson.kind === 'practice' ? 1 : 0} repository={store} checkLesson={check} onProgressSaved={() => undefined} onNavigate={navigation} />);
  return { store, navigation, check };
}

afterEach(() => {
  saved.length = 0;
  cleanup();
  vi.restoreAllMocks();
});

describe('learning screen', () => {
  it('shows a worked example before the first lesson assignment', () => {
    const lesson = lessons.find((item) => item.id === 'ts01.inference-literals')!;
    page(lesson);

    const example = screen.getByRole('heading', { name: /완성 예시: 기능 플래그/ });
    const assignment = screen.getByRole('heading', { name: '과제' });
    expect(example.compareDocumentPosition(assignment) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(screen.getByText(/as const satisfies Record/)).not.toBeNull();
    expect(screen.getByText(/"enabled"를 입력하면 타입 오류/)).not.toBeNull();
  });

  it('moves to the next lesson without marking it complete', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'ts01.inference-literals')!;
    const { navigation, store } = page(lesson);

    await user.click(screen.getByRole('button', { name: '다음 실습' }));

    await waitFor(() => expect(navigation).toHaveBeenCalledWith('next'));
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ completedAt: null, completedCode: null }), 0);
  });

  it('marks a successful diagnostic as completed', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const { store } = page(lesson);

    await user.click(screen.getByRole('button', { name: '진단 확인' }));

    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ completedAt: expect.any(String), completedCode: expect.any(String) }), 0);
  });

  it('shows a solution without treating it as a completed result', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'ts01.inference-literals')!;
    const { store } = page(lesson);

    await user.click(screen.getByRole('button', { name: '해설 코드 보기' }));

    expect((screen.getByRole('textbox', { name: 'index.ts 코드' }) as HTMLTextAreaElement).value).toBe(lesson.solution['index.ts']);
    expect(store.save).not.toHaveBeenCalled();
    expect(screen.queryByText('타입 계약을 통과했습니다.')).toBeNull();
  });

  it('discards an old check response after code changes', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'ts01.inference-literals')!;
    const check = vi.fn(async (request) => ready(request));
    page(lesson, check);

    await user.click(screen.getByRole('button', { name: '실행·확인' }));
    expect(await screen.findByText('타입 계약을 통과했습니다.')).not.toBeNull();
    await user.type(screen.getByRole('textbox', { name: 'index.ts 코드' }), '\n// newer');

    expect(await screen.findByText('코드가 바뀌었습니다. 다시 실행해 확인하세요.')).not.toBeNull();
    expect(screen.queryByText('타입 계약을 통과했습니다.')).toBeNull();
  });

  it('shows the latest type error after rerunning changed completed code', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'ts01.inference-literals')!;
    const check = vi.fn(async (request) => check.mock.calls.length === 1
      ? ready(request)
      : {
          lessonId: request.lessonId,
          requestId: request.requestId,
          codeRevision: request.codeRevision,
          status: 'type-error' as const,
          diagnostics: [{ file: 'index.ts', line: 1, column: 1, code: 2322, message: '허용되지 않은 환경입니다.' }],
          checks: [],
          compilerVersion: '7.0.2',
          message: '타입 오류를 수정하세요.',
        });
    page(lesson, check);

    await user.click(screen.getByRole('button', { name: '실행·확인' }));
    expect(await screen.findByText('타입 계약을 통과했습니다.')).not.toBeNull();
    await user.type(screen.getByRole('textbox', { name: 'index.ts 코드' }), '\n// changed');
    await user.click(screen.getByRole('button', { name: '실행·확인' }));

    expect(await screen.findByText('아직 타입 계약을 만족하지 않습니다.')).not.toBeNull();
    expect(screen.getByText('타입 오류를 수정하세요.')).not.toBeNull();
    expect(screen.queryByText('코드가 바뀌었습니다. 다시 실행해 확인하세요.')).toBeNull();
  });

  it('reveals hints one at a time', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    page(lesson);

    expect(screen.queryByText(lesson.hints[0]!)).toBeNull();
    await user.click(screen.getByRole('button', { name: '힌트 하나 보기' }));
    expect(screen.getByText(lesson.hints[0]!)).not.toBeNull();
    expect(screen.queryByText(lesson.hints[1]!)).toBeNull();
  });

  it('asks before resetting the editor', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    page(lesson);
    const editor = screen.getByRole('textbox', { name: 'index.ts 코드' });
    await user.type(editor, '\n// keep');
    await user.click(screen.getByRole('button', { name: '초기화' }));
    expect(confirm).toHaveBeenCalled();
    expect((editor as HTMLTextAreaElement).value).toContain('// keep');
  });

  it('debounces an edit into a persisted draft', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const { store } = page(lesson);

    await user.type(screen.getByRole('textbox', { name: 'index.ts 코드' }), '\n// draft');
    await new Promise((resolve) => window.setTimeout(resolve, 560));

    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ files: expect.objectContaining({ 'index.ts': expect.stringContaining('// draft') }) }), 0);
  });

  it('shows a recovery choice when a draft save conflicts', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const store = repository();
    store.save.mockResolvedValueOnce({ status: 'conflict', remote: { lessonId: lesson.id, lessonRevision: lesson.revision, files: lesson.starter, version: 4, completedAt: null, completedCode: null, note: '', updatedAt: '2026-09-08T00:00:00.000Z' } });
    render(<LessonPage lesson={lesson} position={0} repository={store} checkLesson={vi.fn(async (request) => ready(request))} onProgressSaved={() => undefined} onNavigate={() => undefined} />);

    await user.type(screen.getByRole('textbox', { name: 'index.ts 코드' }), '\n// draft');
    await new Promise((resolve) => window.setTimeout(resolve, 560));

    expect(screen.getByRole('button', { name: '서버 저장본 사용' })).not.toBeNull();
    expect(screen.getByRole('button', { name: '이 화면의 코드 유지' })).not.toBeNull();
  });

  it('restores a reconnect conflict and clears it after choosing the local draft', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const local: LessonProgress = { lessonId: lesson.id, lessonRevision: lesson.revision, files: { 'index.ts': `${lesson.starter['index.ts']}\n// local` }, version: 1, completedAt: null, completedCode: null, note: 'keep this note', updatedAt: '2026-09-08T00:00:00.000Z' };
    const remote: LessonProgress = { ...local, files: lesson.solution, version: 4, note: 'remote note', updatedAt: '2026-09-08T01:00:00.000Z' };
    recordSyncConflict('reconnect-user', { progress: local, baseVersion: 1, storedAt: local.updatedAt }, remote);
    const store = repository();
    store.load.mockResolvedValue(local);
    render(<LessonPage lesson={lesson} position={0} repository={store} checkLesson={vi.fn(async (request) => ready(request))} onProgressSaved={() => undefined} onNavigate={() => undefined} userId="reconnect-user" />);

    await user.click(await screen.findByRole('button', { name: '이 화면의 코드 유지' }));

    await waitFor(() => expect(getSyncConflict('reconnect-user', lesson.id)).toBeNull());
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ files: local.files, note: 'keep this note' }), remote.version);
  });

  it('flushes a just-edited draft before moving to another lesson', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const { store, navigation } = page(lesson);

    await user.type(screen.getByRole('textbox', { name: 'index.ts 코드' }), '\n// leave now');
    await user.click(screen.getByRole('button', { name: '다음 실습' }));

    await waitFor(() => expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ files: expect.objectContaining({ 'index.ts': expect.stringContaining('// leave now') }) }), 0));
    expect(navigation).toHaveBeenCalledWith('next');
  });

  it('allows an optional chapter review to be skipped', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd4')!;
    page(lesson);

    await user.click(screen.getByRole('button', { name: '이번 복습은 건너뛰기' }));

    expect(screen.queryByText(lesson.interview!.question)).toBeNull();
  });

  it('runs from Ctrl+Enter and indents with Tab', async () => {
    const user = userEvent.setup();
    const lesson = lessons.find((item) => item.id === 'd1')!;
    const { check } = page(lesson);
    const editor = screen.getByRole('textbox', { name: 'index.ts 코드' });
    editor.focus();

    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(check).toHaveBeenCalledOnce();
    await user.keyboard('{Tab}');
    expect((editor as HTMLTextAreaElement).value).toMatch(/^ {2}/);
    expect(document.activeElement).toBe(editor);
  });
});
