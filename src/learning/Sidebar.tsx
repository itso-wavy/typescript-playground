import { useEffect, useRef } from 'react';
import type { Lesson } from '../shared/contracts.js';

interface SidebarProps {
  lessons: Lesson[];
  selectedId: string;
  completedIds: Set<string>;
  open: boolean;
  onClose(): void;
  onSelect(id: string): void;
  onHome(): void;
}

const chapterNames: Record<number, string> = {
  0: '선택 진단', 1: '기초 타입과 모델', 2: '함수 계약과 제네릭', 3: '런타임 경계와 비동기', 4: '클래스·설정·모듈', 5: '고급 타입 계산', 6: '프레임워크 연결', 7: '주문 기능 종합 실습',
};

export function Sidebar({ lessons, selectedId, completedIds, open, onClose, onSelect, onHome }: SidebarProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  const chapters = lessons.reduce<Map<number, Lesson[]>>((groups, lesson) => {
    const existing = groups.get(lesson.chapter) ?? [];
    existing.push(lesson);
    groups.set(lesson.chapter, existing);
    return groups;
  }, new Map());

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="학습 목차">
      <div className="sidebar-mobile-head">
        <strong>목차</strong>
        <button ref={closeButton} className="icon-button" type="button" onClick={onClose} aria-label="목차 닫기">×</button>
      </div>
      <p className="sidebar-title">TypeScript 과정</p>
      <button className="sidebar-home" type="button" onClick={() => { onHome(); onClose(); }}>TypeScript 소개</button>
      {[...chapters.entries()].map(([chapter, chapterLessons]) => (
        <section className="chapter" key={chapter}>
          <h2>{chapterNames[chapter] ?? `챕터 ${chapter}`}</h2>
          <ul>
            {chapterLessons.map((lesson) => {
              const completed = completedIds.has(lesson.id);
              return <li key={lesson.id}><button type="button" className={lesson.id === selectedId ? 'selected' : ''} onClick={() => { onSelect(lesson.id); onClose(); }}>
                <span aria-hidden="true">{completed ? '✓' : lesson.id === selectedId ? '●' : '○'}</span><span>{lesson.order}. {lesson.navTitle ?? lesson.title}</span>
              </button></li>;
            })}
          </ul>
        </section>
      ))}
    </aside>
  );
}

