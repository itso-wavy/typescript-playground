interface TechStackCatalogProps {
  onSelectTypeScript(): void;
}

const stacks = [
  { name: 'TypeScript', description: '변수와 함수의 값 형태를 적고, 실행 전 실수 찾기', available: true },
  { name: 'React', description: '컴포넌트로 화면을 만들고 상태 바꾸기', available: false },
  { name: 'Next.js', description: '서버와 브라우저에서 페이지 실행하기', available: false },
  { name: 'NestJS', description: '백엔드 기능을 모듈로 나누어 만들기', available: false },
  { name: 'Prisma', description: '데이터베이스 값을 애플리케이션에서 다루기', available: false },
  { name: 'Jest / RTL', description: '코드가 예상대로 동작하는지 테스트하기', available: false },
  { name: 'Redis', description: '자주 쓰는 값을 빠르게 저장하고 꺼내기', available: false },
] as const;

export function TechStackCatalog({ onSelectTypeScript }: TechStackCatalogProps) {
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">작은 개발실.</p>
        <h1>배울 기술을 골라 보세요.</h1>
        <p>관심 있는 기술을 고르고, 준비된 과정부터 시작해 보세요.</p>
      </header>
      <section className="stack-grid" aria-label="기술 스택 목록">
        {stacks.map((stack) => (
          <article className={`stack-card ${stack.available ? 'is-available' : 'is-unavailable'}`} key={stack.name}>
            <div>
              <p className="stack-status">{stack.available ? '학습 가능' : '준비 중'}</p>
              <h2>{stack.name}</h2>
              <p>{stack.description}</p>
            </div>
            {stack.available ? (
              <button className="primary-button" type="button" onClick={onSelectTypeScript}>TypeScript 시작하기</button>
            ) : <span className="stack-coming-soon">곧 열립니다</span>}
          </article>
        ))}
      </section>
    </main>
  );
}
