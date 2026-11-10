import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CheckRequest, CheckResult, FileMap, Lesson, LessonProgress, RuntimeResult, SaveResult } from '../shared/contracts.js';
import { runBundle } from '../runner/browser-runner.js';
import { CodeEditor } from './CodeEditor.js';
import { ResultPanel } from './ResultPanel.js';
import { ReviewPanel } from './ReviewPanel.js';
import { FormattedText, HighlightedTypeScript } from './FormattedText.js';
import { getSyncConflict, prepareConflictResolution } from '../progress/local-drafts.js';

export interface ProgressStore {
  load(lessonId: string): Promise<LessonProgress | null>;
  save(progress: LessonProgress, expectedVersion: number): Promise<SaveResult>;
}

export interface LessonPageProps {
  lesson: Lesson;
  position: number;
  repository: ProgressStore;
  checkLesson(request: CheckRequest, signal: AbortSignal): Promise<CheckResult>;
  onProgressSaved(progress: LessonProgress): void;
  onNavigate(direction: 'previous' | 'next'): void | Promise<void>;
  userId?: string;
}

function cloneFiles(files: FileMap): FileMap {
  return Object.fromEntries(Object.entries(files).map(([path, contents]) => [path, contents]));
}

function stableFiles(files: FileMap): string {
  return JSON.stringify(Object.fromEntries(Object.entries(files).sort(([left], [right]) => left.localeCompare(right))));
}

export function LessonPage({ lesson, position, repository, checkLesson, onProgressSaved, onNavigate, userId }: LessonPageProps) {
  const [files, setFiles] = useState<FileMap>(() => cloneFiles(lesson.starter));
  const [activeFile, setActiveFile] = useState(() => Object.keys(lesson.starter)[0] ?? 'index.ts');
  const [version, setVersion] = useState(0);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [completedCode, setCompletedCode] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [runtime, setRuntime] = useState<RuntimeResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [reviewSkipped, setReviewSkipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saveTick, setSaveTick] = useState(0);
  const revision = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const mountedLesson = useRef(lesson.id);
  const mounted = useRef(true);
  const saveQueue = useRef(Promise.resolve());
  const versionRef = useRef(0);
  const stateRef = useRef({ files, completedAt, completedCode, note });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [conflict, setConflict] = useState<LessonProgress | null>(null);

  useEffect(() => { stateRef.current = { files, completedAt, completedCode, note }; }, [files, completedAt, completedCode, note]);
  useEffect(() => { versionRef.current = version; }, [version]);

  useEffect(() => {
    mountedLesson.current = lesson.id;
    activeRequest.current?.abort();
    revision.current = 0;
    setFiles(cloneFiles(lesson.starter));
    setActiveFile(Object.keys(lesson.starter)[0] ?? 'index.ts');
    setVersion(0);
    setCompletedAt(null);
    setCompletedCode(null);
    setNote('');
    setResult(null);
    setRuntime(null);
    setChecking(false);
    setHydrated(false);
    setHintCount(0);
    setReviewSkipped(false);
    const loadRevision = revision.current;
    let active = true;
    void repository.load(lesson.id).then((saved) => {
      if (!active || mountedLesson.current !== lesson.id || revision.current !== loadRevision) return;
      if (saved) {
        setFiles(cloneFiles(saved.files)); setVersion(saved.version); setCompletedAt(saved.completedAt); setCompletedCode(saved.completedCode); setNote(saved.note);
      }
      const storedConflict = userId ? getSyncConflict(userId, lesson.id) : null;
      if (storedConflict) setConflict(storedConflict.remote);
    }).catch(() => {
      if (active) setSaveMessage('이전 진도를 불러오지 못했습니다. 새 초안으로 계속할 수 있습니다.');
    }).finally(() => { if (active && mountedLesson.current === lesson.id) setHydrated(true); });
    return () => { active = false; };
  }, [lesson, repository, userId]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; activeRequest.current?.abort(); };
  }, []);

  const queueSave = useCallback((override?: Partial<Pick<LessonProgress, 'files' | 'completedAt' | 'completedCode' | 'note'>>) => {
    const captured = { ...stateRef.current, ...override };
    saveQueue.current = saveQueue.current.then(async () => {
      if (!mounted.current || mountedLesson.current !== lesson.id) return;
      const progress: LessonProgress = {
        lessonId: lesson.id, lessonRevision: lesson.revision, files: captured.files,
        version: versionRef.current, completedAt: captured.completedAt, completedCode: captured.completedCode,
        note: captured.note, updatedAt: new Date().toISOString(),
      };
      const saved = await repository.save(progress, versionRef.current);
      if (!mounted.current || mountedLesson.current !== lesson.id) return;
      if (saved.status === 'saved') {
        versionRef.current = saved.progress.version;
        setVersion(saved.progress.version);
        setSaveMessage(null);
        onProgressSaved(saved.progress);
      } else if (saved.status === 'conflict') {
        setConflict(saved.remote);
        setSaveMessage('다른 저장본이 있습니다. 이 화면의 코드와 서버 저장본 중 하나를 선택하세요.');
      } else {
        setSaveMessage('클라우드에 저장하지 못했습니다. 이 기기의 초안은 보존되며 나갈 때 내보낼 수 있습니다.');
      }
    }).catch((error: unknown) => {
      if (mounted.current) setSaveMessage(error instanceof Error ? error.message : '진도를 저장하지 못했습니다.');
    });
    return saveQueue.current;
  }, [lesson.id, lesson.revision, onProgressSaved, repository]);

  useEffect(() => {
    if (!hydrated || saveTick === 0) return;
    const timer = window.setTimeout(() => { void queueSave(); }, 500);
    return () => window.clearTimeout(timer);
  }, [hydrated, queueSave, saveTick]);

  const currentCode = stableFiles(files);
  const isInitialCode = currentCode === stableFiles(lesson.starter);
  const needsRecheck = completedCode !== null && completedCode !== currentCode && !isInitialCode;
  const visibleHints = lesson.hints.slice(0, hintCount);
  const currentFile = files[activeFile] ?? '';
  const codeLabel = useMemo(() => lesson.kind === 'diagnostic' ? '진단 확인' : '실행·확인', [lesson.kind]);

  const changeFile = (file: string, value: string) => {
    activeRequest.current?.abort();
    setChecking(false);
    revision.current += 1;
    setFiles((current) => {
      const next = { ...current, [file]: value };
      stateRef.current = { ...stateRef.current, files: next };
      return next;
    });
    setSaveTick((tick) => tick + 1);
    setResult(null);
    setRuntime(null);
  };

  const run = async () => {
    if (checking) return;
    const requestRevision = revision.current;
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    setChecking(true);
    setResult(null);
    setRuntime(null);
    try {
      const response = await checkLesson({
        lessonId: lesson.id,
        files: Object.fromEntries(lesson.editableFiles.map((path) => [path, files[path] ?? ''])),
        requestId: crypto.randomUUID(),
        codeRevision: requestRevision,
      }, controller.signal);
      if (controller.signal.aborted || mountedLesson.current !== lesson.id || requestRevision !== revision.current || response.codeRevision !== requestRevision) return;
      setResult(response);
      let runtimeResult: RuntimeResult | null = null;
      if (response.status === 'ready' && lesson.mode !== 'typecheck') {
        if (!response.bundle) {
          setResult({ ...response, status: 'system-error', message: '실행에 필요한 번들을 받지 못했습니다.' });
          return;
        }
        runtimeResult = await runBundle(response.bundle, controller.signal);
        if (controller.signal.aborted || mountedLesson.current !== lesson.id || requestRevision !== revision.current) return;
        setRuntime(runtimeResult);
      }
      const passed = response.status === 'ready' && (lesson.mode === 'typecheck' || runtimeResult?.status === 'passed');
      if (passed) {
        const completed = completedAt ?? new Date().toISOString();
        const code = stableFiles(files);
        setCompletedAt(completed);
        setCompletedCode(code);
        stateRef.current = { ...stateRef.current, completedAt: completed, completedCode: code };
        await queueSave({ completedAt: completed, completedCode: code });
      } else await queueSave();
    } catch (error) {
      if (!controller.signal.aborted && mountedLesson.current === lesson.id && requestRevision === revision.current) {
        setResult({ lessonId: lesson.id, requestId: '', codeRevision: requestRevision, status: 'system-error', diagnostics: [], checks: [], compilerVersion: lesson.compilerVersion, message: error instanceof Error ? error.message : '확인 요청을 처리하지 못했습니다.' });
      }
    } finally {
      if (!controller.signal.aborted && mountedLesson.current === lesson.id && requestRevision === revision.current) setChecking(false);
    }
  };

  const reset = () => {
    if (!window.confirm('작성한 코드를 처음 상태로 되돌릴까요?')) return;
    activeRequest.current?.abort();
    setChecking(false);
    revision.current += 1;
    const starter = cloneFiles(lesson.starter);
    stateRef.current = { ...stateRef.current, files: starter };
    setFiles(starter);
    setSaveTick((tick) => tick + 1);
    setActiveFile(Object.keys(lesson.starter)[0] ?? 'index.ts');
    setResult(null);
    setRuntime(null);
  };

  const showSolution = () => {
    activeRequest.current?.abort();
    setChecking(false);
    revision.current += 1;
    const solution = cloneFiles(lesson.solution);
    stateRef.current = { ...stateRef.current, files: solution };
    setFiles(solution);
    setSaveTick((tick) => tick + 1);
    setActiveFile(Object.keys(lesson.solution)[0] ?? 'index.ts');
    setResult(null);
    setRuntime(null);
  };

  const resolveConflict = (choice: 'keep-local' | 'use-remote') => {
    const prepared = userId ? prepareConflictResolution(userId, lesson.id, choice) : null;
    const source = prepared?.progress ?? (choice === 'use-remote' ? conflict : null);
    const expectedVersion = prepared?.expectedVersion ?? conflict?.version;
    if (!source || expectedVersion === undefined) return;
    setFiles(cloneFiles(source.files));
    setNote(source.note);
    setCompletedAt(source.completedAt);
    setCompletedCode(source.completedCode);
    setVersion(expectedVersion);
    versionRef.current = expectedVersion;
    stateRef.current = { files: source.files, note: source.note, completedAt: source.completedAt, completedCode: source.completedCode };
    setConflict(null);
    if (choice === 'keep-local') void queueSave({ files: source.files, note: source.note, completedAt: source.completedAt, completedCode: source.completedCode });
    else onProgressSaved(source);
  };

  const navigate = async (direction: 'previous' | 'next') => {
    await queueSave({ files: stateRef.current.files, note: stateRef.current.note, completedAt: stateRef.current.completedAt, completedCode: stateRef.current.completedCode });
    await onNavigate(direction);
  };

  return (
    <article className="lesson-page">
      <header className="lesson-header">
        <p className="section-label">{lesson.kind === 'diagnostic' ? '선택 진단' : `실습 ${position}`} · 약 {lesson.minutes}분</p>
        <h1>{lesson.title}</h1>
        <p className="lesson-summary">{lesson.summary}</p>
      </header>

      <section className="lesson-copy" aria-label="학습 설명">
        <p><FormattedText text={lesson.story} /></p>
        <h2>이번에 확인할 것</h2>
        <ul>{lesson.concept.map((item) => <li key={item}><FormattedText text={item} /></li>)}</ul>
        {lesson.workedExample ? (
          <section className="worked-example" aria-labelledby="worked-example-heading">
            <h2 id="worked-example-heading">{lesson.workedExample.title}</h2>
            <pre><HighlightedTypeScript code={lesson.workedExample.code} /></pre>
            <ul>{lesson.workedExample.result.map((item) => <li key={item}><FormattedText text={item} /></li>)}</ul>
          </section>
        ) : null}
        <h2>과제</h2>
        <p><FormattedText text={lesson.mission} /></p>
        <ul className="goals">{lesson.goals.map((goal) => <li key={goal}><FormattedText text={goal} /></li>)}</ul>
      </section>

      <CodeEditor files={files} editableFiles={lesson.editableFiles} activeFile={activeFile} onActiveFileChange={setActiveFile} onChange={changeFile} onRun={run} running={checking} />
      <div className="editor-actions">
        <button className="primary-button" type="button" onClick={run} disabled={checking}>{codeLabel}</button>
        <button className="quiet-button" type="button" onClick={reset}>초기화</button>
        <button className="quiet-button" type="button" onClick={showSolution}>해설 코드 보기</button>
        <span className="editor-status" aria-live="polite">{checking ? '확인 중' : currentFile ? `${activeFile} 편집 중` : '파일 없음'}</span>
      </div>

      <ResultPanel checking={checking} result={result} runtime={runtime} needsRecheck={needsRecheck} />

      <section className="hints" aria-labelledby="hint-heading">
        <div className="hint-heading"><h2 id="hint-heading">힌트</h2><span>{hintCount} / {lesson.hints.length}</span></div>
        {visibleHints.map((hint, index) => <p key={hint}><strong>{index + 1}.</strong> <FormattedText text={hint} /></p>)}
        {hintCount < lesson.hints.length && <button className="quiet-button" type="button" onClick={() => setHintCount((count) => count + 1)}>힌트 하나 보기</button>}
      </section>

      <section className="explanation" aria-labelledby="why-heading">
        <h2 id="why-heading">왜 이런가요?</h2>
        {lesson.explanation.map((item) => <p key={item}><FormattedText text={item} /></p>)}
        <div className="sources">{lesson.sources.map((source) => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title}</a>)}</div>
      </section>

      {saveMessage && <p className="save-message" role="status">{saveMessage}</p>}
      {conflict && <section className="conflict-panel" aria-label="저장 충돌"><p>서버 저장본은 {new Date(conflict.updatedAt).toLocaleString('ko-KR')}에 수정되었습니다.</p><button className="quiet-button" type="button" onClick={() => resolveConflict('use-remote')}>서버 저장본 사용</button><button className="quiet-button" type="button" onClick={() => resolveConflict('keep-local')}>이 화면의 코드 유지</button></section>}
      {!reviewSkipped && <ReviewPanel lesson={lesson} note={note} onNoteChange={(value) => { setNote(value); setSaveTick((tick) => tick + 1); }} onSkip={() => setReviewSkipped(true)} />}

      <nav className="lesson-nav" aria-label="실습 이동">
        <button className="quiet-button" type="button" onClick={() => void navigate('previous')}>이전 실습</button>
        <button className="primary-button" type="button" onClick={() => void navigate('next')}>다음 실습</button>
      </nav>
    </article>
  );
}
