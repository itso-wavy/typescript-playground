import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthGate, useAuth } from './auth/AuthGate.js';
import { lessons } from './curriculum/index.js';
import { createProgressRepository } from './progress/repository.js';
import { exportPendingDrafts, getPendingLogoutState } from './progress/local-drafts.js';
import type { CheckRequest, CheckResult, LessonProgress } from './shared/contracts.js';
import { LessonPage } from './learning/LessonPage.js';
import { Sidebar } from './learning/Sidebar.js';
import { TechStackCatalog } from './learning/TechStackCatalog.js';
import { TypeScriptIntro } from './learning/TypeScriptIntro.js';

function initialLessonId(): string {
  const requested = new URLSearchParams(window.location.search).get('lesson');
  return lessons.some((lesson) => lesson.id === requested) ? requested! : lessons.find((lesson) => lesson.kind === 'practice')?.id ?? lessons[0]?.id ?? '';
}

type AppView = 'catalog' | 'intro' | 'lesson';

function initialView(): AppView {
  const params = new URLSearchParams(window.location.search);
  if (params.get('lesson') && lessons.some((lesson) => lesson.id === params.get('lesson'))) return 'lesson';
  return params.get('stack') === 'typescript' ? 'intro' : 'catalog';
}

async function requestCheck(request: CheckRequest, accessToken: string | null, signal: AbortSignal): Promise<CheckResult> {
  const response = await fetch('/api/check', {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
    body: JSON.stringify(request),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const message = body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string'
      ? (body as { message: string }).message : `확인 요청이 실패했습니다 (${response.status}).`;
    throw new Error(message);
  }
  return body as CheckResult;
}

function LearningApp() {
  const { mode, userId, accessToken, signOut } = useAuth();
  const repository = useMemo(() => createProgressRepository({ mode, userId }), [mode, userId]);
  const [selectedId, setSelectedId] = useState(initialLessonId);
  const [view, setView] = useState<AppView>(initialView);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [lastLesson, setLastLesson] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutPrompt, setLogoutPrompt] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const learnerSelected = useRef(false);
  const progressRevision = useRef(0);
  const selected = lessons.find((lesson) => lesson.id === selectedId);
  const practices = lessons.filter((lesson) => lesson.kind === 'practice');
  const practiceIds = new Set(practices.map((lesson) => lesson.id));
  const diagnosticIds = new Set(lessons.filter((lesson) => lesson.kind === 'diagnostic').map((lesson) => lesson.id));
  const completedIds = new Set(progress.filter((item) => item.completedAt && practiceIds.has(item.lessonId)).map((item) => item.lessonId));
  const completedDiagnosticIds = new Set(progress.filter((item) => item.completedAt && diagnosticIds.has(item.lessonId)).map((item) => item.lessonId));
  const sidebarCompletedIds = new Set([...completedIds, ...completedDiagnosticIds]);

  useEffect(() => {
    let current = true;
    const loadRevision = progressRevision.current;
    void repository.loadAll().then((all) => {
      if (current && loadRevision === progressRevision.current) setProgress(all);
    }).catch(() => { if (current && loadRevision === progressRevision.current) setProgress([]); });
    void repository.getLastLesson().then((last) => {
      if (current && last && lessons.some((lesson) => lesson.id === last)) setLastLesson(last);
    }).catch(() => undefined);
    return () => { current = false; };
  }, [repository]);

  const selectLesson = useCallback((lessonId: string) => {
    if (!lessons.some((lesson) => lesson.id === lessonId)) return;
    learnerSelected.current = true;
    setView('lesson');
    setSelectedId(lessonId);
    const url = new URL(window.location.href);
    url.searchParams.set('lesson', lessonId);
    window.history.replaceState({}, '', url);
    void repository.setLastLesson(lessonId).catch(() => undefined);
  }, [repository]);

  const openCatalog = () => {
    setView('catalog');
    const url = new URL(window.location.href);
    url.searchParams.delete('stack');
    url.searchParams.delete('lesson');
    window.history.pushState({}, '', url);
  };

  const openIntro = () => {
    setView('intro');
    const url = new URL(window.location.href);
    url.searchParams.set('stack', 'typescript');
    url.searchParams.delete('lesson');
    window.history.pushState({}, '', url);
  };

  const startLearning = async () => {
    const saved = lastLesson && lessons.some((lesson) => lesson.id === lastLesson)
      ? lastLesson
      : await repository.getLastLesson().catch(() => null);
    const firstPractice = practices[0]?.id ?? lessons[0]?.id;
    const lessonId = saved && lessons.some((lesson) => lesson.id === saved) ? saved : firstPractice;
    if (lessonId) selectLesson(lessonId);
  };

  const onNavigate = (direction: 'previous' | 'next') => {
    const index = lessons.findIndex((lesson) => lesson.id === selectedId);
    const next = lessons[index + (direction === 'next' ? 1 : -1)];
    if (next) selectLesson(next.id);
  };

  const handleProgress = (saved: LessonProgress) => {
    progressRevision.current += 1;
    setProgress((current) => [...current.filter((item) => item.lessonId !== saved.lessonId), saved]);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButton.current?.focus());
  };

  const exportDrafts = () => {
    const blob = new Blob([exportPendingDrafts(userId)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'tiny-dev-lab-unsynced-drafts.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const leave = async () => {
    if (getPendingLogoutState(userId).pending) {
      setLogoutPrompt(true);
      return;
    }
    await signOut();
  };

  if (view === 'catalog') {
    return <main className="app-shell"><header className="app-header"><a className="wordmark" href="?">작은 개발실.</a></header><TechStackCatalog onSelectTypeScript={openIntro} /></main>;
  }
  if (view === 'intro') {
    return <main className="app-shell"><header className="app-header"><a className="wordmark" href="?">작은 개발실.</a></header><TypeScriptIntro completedCount={completedIds.size} totalCount={practices.length} diagnosticCompletedCount={completedDiagnosticIds.size} diagnosticTotalCount={diagnosticIds.size} hasSavedLesson={Boolean(lastLesson)} onStart={() => void startLearning()} onBack={openCatalog} /></main>;
  }
  if (!selected) return <main className="app-shell"><p>학습 내용을 불러오지 못했습니다.</p></main>;
  const position = practices.findIndex((lesson) => lesson.id === selected.id) + 1;
  return (
    <main className="app-shell">
      <header className="app-header">
        <button ref={menuButton} className="menu-button" type="button" aria-label="목차 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>목차</button>
        <a className="wordmark" href="?">작은 개발실.</a>
        <p className="progress-count">{completedIds.size} / {practices.length}</p>
        {mode === 'cloud' && <button className="signout-button" type="button" onClick={() => void leave()}>나가기</button>}
      </header>
      <div className="learning-layout">
        <Sidebar lessons={lessons} selectedId={selected.id} completedIds={sidebarCompletedIds} open={menuOpen} onClose={closeMenu} onSelect={selectLesson} onHome={openIntro} />
        <div className="learning-content">
          {completedIds.size === practices.length && <aside className="completion-note"><strong>정식 실습 36개를 모두 확인했습니다.</strong><a href="#weak-chapters">다시 볼 챕터 찾기</a></aside>}
          <LessonPage
            key={selected.id}
            lesson={selected}
            position={position > 0 ? position : 0}
            repository={repository}
            checkLesson={(request, signal) => requestCheck(request, accessToken, signal)}
            onProgressSaved={handleProgress}
            onNavigate={onNavigate}
            userId={userId}
          />
          <section id="weak-chapters" className="weak-chapters"><h2>다시 볼 챕터</h2><p>완료되지 않은 실습이 있는 챕터를 목차에서 골라 이어서 확인하세요.</p></section>
        </div>
      </div>
      {logoutPrompt && <div className="dialog-backdrop" role="presentation"><section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title"><h2 id="logout-title">저장되지 않은 초안이 있습니다.</h2><p>클라우드에 연결되면 다시 동기화할 수 있습니다. 나가기 전에 JSON으로 내보낼 수도 있습니다.</p><div><button className="quiet-button" type="button" onClick={exportDrafts}>초안 내보내기</button><button className="quiet-button" type="button" onClick={() => setLogoutPrompt(false)}>계속 학습</button><button className="primary-button" type="button" onClick={() => void signOut()}>그래도 나가기</button></div></section></div>}
    </main>
  );
}

export default function App() {
  return <AuthGate><LearningApp /></AuthGate>;
}
