import type { Lesson } from '../../shared/contracts.js';

const checkedAt = '2026-09-08';
const source = { title: 'TypeScript Handbook: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };

export const lessons: Lesson[] = [
  {
    id: 'd1', chapter: 0, order: 1, kind: 'diagnostic', title: 'const와 let의 타입 추론 차이 이해하기', navTitle: 'const vs let',
    summary: 'const와 let으로 선언한 변수가 타입스크립트 타입 추론 엔진에서 서로 다르게 다뤄지는 이유를 알아봅니다.',
    story: '배포 환경을 지정하는 로직을 변수로 추출하는 순간, 동일한 "stable" 값을 전달함에도 함수 호출부에서 타입 에러가 발생했습니다. 해당 함수는 "stable" 또는 "beta" 리터럴만 허용하도록 좁혀진 반면, 재할당 가능성이 있는 변수는 일반 string 타입으로 폭넓게 추론되었기 때문입니다. 선언 방식을 교정하여 문제를 해결해 봅니다.',
    concept: [
      '타입스크립트는 별도의 타입 선언이 없더라도 초기 할당값을 기반으로 정적 타입을 추론합니다. `const channel = "stable"` 선언은 불변 값이므로 "stable" 리터럴 타입으로 엄격하게 추론합니다. 반면 `let channel = "stable"`은 나중에 다른 문자열로 재할당될 수 있어 string 타입으로 넓게 추론됩니다. 따라서 리터럴 유니온을 받는 함수 매개변수에는 const 변수가 적합합니다.',
      '변수 재할당이 필요한 경우에는 let 선언을 사용하되, `let channel: "stable" | "beta"`처럼 허용할 리터럴 타입을 명시적으로 지정해야 합니다.',
    ],
    mission: 'channel 변수를 함수에 전달할 때 타입 에러가 발생하지 않도록 변수 선언 구문을 고치세요. 해당 함수는 오직 "stable"과 "beta" 문자열 리터럴만 허용합니다.',
    goals: ['const와 let 선언이 문자열 타입 추론 결과에 미치는 차이를 이해한다.', '변수의 재할당 가능 여부에 부합하는 올바른 변수 선언 키워드를 선택한다.'],
    hints: ['channel 변수가 코드 내에서 재할당되어야 하는 값인지 확인해 보세요.', 'target 함수는 "stable"과 "beta" 타입만 매개변수로 받아들입니다.', '함수의 내부 코드는 그대로 두고, 변수 선언 방식만 변경해 보세요.'],
    explanation: ['channel을 const로 선언하면 타입스크립트가 이 값을 고정된 리터럴 타입 "stable"로 추론하여 함수 호출을 안전하게 허용합니다.', '본 진단 레슨은 선택 사항이며 필수 커리큘럼 진도에는 포함되지 않습니다.'],
    starter: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nlet channel = "stable";\nreleaseChannel(channel);\n' },
    solution: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nconst channel = "stable";\nreleaseChannel(channel);\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
  },
  {
    id: 'd2', chapter: 0, order: 2, kind: 'diagnostic', title: '판별자(Discriminator) 속성으로 유니온 타입 좁히기', navTitle: '유니온 좁히기',
    summary: '판별자 속성을 활용해 유니온 타입을 분기별로 안전하게 좁혀, 해당 객체 타입에 존재하는 속성에만 접근하는 방법을 학습합니다.',
    story: '결제 화면에서 카드 결제와 계좌 이체 결과를 단일 receipt 함수로 처리하고 있습니다. 이때 카드 결제 객체에만 존재하는 last4 속성에 직접 접근하면 계좌 이체 영수증 처리 과정에서 런타임 오류가 발생합니다. 결제 수단 종류를 조건문으로 먼저 분기한 뒤 카드 결제일 때만 카드 번호 뒷자리를 참조하도록 수정해 봅니다.',
    concept: [
      '유니온 타입은 여러 객체 형태 중 하나가 들어올 수 있음을 나타냅니다. 유니온 객체에서 조건 분기 없이 직접 읽을 수 있는 속성은 모든 타입에 공통으로 포함된 속성뿐입니다.',
      'kind 속성처럼 객체의 구체적 형태를 알려 주는 식별자를 판별자(Discriminator)라고 합니다. `payment.kind === "card"` 조건을 검사하면 타입스크립트가 해당 제어 흐름 내에서 payment 매개변수를 카드 결제 타입으로 자동 좁혀 last4 속성 접근을 허용합니다.',
    ],
    workedExample: {
      title: '완성 예시: 판별자 속성으로 결제 결과 좁히기',
      code: 'type Payment =\n  | { kind: "card"; last4: string }\n  | { kind: "bank"; bank: string };\n\nfunction receipt(payment: Payment): string | undefined {\n  if (payment.kind === "card") return payment.last4;\n  return undefined;\n}',
      result: ['payment.kind가 "card"인 조건 분기 내에서는 payment 객체가 카드 결제 타입으로 안전하게 좁혀집니다.', '계좌 이체 타입에는 last4 속성이 존재하지 않으므로 조건문 외부에서는 undefined를 반환합니다.', 'kind 판별자 검사는 런타임 제어 흐름 분기와 정적 타입 좁히기를 동시에 완성합니다.'],
    },
    mission: 'payment 매개변수의 kind 판별자 속성을 검사하여, 카드 결제 타입일 때만 last4 속성을 반환하고 계좌 이체 타입일 경우 undefined를 반환하도록 작성하세요.',
    goals: ['판별자 속성을 기반으로 Discriminated Union 타입을 제어 흐름에 따라 좁힌다.', '특정 분기의 객체에 존재하지 않는 속성에 무분별하게 접근하는 오류를 방지한다.'],
    hints: ['card 타입과 bank 타입에서 공통으로 존재하는 필드와 개별 필드를 구분해 보세요.', '먼저 payment.kind의 런타임 값을 조건문으로 검사하세요.', '카드 결제 형태가 아닌 경우에는 undefined를 반환하도록 처리하세요.'],
    explanation: ['kind 판별자 분기는 런타임 렌더링 조건을 결정짓는 핵심 로직이자 타입 체커가 정적 타입을 좁히는 유용한 근거가 됩니다.', '본 진단 레슨은 선택 사항이므로 통과하지 않아도 다음 단계 진행이 가능합니다.'],
    starter: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment) { return payment.last4; }\n' },
    solution: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment): string | undefined { return payment.kind === "card" ? payment.last4 : undefined; }\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
  },
  {
    id: 'd3', chapter: 0, order: 3, kind: 'diagnostic', title: 'unknown 입력값에 대한 타입 가드 작성하기', navTitle: 'unknown 검증',
    summary: 'unknown 검증 경계에서 값에 접근하기 전, 객체 유효성과 internal 속성의 실제 런타임 타입을 안전하게 검증하는 가드 방식을 배웁니다.',
    story: 'localStorage에서 파싱한 JSON 데이터를 검증 없이 다루다가, readTheme 함수의 value 매개변수에서 theme 속성을 바로 참조하여 에러가 발생했습니다. 저장소 데이터는 유실되었거나 외부 스크립트에 의해 변질되었을 가능성이 있습니다. 객체 유효성과 theme 속성의 타입을 런타임에서 안전하게 검증하도록 타입 가드를 완성해 봅니다.',
    concept: [
      'unknown 타입은 어떠한 값도 받아들일 수 있으나 타입 검사 없이는 바로 사용할 수 없는 안전한 타입입니다. 외부 API 응답이나 데이터베이스, 저장소 입력을 다루는 첫 입출력 경계에 가장 적합합니다.',
      '`typeof` 연산자와 `in` 연산자를 조합해 실제 런타임 값을 검증하면 해당 블록 내에서 타입이 자동으로 좁혀집니다. `as` 단언문은 타입 체커에게 강제로 타입을 주입할 뿐 실제 런타임 밸리데이션을 수행하지는 못합니다.',
    ],
    workedExample: {
      title: '완성 예시: unknown 입력 객체에서 문자열 속성 안전하게 검증하기',
      code: 'function readTheme(value: unknown): string | undefined {\n  if (typeof value === "object" && value !== null &&\n      "theme" in value && typeof value.theme === "string") {\n    return value.theme;\n  }\n  return undefined;\n}',
      result: ['자바스크립트의 `typeof null === "object"` 특성을 고려해 `value !== null` 예외 조건을 반드시 함께 검사합니다.', 'theme 속성의 존재 여부와 실제 string 여부를 검증한 경우에만 값을 반환하여 런타임 예외를 차단합니다.', '타입 단언(Assertion)만 사용하면 부적절한 형태의 저장소 입력값을 런타임에서 걸러내지 못합니다.'],
    },
    mission: 'value 매개변수가 null이 아닌 Valid 객체인지, 내부에 theme 속성이 string 타입으로 존재하는지 검증하여 안전하게 반환하도록 타입 가드를 완성하세요.',
    goals: ['unknown 타입의 런타임 입력을 타입 가드로 안전하게 좁혀 사용한다.', '타입 단언(`as`)과 실제 런타임 타입 가드의 차이점 및 한계를 이해한다.'],
    hints: ['`typeof null` 연산의 결과가 `"object"`로 평가되는 자바스크립트 예외를 처리하세요.', '`"theme" in value` 구문으로 속성 존재 유무를 먼저 검사하세요.', '해당 속성이 문자열 리터럴/타입을 만족하는지 추가로 확인해야 합니다.'],
    explanation: ['본 가드 예시는 theme이라는 단일 키 유효성만 확인합니다. 서버 뷰/응답 모델 전체를 다루는 스키마 기반 검증 체계는 후속 장에서 다루게 됩니다.', 'any 타입 단언으로 에러를 우회할 경우 컴파일 에러는 사라질 수 있지만, 런타임 렌더링 예외 사고 위험은 그대로 남게 됩니다.'],
    starter: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { return value.theme; }\n' },
    solution: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { if (typeof value === "object" && value !== null && "theme" in value && typeof value.theme === "string") return value.theme; return undefined; }\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 4,
  },
  {
    id: 'd4', chapter: 0, order: 4, kind: 'diagnostic', title: '구조적 타이핑과 초과 속성 검사(Excess Property Checks) 구분하기', navTitle: '초과 속성',
    summary: '타입스크립트의 핵심인 구조적 타이핑 규칙과, 객체 리터럴 직접 전달 시 작동하는 초과 속성 검사의 동작 구성을 비교 분석합니다.',
    story: 'log 함수는 id와 action 필드만 요구하며, 기존 이벤트 데이터에는 createdAt 필드가 추가 포함되어 있습니다. 구조적 타이핑 규칙에 따라 이 추가 필드는 보존된 채 함수로 전달될 수 있습니다. 반면 새로 생성한 객체 리터럴에서 action 필드를 actoin으로 잘못 오타 입력했을 때는 타입 에러가 감지됩니다. 두 검사 매커니즘을 구분하고 오타 필드를 올바르게 수정해 봅니다.',
    concept: [
      '구조적 타이핑(Structural Typing)은 객체가 요구하는 명세를 최소한으로 갖추고 있다면 다른 부가적인 속성이 더 존재하더라도 타입 호환을 허용하는 타입 시스템 메커니즘입니다.',
      '함수 인수로 객체 리터럴을 직접 전달하는 경우에는 타입 체커가 초과 속성 검사(Excess Property Check)를 발동시킵니다. 이 검사는 코드 작성 시점의 키 오타를 효과적으로 포착하지만 런타임 입력을 검증해주지는 않습니다.',
    ],
    workedExample: {
      title: '완성 예시: 구조적 타이핑과 초과 속성 검사의 차이 구분하기',
      code: 'type Audit = { id: string; action: string };\n\nfunction log(event: Audit): string {\n  return event.action;\n}\n\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000 };\nlog(savedEvent);\nlog({ id: "e2", action: "cancel" });',
      result: ['savedEvent 변수는 Audit 타입이 필요로 하는 id와 action 필드를 만족하므로 부가적인 createdAt 필드가 포함되어 있어도 log 함수에 정상 전달됩니다.', '새로 전달하는 객체 리터럴 역시 action 필드명을 올바르게 지정하면 Audit 타입 명세와 호환됩니다.', 'actoin과 같이 스펙에 정의되지 않은 오타 키를 객체 리터럴에 사용하면 초과 속성 검사 단계에서 에러가 발생합니다.'],
    },
    mission: '객체 리터럴 인자에서 발생한 actoin 키의 오타를 바로잡아 Audit 타입 명세에 맞추어 수정하세요.',
    goals: ['구조적 타이핑 관점에서 요구되는 최소 객체 명세 개념을 이해한다.', '객체 리터럴을 직접 넘길 때 발동하는 초과 속성 검사를 오타 방지에 활용한다.'],
    hints: ['log 함수가 명시적으로 요구하는 객체 속성은 총 두 가지입니다.', '호출부 객체 리터럴 속성명의 철자를 자세히 확인해 보세요.', '유효한 부가 속성을 전달하는 경우 해당 속성을 강제로 삭제할 필요는 없습니다.'],
    explanation: ['요구 명세 이상의 필드를 유연하게 허용하는 구조적 타이핑은 재사용성과 모듈 확장에 유용합니다. 단, 이것이 외부 런타임 데이터의 완전성을 보장한다는 의미는 아닙니다.', '초과 속성 검사는 어디까지나 정적 컴파일러의 객체 리터럴 오타 방지 장치일 뿐 런타임 데이터 검증을 대체할 수는 없습니다.'],
    starter: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", actoin: "save" });\n' },
    solution: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", action: "save" });\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [source], checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: 3,
    interview: { question: '초과 속성 검사(Excess Property Checks)가 외부 API 응답 데이터의 안전성을 보장해 주나요?', answer: '아닙니다. 초과 속성 검사는 객체 리터럴을 직접 정의하여 전달할 때 필드명 오타를 잡는 정적 검사 옵션일 뿐입니다. 외부 API 응답처럼 런타임에 유입되는 실제 값 검증은 스키마 라이브러리 등을 활용한 별도의 런타임 밸리데이션이 필요합니다.', points: ['구조적 타입 시스템의 정의와 호환 범위', '초과 속성 검사의 작동 조건(객체 리터럴 direct 전달)', '외부 입력 데이터 검증을 위한 런타임 가드의 별도 구성'] },
  },
];