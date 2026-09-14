interface TypeScriptIntroProps {
  completedCount: number;
  totalCount: number;
  diagnosticCompletedCount: number;
  diagnosticTotalCount: number;
  hasSavedLesson: boolean;
  onStart(): void;
  onBack(): void;
}

export function TypeScriptIntro({ completedCount, totalCount, diagnosticCompletedCount, diagnosticTotalCount, hasSavedLesson, onStart, onBack }: TypeScriptIntroProps) {
  return (
    <main className="intro-page">
      <button className="back-link" type="button" onClick={onBack}>← 기술 스택 목록</button>
      <header className="intro-header">
        <p className="eyebrow">TypeScript 과정</p>
        <h1>TypeScript로 사전에 방지하는 런타임 오류</h1>
        <p className="intro-lead">TypeScript를 활용해 함수 입출력부터 API 응답, React Props까지 코드 수준에서 안전하게 관리하세요. 누락된 필드나 잘못된 속성명을 실행 전에 미리 찾아낼 수 있습니다.</p>
        <button className="primary-button intro-cta" type="button" onClick={onStart}>{hasSavedLesson ? '이어서 학습하기' : '첫 실습 시작하기'}</button>
      </header>
      <div className="intro-progress" aria-label="정식 실습 진행 상황"><strong>{completedCount} / {totalCount}</strong><span>정식 실습 완료</span></div>
      <p className="intro-diagnostic-progress" aria-label="선택 진단 진행 상황">선택 진단 {diagnosticCompletedCount} / {diagnosticTotalCount}</p>
      <section className="intro-sections">
        <article>
          <h2>왜 TypeScript를 써야 할까요?</h2>
          <ul>
            <li><strong>실행 전 오류 검출:</strong> 잘못된 타입 입력, 누락된 Props, 빈 API 필드를 작성 시점에 즉시 발견합니다.</li>
            <li><strong>명확한 코드 계약:</strong> 변수, 함수, 컴포넌트 간의 데이터 흐름을 타입으로 정의하여 유지보수성을 높입니다.</li>
          </ul>
        </article>
        <article>
          <h2>커리큘럼 구성</h2>
          <ul>
            <li><strong>사전 진단 (선택):</strong> 4개의 진단 문항으로 현재 실력을 점검하고, 필요한 실습 코스를 추천받습니다. (진도에 미포함)</li>
            <li><strong>핵심 실습:</strong> 30개의 핵심 과제</li>
            <li><strong>확장 실습:</strong> 6개의 심화 선택 과제</li>
          </ul>
        </article>
        <article>
          <h2>왜 이 순서로 학습하나요?</h2>
          <p>기초 개념부터 실무 아키텍처까지 점진적으로 연결되는 구조를 갖췄습니다.</p>
          <ol>
            <li><strong>기초 타입과 모델:</strong> 변수, 리터럴, 튜플</li>
            <li><strong>함수 계약과 제네릭:</strong> 타입 간의 관계 연결</li>
            <li><strong>런타임 경계와 실패 처리:</strong> <code>unknown</code>, DTO, Result 패턴</li>
            <li><strong>프로젝트 기반 구축:</strong> 클래스, 모듈, <code>tsconfig</code> (Node.js)</li>
            <li><strong>고급 타입 계산:</strong> 복잡한 타입 추론과 조작</li>
            <li><strong>프레임워크 연동:</strong> React, Node.js, NestJS 타입 경계 설계</li>
            <li><strong>종합 실습:</strong> 작은 주문 기능 구현 완성</li>
          </ol>
          <p><em>React 과정에서는 Props와 상태(State)의 타입을 연결하고, Node.js·NestJS 과정에서는 DTO와 도메인 규칙으로 API 계약을 완성합니다. 단순히 문법을 배우는 데 그치지 않고, 다음 단계로 확장 가능한 <strong>타입 경계 설계 능력</strong>을 기르는 데 초점을 둡니다.</em></p>
        </article>
      </section>
    </main>
  );
}
