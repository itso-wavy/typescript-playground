import type { Lesson } from '../shared/contracts.js';

const checkedAt = '2026-09-08';
const source = { title: 'TypeScript Handbook: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };

export const lessons: Lesson[] = [
  {
    id: 'd1', chapter: 0, order: 1, kind: 'diagnostic', title: '값은 같은데 추론된 타입은 왜 달라질까?',
    summary: 'const와 let이 리터럴 정보를 보존하거나 넓히는 방식을 짧게 점검합니다.',
    story: '릴리스 채널을 설정 객체에 넘겼는데 let으로 만든 값 때문에 허용되지 않는 문자열이 섞였습니다. React 컴포넌트의 mode prop에서도 같은 일이 일어나므로, 값과 타입이 별개로 넓어지는 순간을 확인합니다.',
    concept: ['const로 초기화한 원시 값은 보통 리터럴 타입으로 유지되지만, 재할당 가능한 let 변수는 더 넓은 타입으로 추론됩니다.', '필요한 곳에서만 as const나 명시적 유니온을 사용합니다. 모든 값을 억지로 좁히면 이후 변경 가능한 상태를 거짓으로 표현하게 됩니다.'],
    mission: '채널 값이 releaseChannel 계약을 만족하도록 선언을 고치세요.', goals: ['리터럴 넓어짐을 설명한다', '변경 가능 상태에 맞는 선언을 고른다'],
    hints: ['재할당 가능성이 정말 필요한지 먼저 확인하세요.', '함수 매개변수는 두 채널만 허용합니다.', '값을 바꾸지 말고 선언의 타입 정보를 바꾸세요.'],
    explanation: ['정답은 채널 값의 타입을 "stable"로 유지합니다.', '이 진단은 선택 사항이며 완료 수에 포함되지 않습니다.'],
    starter: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nlet channel = "stable";\nreleaseChannel(channel);\n' },
    solution: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nconst channel = "stable";\nreleaseChannel(channel);\n' }, editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
  },
  {
    id: 'd2', chapter: 0, order: 2, kind: 'diagnostic', title: '유니온의 필드를 바로 읽을 수 있을까?',
    summary: '분기 전에는 공통 필드만 읽을 수 있다는 점을 점검합니다.',
    story: '결제 화면은 카드와 계좌 이체 결과를 함께 받습니다. 카드 번호 끝자리처럼 한 경우에만 있는 정보를 렌더링하려면 먼저 어떤 결과인지 좁혀야 합니다.',
    concept: ['유니온 타입에서는 모든 구성원이 가진 공통 속성만 바로 접근할 수 있습니다.', '판별자(kind)를 확인하면 제어 흐름 분석이 해당 분기에서 정확한 구성원으로 타입을 좁힙니다.'],
    mission: 'kind 분기로 카드 결제의 last4만 반환하세요.', goals: ['판별 유니온을 좁힌다', '분기 밖의 안전하지 않은 접근을 피한다'],
    hints: ['두 객체가 공유하는 필드와 다른 필드를 나눠 보세요.', 'kind는 문자열 리터럴입니다.', '카드가 아니면 undefined를 돌려도 됩니다.'],
    explanation: ['kind 검사는 런타임 분기이면서 타입 좁히기의 근거입니다.', '선택 진단의 실패는 다음 장을 막지 않습니다.'],
    starter: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment) { return payment.last4; }\n' },
    solution: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment): string | undefined { return payment.kind === "card" ? payment.last4 : undefined; }\n' }, editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
  },
  {
    id: 'd3', chapter: 0, order: 3, kind: 'diagnostic', title: 'as를 붙이면 외부 데이터도 안전해질까?',
    summary: 'unknown에서 시작해 확인 없이 단언하지 않는 습관을 점검합니다.',
    story: '브라우저 저장소에서 읽은 JSON은 사용자 설정처럼 보여도 실제 모양을 보장하지 않습니다. any 또는 as는 런타임 값을 검사하지 않으므로, 최소한의 경계를 코드로 세워야 합니다.',
    concept: ['unknown은 사용하기 전에 확인을 요구하므로 외부 입력의 출발점으로 적합합니다.', '타입 단언은 컴파일러에게만 말할 뿐 JavaScript 값을 바꾸거나 검증하지 않습니다.'],
    mission: 'unknown 값을 검사한 뒤 theme을 읽는 타입 가드를 완성하세요.', goals: ['unknown을 안전하게 좁힌다', '단언과 런타임 검증의 차이를 안다'],
    hints: ['null도 typeof가 object입니다.', '속성 존재 여부를 확인하세요.', 'theme 값 자체도 문자열인지 확인해야 합니다.'],
    explanation: ['가드는 작은 계약만 보장합니다. 서버 응답 전체 검증은 이후 경계 장에서 다룹니다.', 'any는 오류를 숨기므로 진단의 정답이 아닙니다.'],
    starter: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { return value.theme; }\n' },
    solution: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { if (typeof value === "object" && value !== null && "theme" in value && typeof value.theme === "string") return value.theme; return undefined; }\n' }, editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 4,
  },
  {
    id: 'd4', chapter: 0, order: 4, kind: 'diagnostic', title: '속성이 더 있는 객체는 언제 허용될까?',
    summary: '구조적 호환성과 객체 리터럴의 초과 속성 검사를 구분합니다.',
    story: '공통 AuditLog 함수는 id와 action만 필요하지만 호출부의 새 객체 리터럴에 오타가 들어갔습니다. 기존 객체에 더 많은 데이터가 있는 것과 새 리터럴에 의도치 않은 키가 있는 것은 다르게 다뤄집니다.',
    concept: ['구조적 타입 시스템에서는 필요한 최소 속성을 가진 값이 더 넓은 객체여도 대입될 수 있습니다.', '객체 리터럴은 흔한 오타를 찾기 위해 초과 속성 검사를 추가로 받습니다. 이는 런타임의 완전한 객체 검증이 아닙니다.'],
    mission: '새 이벤트 리터럴의 action 오타를 타입 오류로 드러내세요.', goals: ['필요한 최소 구조를 이해한다', '초과 속성 검사를 오타 방지에 쓴다'],
    hints: ['함수는 필요한 두 키만 선언합니다.', '객체 리터럴의 키 이름을 다시 읽으세요.', '더 많은 속성은 삭제할 필요가 없습니다.'],
    explanation: ['구조적 호환성은 재사용에 유용하지만 완전한 도메인 검증을 뜻하지 않습니다.', '고급 비건전성 사례는 경계 장의 심화 참고에서 다룹니다.'],
    starter: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", actoin: "save" });\n' },
    solution: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", action: "save" });\n' }, editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
    interview: { question: '초과 속성 검사는 런타임 입력 검증을 대신할까요?', answer: '아니요. 새 객체 리터럴의 흔한 오타를 잡는 정적 검사일 뿐입니다.', points: ['구조적 호환성', '외부 입력 검증', '단언의 한계'] },
  },
];
