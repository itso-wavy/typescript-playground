import type { Lesson } from '../shared/contracts.js';

interface ReviewPanelProps {
  lesson: Lesson;
  note: string;
  onNoteChange(note: string): void;
  onSkip(): void;
}

export function ReviewPanel({ lesson, note, onNoteChange, onSkip }: ReviewPanelProps) {
  if (!lesson.interview) return null;
  return (
    <section className="review-panel" aria-labelledby="review-heading">
      <div>
        <p className="section-label">챕터 복습 · 선택</p>
        <h2 id="review-heading">{lesson.interview.question}</h2>
        <p>직접 답을 정리한 뒤 아래 관점을 펼쳐 보세요. 답변은 저장하거나 채점하지 않습니다.</p>
      </div>
      <details>
        <summary>답과 관점 보기</summary>
        <p>{lesson.interview.answer}</p>
        <ul>{lesson.interview.points.map((point) => <li key={point}>{point}</li>)}</ul>
      </details>
      <label className="review-note" htmlFor="review-note">내 답 정리 <span>(선택)</span>
        <textarea id="review-note" value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="다음에 다시 볼 핵심을 짧게 적어 보세요." />
      </label>
      <button className="text-button" type="button" onClick={onSkip}>이번 복습은 건너뛰기</button>
    </section>
  );
}
