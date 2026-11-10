import type { CheckResult, RuntimeResult } from '../shared/contracts.js';

interface ResultPanelProps {
  checking: boolean;
  result: CheckResult | null;
  runtime: RuntimeResult | null;
  needsRecheck: boolean;
}

export function ResultPanel({ checking, result, runtime, needsRecheck }: ResultPanelProps) {
  if (checking) {
    return <section className="result-panel" aria-live="polite"><strong>코드를 확인하고 있습니다.</strong></section>;
  }

  if (needsRecheck && !result) {
    return <section className="result-panel result-muted" aria-live="polite">코드가 바뀌었습니다. 다시 실행해 확인하세요.</section>;
  }

  if (!result) {
    return <section className="result-panel result-muted" aria-live="polite">실행·확인을 누르면 타입 계약과 과제를 확인합니다.</section>;
  }

  if (result.status !== 'ready') {
    return (
      <section className="result-panel result-error" aria-live="polite">
        <strong>아직 타입 계약을 만족하지 않습니다.</strong>
        <p>{result.message ?? '오류 위치를 읽고 선언과 실제 값의 관계를 다시 확인하세요.'}</p>
        <ul className="diagnostics">
          {result.diagnostics.map((diagnostic) => (
            <li key={`${diagnostic.file}:${diagnostic.line}:${diagnostic.column}:${diagnostic.code}`}>
              <code>{diagnostic.file}:{diagnostic.line}:{diagnostic.column} TS{diagnostic.code}</code> {diagnostic.message}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (runtime && runtime.status !== 'passed') {
    return (
      <section className="result-panel result-error" aria-live="polite">
        <strong>타입은 통과했지만 실행 결과를 다시 확인하세요.</strong>
        <p>{runtime.error ?? (runtime.logs.join('\n') || '런타임 검증을 통과하지 못했습니다.')}</p>
        <CheckList checks={runtime.checks} />
      </section>
    );
  }

  return (
    <section className="result-panel result-success" aria-live="polite">
      <strong>{runtime ? '타입과 실행 계약을 통과했습니다.' : '타입 계약을 통과했습니다.'}</strong>
      <CheckList checks={runtime?.checks ?? result.checks} />
      {runtime?.logs.length ? <pre className="runtime-log">{runtime.logs.join('\n')}</pre> : null}
    </section>
  );
}

function CheckList({ checks }: { checks: { name: string; passed: boolean }[] }) {
  if (!checks.length) return null;
  return <ul className="checks">{checks.map((check) => <li key={check.name}>{check.passed ? '✓' : '×'} {check.name}</li>)}</ul>;
}
