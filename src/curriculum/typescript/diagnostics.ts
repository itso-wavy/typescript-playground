import type { Lesson } from '../../shared/contracts.js';

const checkedAt = '2026-09-08';
const source = { title: 'TypeScript Handbook: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };

export const lessons: Lesson[] = [
  {
    id: 'd1', chapter: 0, order: 1, kind: 'diagnostic', title: 'const와 let의 타입 추론 차이', navTitle: 'const vs let',
    summary: 'const와 let으로 선언한 값이 TypeScript에서 서로 다르게 추론되는 이유를 배웁니다.',
    story: '배포 환경을 고르는 코드를 변수로 빼는 순간, 화면상으로는 같은 "stable"인데 함수 호출이 깨집니다. 함수는 "stable" 또는 "beta"만 받도록 좁혀져 있지만, 나중에 값이 바뀔 수 있는 변수는 더 넓은 문자열로 취급되기 때문입니다. 그 차이를 확인한 뒤 변수 선언을 고쳐 봅니다.',
    concept: ['TypeScript는 변수에 타입을 직접 쓰지 않아도 처음 넣은 값을 보고 타입을 추론합니다. const channel = "stable"은 다시 바꿀 수 없으므로 현재 값이 "stable"이라고 기억합니다. 반면 let channel = "stable"은 나중에 "beta"나 다른 문자열로 바뀔 수 있으므로 string으로 봅니다. 그래서 "stable" 또는 "beta"만 받는 함수에는 const 변수가 맞습니다.', '값을 바꿀 수 있어야 한다면 let을 쓰되, 허용할 값의 범위를 "stable" | "beta"처럼 직접 적을 수도 있습니다.'],
    mission: 'channel을 함수에 넘겨도 오류가 나지 않도록 선언을 고치세요. 이 함수는 "stable"과 "beta"만 받습니다.', goals: ['const와 let이 문자열 타입 추론에 미치는 차이를 설명한다', '변경 가능 여부에 맞는 변수 선언을 선택한다'],
    hints: ['channel에 나중에 다른 값을 대입하나요?', '함수는 "stable"과 "beta"만 받습니다.', '함수 코드는 바꾸지 말고 변수 선언만 바꿔 보세요.'],
    explanation: ['channel을 const로 선언하면 TypeScript는 이 값이 "stable"로 고정됐다고 볼 수 있어 함수에 전달할 수 있습니다.', '이 진단은 선택 사항이며 전체 진도에는 포함되지 않습니다.'],
    starter: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nlet channel = "stable";\nreleaseChannel(channel);\n' },
    solution: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nconst channel = "stable";\nreleaseChannel(channel);\n' }, editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
  },
  {
    id: 'd2', chapter: 0, order: 2, kind: 'diagnostic', title: '판별자로 유니온 타입 좁히기', navTitle: '유니온 좁히기',
    summary: '판별자 속성으로 유니온 타입을 좁혀 각 경우에 맞는 필드만 사용합니다.',
    story: '결제 화면은 카드 결제와 계좌 이체 결과를 receipt 함수 하나로 처리합니다. 카드 결과에만 있는 last4 속성을 무조건 읽으면 계좌 이체 영수증에서 오류가 납니다. 먼저 결제 종류를 확인하고 카드일 때만 카드 번호 끝 네 자리를 반환하도록 고쳐 봅니다.',
    concept: ['유니온 타입은 여러 모양 중 하나를 나타냅니다. 유니온 값에서 바로 읽을 수 있는 속성은 모든 모양에 공통인 것뿐입니다.', 'kind 속성처럼 객체의 모양을 알려 주는 값을 판별자라고 합니다. payment.kind를 확인하면 TypeScript가 해당 분기에서 payment 매개변수를 카드 결제로 좁혀 last4 속성을 읽게 해 줍니다.'],
    workedExample: { title: '완성 예시: 판별자 속성으로 결제 결과 좁히기', code: 'type Payment =\n  | { kind: "card"; last4: string }\n  | { kind: "bank"; bank: string };\n\nfunction receipt(payment: Payment): string | undefined {\n  if (payment.kind === "card") return payment.last4;\n  return undefined;\n}', result: ['payment.kind가 "card"인 분기에서는 payment가 카드 결제 객체로 좁혀져 last4 속성을 읽을 수 있습니다.', '계좌 이체 분기에는 last4 속성이 없으므로 undefined를 반환합니다.', 'kind 판별자 확인은 실행 중 분기와 타입 좁히기를 함께 수행합니다.'] },
    mission: 'payment 매개변수의 kind 속성을 확인한 뒤 카드 결제일 때만 last4 속성값을 반환하세요. 계좌 이체라면 undefined를 반환하면 됩니다.', goals: ['판별자 속성으로 유니온을 좁힌다', '현재 모양에 없는 속성에 접근하지 않는다'],
    hints: ['card와 bank 객체에서 공통인 속성과 한쪽에만 있는 속성을 나눠 보세요.', '먼저 payment.kind를 확인하세요.', '카드가 아니면 undefined를 반환하면 됩니다.'],
    explanation: ['kind 확인은 실제 실행 중 분기이면서 TypeScript가 타입을 좁히는 근거이기도 합니다.', '이 진단은 선택 사항이라 실패해도 다음 장으로 갈 수 있습니다.'],
    starter: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment) { return payment.last4; }\n' },
    solution: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment): string | undefined { return payment.kind === "card" ? payment.last4 : undefined; }\n' }, editableFiles: ['index.ts'], mode: 'runtime', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
  },
  {
    id: 'd3', chapter: 0, order: 3, kind: 'diagnostic', title: 'unknown 값의 타입 가드 작성하기', navTitle: 'unknown 검증',
    summary: 'unknown 값을 사용하기 전에 객체와 속성의 실제 타입을 확인하는 방법을 배웁니다.',
    story: 'localStorage에서 읽은 JSON을 사용자 설정이라고 믿고 readTheme 함수의 value 매개변수에서 theme 속성을 꺼내려 합니다. 저장된 값은 삭제됐거나 다른 코드가 바꿨을 수 있습니다. 먼저 객체인지와 theme 속성의 실제 타입을 확인한 뒤 값을 반환하도록 고쳐 봅니다.',
    concept: ['unknown 타입은 아직 어떤 타입인지 모르는 값입니다. 사용하기 전에 확인해야 하므로 API 응답이나 저장소 값의 시작 타입으로 적합합니다.', 'typeof 연산자와 in 연산자로 실제 값을 확인하면 TypeScript가 해당 분기에서 타입을 좁힙니다. as 타입 단언은 “이 타입이라고 가정해”라고 말할 뿐 실행 중인 값이 맞는지 검사하지 않습니다.'],
    workedExample: { title: '완성 예시: unknown 값에서 문자열 속성 확인하기', code: 'function readTheme(value: unknown): string | undefined {\n  if (typeof value === "object" && value !== null &&\n      "theme" in value && typeof value.theme === "string") {\n    return value.theme;\n  }\n  return undefined;\n}', result: ['typeof value === "object"만으로는 null도 통과하므로 value !== null을 함께 확인합니다.', 'theme 속성이 있고 그 값이 string 타입일 때만 반환하므로 다른 입력은 undefined가 됩니다.', '타입 단언만 사용하면 잘못된 저장값을 실행 중에 걸러내지 못합니다.'] },
    mission: 'value 매개변수가 객체이고 theme 속성이 string 타입인지 확인한 뒤 theme을 반환하도록 타입 가드를 완성하세요.', goals: ['unknown 값을 확인하면서 안전하게 좁힌다', '타입 단언과 실제 값 검사의 차이를 설명한다'],
    hints: ['null에 typeof를 적용하면 object가 된다는 점을 처리하세요.', 'theme 속성이 있는지 먼저 확인하세요.', 'theme의 값도 문자열인지 확인해야 합니다.'],
    explanation: ['이번 가드는 theme이라는 한 가지 조건만 확인합니다. 실제 서버 응답 전체를 검증하는 방법은 뒤의 경계 장에서 다룹니다.', 'any로 바꾸면 오류는 사라져도 잘못된 값이 들어오는 문제는 해결되지 않습니다.'],
    starter: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { return value.theme; }\n' },
    solution: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { if (typeof value === "object" && value !== null && "theme" in value && typeof value.theme === "string") return value.theme; return undefined; }\n' }, editableFiles: ['index.ts'], mode: 'runtime', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 4,
  },
  {
    id: 'd4', chapter: 0, order: 4, kind: 'diagnostic', title: '구조적 타이핑과 초과 속성 검사', navTitle: '초과 속성',
    summary: '필요한 필드만 요구하는 구조적 타이핑과 객체 리터럴의 키 검사를 구분합니다.',
    story: 'log 함수는 id 속성과 action 속성만 필요하지만, 기존 이벤트에는 createdAt 속성도 함께 붙어 들어옵니다. 이 추가 정보는 보존하면서 전달할 수 있습니다. 반대로 새 객체 리터럴에서 action 속성을 actoin으로 잘못 쓰면 기록이 깨집니다. 두 상황을 구분해 키 오타만 고쳐 봅니다.',
    concept: ['구조적 타이핑은 객체가 필요한 속성을 갖고 있는지 확인합니다. 필요한 속성이 모두 있으면 다른 속성이 더 있어도 Audit 타입을 받는 log 함수에 전달할 수 있습니다.', '함수 호출 자리에 객체 리터럴을 직접 작성하면 초과 속성 검사가 추가로 실행됩니다. 이 정적 검사는 키 오타를 찾지만, 실행 중 들어오는 데이터 전체를 검증하지는 않습니다.'],
    workedExample: { title: '완성 예시: 구조적 타이핑과 초과 속성 검사 구분하기', code: 'type Audit = { id: string; action: string };\n\nfunction log(event: Audit): string {\n  return event.action;\n}\n\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000 };\nlog(savedEvent);\nlog({ id: "e2", action: "cancel" });', result: ['savedEvent 변수는 id와 action 속성을 갖고 있어 createdAt 속성이 더 있어도 log 함수에 전달할 수 있습니다.', '새 객체 리터럴도 action 속성을 정확히 쓰면 Audit 타입과 호환됩니다.', 'actoin처럼 선언되지 않은 키를 직접 쓰면 초과 속성 검사에서 오류가 납니다.'] },
    mission: '새 이벤트 객체의 키 오타가 타입 오류로 드러나도록 action의 이름을 바로잡으세요.', goals: ['필요한 최소 객체 구조를 이해한다', '객체 리터럴의 키 오타 검사를 활용한다'],
    hints: ['log 함수가 실제로 사용하는 키는 두 개입니다.', '호출부의 키 이름을 한 글자씩 확인하세요.', '필요하지 않은 다른 필드를 지울 필요는 없습니다.'],
    explanation: ['객체에 필드가 더 있는 것을 허용하는 규칙은 재사용에 편리합니다. 다만 외부에서 들어온 객체가 안전하다는 뜻은 아니므로 별도 검증이 필요합니다.', '초과 속성 검사는 런타임 검증을 대신하지 않습니다.'],
    starter: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", actoin: "save" });\n' },
    solution: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", action: "save" });\n' }, editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
    interview: { question: '초과 속성 검사가 API에서 받은 객체를 안전하다고 보장할까요?', answer: '아닙니다. 코드를 작성할 때 객체 리터럴의 키 오타를 잡는 정적 검사일 뿐입니다. API 응답처럼 실행 중 들어오는 값은 별도의 런타임 검증이 필요합니다.', points: ['구조적 타입 호환성', '초과 속성 검사의 범위', '외부 입력 검증'] },
  },
];
