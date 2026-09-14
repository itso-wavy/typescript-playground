import type { Lesson } from '../../shared/contracts.js';

const checkedAt = '2026-09-11';
const classes = { title: 'TypeScript Handbook: Classes', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html' };
const decorators = { title: 'TypeScript 5.0: Decorators', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators' };
const enums = { title: 'TypeScript Handbook: Enums', url: 'https://www.typescriptlang.org/docs/handbook/enums.html' };
const strict = { title: 'TSConfig: strict', url: 'https://www.typescriptlang.org/tsconfig/strict.html' };
const modules = { title: 'TypeScript Handbook: Modules', url: 'https://www.typescriptlang.org/docs/handbook/2/modules.html' };
const declarations = { title: 'TypeScript Declaration Files', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html' };
const mapped = { title: 'TypeScript Handbook: Mapped Types', url: 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html' };
const conditional = { title: 'TypeScript Handbook: Conditional Types', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html' };
const templateTypes = { title: 'TypeScript Handbook: Template Literal Types', url: 'https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html' };
const narrowing = { title: 'TypeScript Handbook: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };
const minutesByOrder: Record<number, 6 | 7 | 8> = { 18: 7, 19: 7, 20: 8, 21: 7, 22: 8, 23: 7, 24: 8, 25: 7, 26: 7, 27: 6, 28: 7, 29: 7, 30: 7 };
const make = (data: Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision' | 'minutes'>): Lesson => ({ ...data, kind: 'practice', checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: minutesByOrder[data.order] });

export const lessons: Lesson[] = [
  make({
    id: 'ts18.class-value-type', chapter: 4, order: 18,
    title: '클래스를 런타임 값과 인스턴스 타입으로 사용하기', navTitle: '클래스 값과 타입',
    summary: 'MemoryOrderStore 클래스가 생성자 값과 인스턴스 타입이라는 두 역할을 갖는지 확인하고 OrderStore 인터페이스를 실제 동작으로 구현합니다.',
    story: '주문 저장소를 테스트용 메모리 구현으로 교체하려는데 클래스 이름을 생성자 자리와 타입 자리에서 혼동해 주입 코드가 복잡해졌습니다. 인터페이스 계약, 클래스 구현, new 연산자로 만드는 실행 값을 한 예제에서 구분해 봅니다.',
    concept: ['class 선언은 new 연산자로 호출할 생성자 값과, 만들어진 인스턴스의 타입을 함께 만듭니다. typeof MemoryOrderStore 타입은 생성자 쪽을 가리키고, MemoryOrderStore 타입은 인스턴스 쪽을 가리킵니다.', 'implements 절은 클래스 선언이 인터페이스 계약과 맞는지 검사합니다. 메서드를 대신 만들거나 런타임 입력을 검증하지 않으므로 저장과 조회 동작은 클래스가 직접 구현해야 합니다.'],
    workedExample: {
      title: '완성 예시: 클래스의 값과 타입 구분하기',
      code: 'class MemoryStore {}\n\nconst StoreConstructor: typeof MemoryStore = MemoryStore;\nconst store: MemoryStore = new StoreConstructor();',
      result: ['typeof MemoryStore 타입은 new 연산자로 호출할 수 있는 생성자 값을 나타냅니다.', 'MemoryStore 타입은 생성자로 만든 인스턴스를 나타내므로 store 변수에 새 인스턴스를 저장할 수 있습니다.'],
    },
    mission: 'OrderStore 인터페이스를 구현하는 MemoryOrderStore 클래스를 완성하세요. 생성자로 인스턴스를 만들 수 있고, 저장한 주문을 id 속성으로 다시 조회할 수 있어야 합니다.',
    goals: ['클래스의 생성자 값과 인스턴스 타입을 구분한다.', 'implements 계약을 만족하는 실제 저장·조회 동작을 작성한다.'],
    hints: ['Map<string, Order> 타입의 저장소를 클래스의 private 필드로 둘 수 있습니다.', 'save 메서드에서는 order.id 속성을 키로 주문을 저장하세요.', 'find 메서드의 반환 타입에는 주문이 없을 때의 undefined 타입을 포함하세요.'],
    explanation: ['typeof Class 타입과 Class 타입이 서로 다른 자리에 쓰인다는 점은 NestJS 같은 DI 프레임워크의 토큰과 인스턴스 계약을 이해하는 선수 지식입니다.', 'implements 절은 컴파일 계약입니다. 외부 JSON이 Order 타입인지 확인해 주지 않으므로 런타임 경계는 별도로 유지해야 합니다.'],
    starter: { 'index.ts': `export type Order = { id: string; total: number };
export interface OrderStore { save(order: Order): void; find(id: string): Order | undefined }
export class MemoryOrderStore implements OrderStore {
  save(_order: Order): void {}
  find(_id: string): Order | undefined { return undefined; }
}
` },
    solution: { 'index.ts': `export type Order = { id: string; total: number };
export interface OrderStore { save(order: Order): void; find(id: string): Order | undefined }
export class MemoryOrderStore implements OrderStore {
  private readonly orders = new Map<string, Order>();
  save(order: Order): void { this.orders.set(order.id, order); }
  find(id: string): Order | undefined { return this.orders.get(id); }
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [classes],
  }),
  make({
    id: 'ts19.abstract-contract', chapter: 4, order: 19,
    title: '선택 심화: 공통 구현이 있을 때 추상 클래스 선택하기', navTitle: '선택: 추상 클래스',
    summary: '저장소의 공통 조회 구현이 실제로 존재할 때만 추상 클래스를 사용하고, 구현 없는 계약에는 인터페이스가 더 작은 선택인 이유를 설명합니다.',
    story: '여러 주문 저장소가 같은 메모리 조회 로직을 복사하고 있어 공통 구현을 둘 후보가 생겼습니다. 단지 모양만 맞추려 추상 계층을 추가하지 않고, 재사용할 상태와 코드가 있는 상황에서 선택 비용을 비교해 봅니다.',
    concept: ['abstract class 선언은 직접 new 연산자로 호출할 수 없습니다. 하위 클래스가 채워야 할 abstract 멤버와 공통 구현을 함께 가질 수 있습니다. 공통 상태나 동작이 없다면 interface 선언이 결합을 줄이는 데 알맞습니다.', '이 레슨은 선택 심화입니다. 실제 공통 구현을 유지해야 할 때만 추상 클래스 기반 계약을 고려합니다.'],
    workedExample: {
      title: '완성 예시: 공통 조회는 상속하고 저장만 구현하기',
      code: 'abstract class Repository {\n  abstract save(id: string): void;\n  find(id: string): string { return id; }\n}\n\nclass MemoryRepository extends Repository {\n  save(id: string): void { void id; }\n}',
      result: ['Repository 추상 클래스는 직접 만들 수 없고, MemoryRepository 하위 클래스가 save 추상 메서드를 구현해야 합니다.', 'find 메서드는 기반 클래스에 구현되어 있으므로 하위 클래스가 그대로 재사용합니다.'],
    },
    mission: 'OrderRepository의 공통 find 구현은 재사용하고 MemoryOrderRepository가 save만 구현하게 만든 뒤, 인터페이스 대안과의 선택 근거를 확인하세요.',
    goals: ['추상 멤버와 상속된 공통 구현의 책임을 구분한다.', '공통 구현이 없을 때 인터페이스를 선택할 이유를 설명한다.'],
    hints: ['기반 클래스의 orders 필드는 하위 클래스가 접근할 수 있도록 protected 접근 제한자를 사용하세요.', 'find 메서드는 기반 클래스에서 공통으로 구현할 수 있습니다.', 'save 메서드는 abstract 키워드로 선언하고 하위 클래스에서 구현하세요.'],
    explanation: ['공통 Map 상태와 find 메서드 구현이 있으므로 이번 예시에서는 추상 클래스가 중복을 줄입니다.', '여러 구현 계약이나 서로 다른 저장 방식만 필요하다면 interface 선언과 조합이 더 유연합니다. 추상 클래스는 하나만 상속할 수 있습니다.'],
    starter: { 'index.ts': `export type Order = { id: string; total: number };
export abstract class OrderRepository {
  protected readonly orders = new Map<string, Order>();
  abstract save(order: Order): void;
  abstract find(id: string): Order | undefined;
}
export class MemoryOrderRepository extends OrderRepository {
  save(_order: Order): void {}
  find(_id: string): Order | undefined { return undefined; }
}
` },
    solution: { 'index.ts': `export type Order = { id: string; total: number };
export abstract class OrderRepository {
  protected readonly orders = new Map<string, Order>();
  abstract save(order: Order): void;
  find(id: string): Order | undefined { return this.orders.get(id); }
}
export class MemoryOrderRepository extends OrderRepository {
  save(order: Order): void { this.orders.set(order.id, order); }
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [classes],
    interview: { question: '이 저장소 계약에서 공통 상태와 구현이 사라진다면 추상 클래스와 인터페이스 중 무엇을 선택하겠나요?', answer: '구현 없이 모양만 공유한다면 인터페이스를 선택해 단일 상속 제약과 불필요한 기반 계층을 피합니다.', points: ['공통 구현의 존재', '단일 상속 비용', '인터페이스 대안'] },
  }),
  make({
    id: 'ts20.decorator-boundary', chapter: 4, order: 20,
    title: '메서드 데코레이터의 실행 시점과 타입 한계 확인하기', navTitle: 'decorator 경계',
    summary: '메서드 호출을 기록하는 표준 데코레이터를 구현해 데코레이터가 실행 코드라는 사실과 외부 입력 타입을 검증하지 않는 한계를 구분합니다.',
    story: '결제 서비스에 데코레이터를 붙였더니 팀이 요청 값까지 자동 검증된다고 오해했습니다. 데코레이터가 클래스 정의와 메서드 호출 과정에 어떻게 참여하는지 실행 결과로 확인하고, DTO 검증 책임을 다음 과정에 정확히 넘겨봅니다.',
    concept: ['표준 메서드 데코레이터 함수는 원래 메서드와 context 매개변수를 받고 대체 메서드를 반환할 수 있습니다. 데코레이터 함수 자체는 클래스가 정의될 때 적용되고, 반환한 래퍼 함수의 코드는 인스턴스 메서드를 호출할 때 실행됩니다.', '데코레이터의 타입 시그니처는 잘못된 사용을 컴파일할 때 제한할 수 있지만 네트워크에서 들어온 값의 실제 모양을 확인하지 않습니다. NestJS Controller와 검증 파이프라인의 의미는 다음 과정에서 따로 다룹니다.'],
    workedExample: {
      title: '완성 예시: 메서드를 감싸 호출 기록 남기기',
      code: 'function log(target: () => string, context: ClassMethodDecoratorContext) {\n  return function (): string {\n    console.log(String(context.name));\n    return target.call(this);\n  };\n}',
      result: ['log 데코레이터 함수는 클래스 정의 시 원래 메서드를 받아 래퍼 함수를 반환합니다.', '래퍼 함수 안의 console.log 호출은 인스턴스 메서드를 호출할 때 실행됩니다.'],
    },
    mission: 'logCall이 charge 호출 시점마다 메서드 이름을 calls에 기록하고 원래 this·인수·반환값을 보존하도록 구현하세요.',
    goals: ['데코레이터 적용 시점과 반환된 래퍼의 호출 시점을 구분한다.', '데코레이터 타입과 런타임 입력 검증이 서로 다른 책임임을 설명한다.'],
    hints: ['데코레이터 함수는 원래 메서드인 target 매개변수와 메서드 정보인 context 매개변수를 받습니다.', '반환 함수 안에서 calls 배열에 String(context.name)을 추가하세요.', 'target.call(this, ...args) 호출로 원래 메서드의 this 값과 인수를 보존하세요.'],
    explanation: ['호출 기록은 데코레이터가 반환한 함수가 실행할 때 생기며, 클래스를 선언했다는 이유만으로 charge 입력이 검증되지는 않습니다.', '요청 경계에서는 unknown 값 검증이나 프레임워크 검증 파이프라인이 별도로 필요하고 데코레이터만으로 안전을 주장할 수 없습니다.'],
    starter: { 'index.ts': `export const calls: string[] = [];
export function logCall<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) { return target; }
export class PaymentService {
  @logCall charge(total: number): string { return 'charged:' + total; }
}
` },
    solution: { 'index.ts': `export const calls: string[] = [];
export function logCall<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  return function (this: This, ...args: Args): Return {
    calls.push(String(context.name));
    return target.call(this, ...args);
  };
}
export class PaymentService {
  @logCall charge(total: number): string { return 'charged:' + total; }
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [decorators],
    interview: { question: '@logCall을 붙였다는 사실만으로 HTTP 요청의 total이 number라고 믿을 수 없는 이유는 무엇인가요?', answer: '타입 표기는 컴파일할 코드의 사용을 검사할 뿐 실제 HTTP 값은 검증하지 않으며, 이 데코레이터도 호출 기록만 수행하기 때문입니다.', points: ['데코레이터의 실행 동작', '정적 타입의 범위', '별도 런타임 검증'] },
  }),
  make({
    id: 'ts21.enum-or-const-object', chapter: 4, order: 21,
    title: '선택 심화: enum과 as const 상태 객체 비교하기', navTitle: '선택: enum 비교',
    summary: 'enum과 as const 객체가 만드는 런타임 값을 확인하고 새 앱의 주문 상태 계약에는 문자열 유니온을 선택할 기준을 정리합니다.',
    story: '서버 JSON은 문자열 상태를 보내는데 화면 모델이 숫자 enum을 사용해 로그와 응답 값이 달라졌습니다. 기존 라이브러리의 enum을 읽되 새 공개 계약에서는 런타임 표현과 직렬화 형식이 드러나는 선택을 해 봅니다.',
    concept: ['enum 선언은 타입인 동시에 JavaScript 출력에 런타임 객체를 만듭니다. as const 단언을 붙인 객체도 런타임 값으로 남습니다. 객체 값에서 유니온 타입을 계산하면 JSON 문자열과 같은 표현을 유지할 수 있습니다.', '이 레슨은 선택 심화입니다. 기존 API가 enum을 제공하면 읽고 사용할 수 있어야 합니다. 새 앱 모델에서는 문자열 유니온이나 as const 단언을 붙인 객체가 더 단순한 경우가 많습니다.'],
    workedExample: {
      title: '완성 예시: 상태 객체에서 문자열 union 타입 만들기',
      code: 'const STATUS = { pending: "pending", paid: "paid" } as const;\ntype Status = typeof STATUS[keyof typeof STATUS];\n\nconst current: Status = "pending";',
      result: ['as const 단언이 객체 속성의 값을 "pending"과 "paid" 리터럴 타입으로 유지합니다.', 'typeof와 keyof 연산자로 계산한 Status 타입은 "pending" | "paid"이므로 다른 문자열은 허용하지 않습니다.'],
    },
    mission: 'ORDER_STATUS 객체에서 OrderStatus 유니온을 계산하고 statusLabel이 허용된 상태만 받아 화면 문자열을 반환하도록 완성하세요.',
    goals: ['enum과 as const 객체가 모두 런타임 값을 만든다는 점을 확인한다.', 'JSON 계약과 번들 결과를 근거로 상태 표현을 선택한다.'],
    hints: ['객체 값의 리터럴 타입을 보존하려면 as const를 사용하세요.', 'typeof ORDER_STATUS와 keyof를 조합해 값 유니온을 얻을 수 있습니다.', 'statusLabel은 두 상태를 모두 처리해야 합니다.'],
    explanation: ['서버가 "pending"과 "paid"를 보내는 계약에서는 같은 문자열 값을 가진 const 객체가 직렬화 결과를 바로 보여 줍니다.', 'enum 선언이 항상 잘못된 것은 아닙니다. 기존 공개 API, 런타임 역매핑의 필요성, 팀 규칙을 함께 비교해야 합니다.'],
    starter: { 'index.ts': `export enum LegacyStatus { Pending, Paid }
export const ORDER_STATUS = { pending: 'pending', paid: 'paid' };
export type OrderStatus = string;
export function statusLabel(_status: OrderStatus): string { return '주문'; }
` },
    solution: { 'index.ts': `export enum LegacyStatus { Pending, Paid }
export const ORDER_STATUS = { pending: 'pending', paid: 'paid' } as const;
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export function statusLabel(status: OrderStatus): string { return status === ORDER_STATUS.paid ? '결제 완료' : '결제 대기'; }
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [enums],
    interview: { question: '문자열 JSON 상태를 새로 설계한다면 enum과 as const 중 어떤 기준으로 선택하겠나요?', answer: '직렬화 값과 런타임 객체가 그대로 드러나는지, 기존 공개 계약과의 호환이 필요한지, 추가 생성 코드가 필요한지를 비교합니다.', points: ['런타임 출력', 'JSON 표현', '기존 계약 호환성'] },
  }),
  make({
    id: 'ts22.strict-baseline', chapter: 4, order: 22,
    title: 'strict 설정이 드러낸 오류를 경계별로 고치기', navTitle: 'strict 기준선',
    summary: 'strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes 옵션이 각각 드러내는 배열·unknown 오류와 선택적 속성 문제를 안전한 코드로 수정합니다.',
    story: '기존 관리자 화면에 strict 기준을 적용하자 빈 배열 접근, catch 오류 사용, nickname: undefined 요청이 한꺼번에 드러났습니다. 옵션을 끄지 않고 각 값이 실제로 없거나 알 수 있는 경계에서 처리해 이관 기준선을 만듭니다.',
    concept: ['strict 옵션은 여러 엄격한 검사를 묶는 기준선입니다. noUncheckedIndexedAccess 옵션은 인덱스 접근 결과에 undefined 타입을 더합니다. exactOptionalPropertyTypes 옵션은 선택적 속성의 생략과 명시적인 undefined 값을 구분합니다.', '다음 완성 예시에서는 배열에 첫 항목이 없을 때 "없음"을 사용합니다. 이처럼 값이 없을 수 있는 지점에서 대체 값을 정하면 이후 코드는 string 타입만 다루게 됩니다.'],
    workedExample: {
      title: '완성 예시: 배열 인덱스의 undefined 처리하기',
      code: 'function firstLabel(items: readonly string[]): string {\n  return items[0]?.trim() ?? "없음";\n}',
      result: ['noUncheckedIndexedAccess 옵션을 사용하면 items[0] 표현식은 string | undefined 타입입니다.', '옵셔널 체이닝과 ?? 연산자가 빈 배열일 때 "없음"을 반환하므로 함수는 항상 string 값을 반환합니다.'],
    },
    mission: '유사한 설정 이관 코드에서 firstLabel, errorMessage, makeProfile을 고쳐 엄격한 기준을 통과하고 의도된 tsconfig 예시와 일치시키세요.',
    goals: ['배열 인덱스와 catch 절의 unknown 타입이 가진 실패 가능성을 코드에 반영한다.', '선택적 속성의 생략과 명시적인 undefined 값을 정확히 구분한다.'],
    hints: ['items[0] 표현식에 값이 없을 때 사용할 기본 문자열을 정하세요.', 'catch 절의 값은 Error 인스턴스인지 확인한 뒤 message 속성을 읽으세요.', 'nickname 매개변수가 undefined 값이면 빈 객체를 반환해 키를 생략하세요.'],
    explanation: ['엄격 옵션을 한 번에 켤 수 없는 큰 프로젝트라면 오류 수와 경계를 측정해 단계적으로 이관할 수 있지만, 새 코드의 기준선은 문서화해야 합니다.', '현재 실습 검사는 strict와 noUncheckedIndexedAccess를 기본 적용하고 exactOptionalPropertyTypes를 fixture 옵션으로 적용합니다. tsconfig 예시는 의도된 전체 기준을 보여 줍니다.'],
    starter: { 'tsconfig.example.json': `{"compilerOptions":{"strict":true,"noUncheckedIndexedAccess":true,"exactOptionalPropertyTypes":true}}`, 'index.ts': `export type Profile = { nickname?: string };
export function firstLabel(items: readonly string[]): string { return items[0].trim(); }
export function errorMessage(error: unknown): string { return error.message; }
export function makeProfile(nickname: string | undefined): Profile { return { nickname }; }
` },
    solution: { 'tsconfig.example.json': `{"compilerOptions":{"strict":true,"noUncheckedIndexedAccess":true,"exactOptionalPropertyTypes":true}}`, 'index.ts': `export type Profile = { nickname?: string };
export function firstLabel(items: readonly string[]): string { return items[0]?.trim() ?? '없음'; }
export function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
export function makeProfile(nickname: string | undefined): Profile { return nickname === undefined ? {} : { nickname }; }
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [strict, { title: 'TSConfig: noUncheckedIndexedAccess', url: 'https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html' }, { title: 'TSConfig: exactOptionalPropertyTypes', url: 'https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html' }],
  }),
  make({
    id: 'ts23.function-variance', chapter: 4, order: 23,
    title: '선택 심화: 콜백 매개변수의 안전한 범위 이해하기', navTitle: '선택: 함수 변성',
    summary: 'strictFunctionTypes 옵션에서 라이브러리가 모든 Row를 넘길 수 있도록 renderRow 콜백의 매개변수 범위를 고치고 더 좁은 콜백이 위험한 이유를 설명합니다.',
    story: '테이블 라이브러리는 일반 행과 VIP 행을 모두 호출하지만 화면 콜백은 vip 필드가 반드시 있다고 선언했습니다. 일반 행이 들어오는 실행 경로를 기준으로 콜백 계약을 넓혀 런타임 속성 오류를 막아 봅니다.',
    concept: ['콜백을 호출하는 쪽이 Row 타입의 모든 값을 전달할 수 있다면 콜백 매개변수는 Row 타입보다 좁아서는 안 됩니다. strictFunctionTypes 옵션은 함수 매개변수의 이런 대입 가능성을 더 안전하게 검사합니다.', '이 레슨은 공개 API나 라이브러리 콜백을 설계할 때 필요한 선택 심화입니다. 콜백 계약은 구현자가 원하는 값보다 호출자가 실제로 전달할 수 있는 값을 기준으로 정합니다.'],
    workedExample: {
      title: '완성 예시: 호출자가 넘기는 모든 행 받기',
      code: 'type Row = { id: string; name: string };\ntype RowRenderer = (row: Row) => string;\n\nconst renderRow: RowRenderer = (row) => row.name;',
      result: ['renderRow 콜백은 RowRenderer 타입이 허용하는 모든 Row 값을 처리합니다.', 'vip 속성을 필수로 요구하지 않으므로 일반 행이 들어와도 없는 속성을 읽지 않습니다.'],
    },
    mission: 'renderRow가 모든 Row를 받을 수 있게 고치고 vip를 필수로 요구하는 콜백이 RowRenderer 자리에 올 수 없는 이유를 확인하세요.',
    goals: ['콜백 호출자가 전달할 수 있는 전체 입력 범위를 받는다.', '더 좁은 콜백 매개변수가 만드는 실패 사례를 설명한다.'],
    hints: ['RowRenderer가 이미 매개변수 타입을 제공하므로 중복 표기를 줄이세요.', '일반 Row에는 vip 필드가 없습니다.', '추가 속성이 필요하면 콜백 안에서 존재 여부를 좁히세요.'],
    explanation: ['렌더러는 VIP 행만 처리하는 함수가 아니라 테이블이 전달할 모든 Row 타입의 값을 처리해야 합니다.', '함수 변성 규칙을 암기하기보다 누가 함수를 호출하며 어떤 값을 넘길 수 있는지부터 확인하면 안전한 방향을 판단할 수 있습니다.'],
    starter: { 'table.d.ts': `export type Row = { id: string; name: string };
export type RowRenderer = (row: Row) => string;`, 'index.ts': `import type { RowRenderer } from './table.js';
export const renderRow: RowRenderer = (row: { id: string; name: string; vip: boolean }) => row.name;
` },
    solution: { 'table.d.ts': `export type Row = { id: string; name: string };
export type RowRenderer = (row: Row) => string;`, 'index.ts': `import type { RowRenderer } from './table.js';
export const renderRow: RowRenderer = (row) => row.name;
` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [{ title: 'TypeScript Handbook: Function Type Expressions', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html' }],
  }),
  make({
    id: 'ts24.script-module-boundary', chapter: 4, order: 24,
    title: '스크립트 전역과 모듈 실행 경계를 분리하기', navTitle: 'script와 module',
    summary: '전역 이름이 충돌하는 스크립트를 명시적인 모듈로 바꾸고 import type으로 실행 값과 컴파일 전용 타입의 의존성을 분리합니다.',
    story: '서로 다른 레거시 파일의 mode 상수가 전역에서 충돌하고, 타입만 쓰는 Order import가 브라우저 실행 의존성으로 남았습니다. 각 파일의 범위와 타입·값 import를 분명히 해 빌드 오류와 불필요한 모듈 로드를 함께 고쳐 봅니다.',
    concept: ['import 또는 export 선언이 없는 파일은 스크립트로 취급되어 선언이 전역 범위를 공유할 수 있습니다. export {} 문을 넣으면 파일 자체가 모듈이 되어 다른 파일과 같은 이름을 독립적으로 사용할 수 있습니다.', '타입 전용 import는 JavaScript 출력에서 사라지고, 실행 값의 import는 출력에 남습니다. verbatimModuleSyntax 옵션은 두 의도를 코드에 명시하도록 돕습니다.'],
    workedExample: {
      title: '완성 예시: 파일을 모듈로 표시하고 타입만 가져오기',
      code: '// legacy.ts\nconst mode = "legacy";\nexport {};\n\n// index.ts\nimport type { Order } from "./model.js";',
      result: ['export {} 문이 legacy.ts 파일을 모듈로 바꾸므로 mode 상수는 전역 이름과 충돌하지 않습니다.', 'Order 타입의 import는 컴파일 뒤 사라지므로 실행 시 model.js 모듈을 불러오지 않습니다.'],
    },
    mission: '유사한 세 파일에서 두 전역 스크립트를 모듈로 만들고 index.ts의 Order 타입 import와 label 값 import를 분리하세요.',
    goals: ['스크립트 전역 선언 충돌을 파일 모듈 경계로 해결한다.', '타입 전용 import와 런타임 값 import를 정확히 구분한다.'],
    hints: ['전역에 둘 필요가 없는 파일 끝에 export {}를 추가하세요.', 'Order 앞에는 type을 붙인 import를 사용하세요.', 'label은 실행할 함수이므로 일반 값 import로 유지하세요.'],
    explanation: ['모듈 표시는 이름 충돌을 숨기는 장식이 아니라 파일의 실행·이름 범위를 결정합니다.', '유사 퀴즈에서도 타입 import는 제거되어도 되는 의존성인지, 값 import는 실제 실행에 필요한지 각각 판단해야 합니다.'],
    starter: { 'legacy-a.ts': `const mode = 'legacy-a';
void mode;`, 'legacy-b.ts': `const mode = 'legacy-b';
void mode;`, 'model.ts': `export type Order = { id: string };
export const label = (order: Order): string => order.id;`, 'index.ts': `import { Order, label } from './model.js';
export const format = (order: Order): string => label(order);` },
    solution: { 'legacy-a.ts': `const mode = 'legacy-a';
void mode;
export {};`, 'legacy-b.ts': `const mode = 'legacy-b';
void mode;
export {};`, 'model.ts': `export type Order = { id: string };
export const label = (order: Order): string => order.id;`, 'index.ts': `import type { Order } from './model.js';
import { label } from './model.js';
export const format = (order: Order): string => label(order);` },
    editableFiles: ['legacy-a.ts', 'legacy-b.ts', 'index.ts'], mode: 'typecheck', sources: [modules, { title: 'TSConfig: verbatimModuleSyntax', url: 'https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html' }],
  }),
  make({
    id: 'ts25.declaration-file', chapter: 4, order: 25,
    title: '사용하는 표면만 최소 선언 파일로 정의하기', navTitle: '최소 .d.ts',
    summary: '타입 없는 analytics 패키지에서 실제 사용하는 이벤트와 payload 객체만 .d.ts 파일로 선언해 오타와 누락을 잡고, 선언이 런타임을 보장하지 않는다는 점을 확인합니다.',
    story: '레거시 analytics 패키지를 any로 사용하자 checkout 이벤트 오타와 orderId 누락이 빌드에서 보이지 않았습니다. 문서로 확인한 최소 사용 표면만 선언해 잘못된 호출을 컴파일 단계에서 드러내 봅니다.',
    concept: ['declare module 선언은 외부 JavaScript 모듈의 타입 표면을 설명합니다. 실제로 확인한 함수와 인수만 선언해야 사용하지 않는 API를 추측하는 일을 피할 수 있습니다.', '다음 예시는 track 함수가 허용하는 이벤트와 payload 객체를 최소한으로 선언합니다. 올바른 호출은 통과하고 이벤트 오타나 orderId 속성이 없는 호출은 거절됩니다. 선언은 실제 패키지 구현을 만들거나 검증하지 않으므로 문서 확인과 통합 테스트가 별도로 필요합니다.'],
    workedExample: {
      title: '완성 예시: 외부 모듈의 최소 호출 계약 선언하기',
      code: 'declare module "analytics" {\n  export function track(\n    event: "checkout_started" | "checkout_completed",\n    payload: { orderId: string },\n  ): void;\n}',
      result: ['track 함수는 "checkout_started"와 "checkout_completed"만 이벤트 값으로 받습니다.', 'payload 객체에 string 타입의 orderId 속성이 없으면 타입 오류가 납니다.'],
    },
    mission: '유사한 analytics 호출을 위해 any 타입을 제거하세요. "checkout_started"와 "checkout_completed" 이벤트를 받는 최소 track 함수 계약을 analytics.d.ts 파일에 작성하세요.',
    goals: ['실제로 사용하는 패키지 API 표면만 선언한다.', '선언 파일의 정적 보장과 JavaScript 구현의 런타임 동작을 구분한다.'],
    hints: ['declare module "analytics" 블록 안에 track 함수를 선언하세요.', 'event 매개변수는 허용된 두 문자열 리터럴 타입의 유니온입니다.', 'payload 매개변수에는 필수 string 타입의 orderId 속성이 있고 반환 타입은 void입니다.'],
    explanation: ['최소 선언은 잘못된 호출을 잡으면서 확인하지 않은 패키지 전체를 타입으로 꾸며 내는 위험을 줄입니다.', '유사 퀴즈의 선언과 실제 패키지 버전이 달라지면 타입이 거짓말할 수 있으므로 공식 문서와 통합 실행을 다시 확인해야 합니다.'],
    starter: { 'analytics.d.ts': `declare module 'analytics' { export const track: any; }`, 'index.ts': `import { track } from 'analytics';
export { track };
track('checkout_started', { orderId: 'ord_1' });` },
    solution: { 'analytics.d.ts': `declare module 'analytics' {
  export function track(event: 'checkout_started' | 'checkout_completed', payload: { orderId: string }): void;
}`, 'index.ts': `import { track } from 'analytics';
export { track };
track('checkout_started', { orderId: 'ord_1' });` },
    editableFiles: ['analytics.d.ts'], mode: 'typecheck', sources: [declarations],
  }),
  make({
    id: 'ts26.package-contract', chapter: 4, order: 26,
    title: '패키지의 export =와 ESM 선언 계약 읽기', navTitle: 'package 타입 계약',
    summary: '레거시 export = 선언과 ESM named export 선언의 소비 모양을 비교하고 앱이 실제로 사용하는 format API를 좁은 래퍼로 제공합니다.',
    story: '패키지 문서의 CommonJS 예제를 ESM import로 그대로 옮기자 타입과 실행 모양이 어긋났습니다. 배포 형식을 추측하지 않고 제공된 선언의 export 방식을 읽어 소비자 코드를 작은 래퍼에 가둬 봅니다.',
    concept: ['export = 선언은 모듈 자체가 하나의 값으로 내보내지는 CommonJS 계열 모양을 표현합니다. ESM 선언의 export function 구문은 이름 있는 내보내기를 표현합니다. 소비 코드는 패키지가 제공한 선언과 프로젝트 모듈 설정을 함께 따라야 합니다.', '패키지 선언을 앱 전체에 퍼뜨리기보다 좁은 래퍼 함수에서 필요한 format 함수만 노출하면 패키지 형식이나 버전이 바뀔 때 수정할 지점이 줄어듭니다. 실제 JavaScript 형식은 패키지의 exports 필드와 실행 테스트로도 확인해야 합니다.'],
    workedExample: {
      title: '완성 예시: export = 모듈을 래퍼에서 가져오기',
      code: 'import formatter from "./legacy-formatter.js";\n\nexport function formatOrder(id: string): string {\n  return formatter(id, { uppercase: true });\n}',
      result: ['프로젝트 설정이 default import 호환을 허용하므로 export = 선언이 가리키는 함수 값을 formatter로 가져옵니다.', 'formatOrder 래퍼 함수는 패키지의 넓은 표면 대신 string 입력과 string 출력만 앱에 노출합니다.'],
    },
    mission: '제공된 export = 선언을 읽고 formatter를 올바르게 가져와 주문 id를 대문자 형식으로 만드는 formatOrder 래퍼를 완성하세요.',
    goals: ['export =와 ESM 선언의 내보내기 모양 차이를 읽는다.', '패키지 소비 범위를 앱의 작은 래퍼 계약으로 좁힌다.'],
    hints: ['legacy-formatter.d.ts의 export =가 가리키는 함수 모양을 확인하세요.', '프로젝트 설정에서 허용되는 default import로 모듈 값을 가져오세요.', 'formatOrder는 패키지 전체가 아니라 string을 받아 string을 반환해야 합니다.'],
    explanation: ['이 래퍼는 앱 코드가 레거시 패키지 선언 모양에 직접 의존하는 범위를 줄입니다.', '선언 파일이 ESM처럼 보여도 실제 package.json exports가 다를 수 있으므로 패키지 제작·배포 단계에서는 Node 과정과 통합 테스트로 재확인합니다.'],
    starter: { 'legacy-formatter.d.ts': `declare function formatter(value: string, options?: { uppercase?: boolean }): string;
export = formatter;`, 'modern-formatter.d.ts': `export function format(value: string, options?: { uppercase?: boolean }): string;`, 'index.ts': `export function formatOrder(id: string): string { return id; }` },
    solution: { 'legacy-formatter.d.ts': `declare function formatter(value: string, options?: { uppercase?: boolean }): string;
export = formatter;`, 'modern-formatter.d.ts': `export function format(value: string, options?: { uppercase?: boolean }): string;`, 'index.ts': `import formatter from './legacy-formatter.js';
export function formatOrder(id: string): string { return formatter(id, { uppercase: true }); }` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [declarations, modules],
    interview: { question: '패키지의 .d.ts만 보고 실제 ESM/CommonJS 실행 호환성을 확정할 수 없는 이유는 무엇인가요?', answer: '선언은 타입 표면만 설명하며 실제 로딩 방식은 JavaScript 파일과 package.json exports, 실행 환경의 모듈 해석에 의해 결정되기 때문입니다.', points: ['타입 선언의 범위', '런타임 exports 확인', '래퍼로 영향 범위 제한'] },
  }),
  make({
    id: 'ts27.mapped-errors', chapter: 5, order: 27,
    title: '매핑 타입으로 모델을 따라가는 필드 오류 만들기', navTitle: 'mapped errors',
    summary: '폼 모델의 각 키를 선택적인 string[] 오류로 바꾸는 FieldErrors<T>를 작성해 필드 추가와 이름 변경이 오류 계약에도 자동 반영되게 합니다.',
    story: '주문 폼에 note를 추가했지만 손으로 복사한 오류 타입에는 필드가 없어 화면이 메시지를 표시하지 못했습니다. 원본 모델의 키를 순회해 별도 목록을 동기화하는 수고를 없애 봅니다.',
    concept: ['매핑 타입은 keyof T 타입으로 얻은 키를 순회해 새로운 객체 타입을 만듭니다. [K in keyof T] 구문의 K를 결과 속성 이름과 원본 값 조회에 사용할 수 있습니다.', '오류가 없는 필드는 응답 객체에 없을 수 있으므로 ? 수정자로 선택적 속성을 만듭니다. 이번 타입은 한 단계 필드만 다루며 중첩 재귀 검증은 범위에 포함하지 않습니다.'],
    workedExample: {
      title: '완성 예시: 모델 키마다 선택적 오류 만들기',
      code: 'type FieldErrors<T> = {\n  [K in keyof T]?: string[];\n};\n\ntype Errors = FieldErrors<{ title: string; quantity: number }>;',
      result: ['매핑 타입이 "title"과 "quantity" 키를 순회해 같은 이름의 오류 속성을 만듭니다.', '? 수정자 때문에 오류가 없는 필드는 결과 객체에서 생략할 수 있습니다.'],
    },
    mission: 'FieldErrors<T>가 T의 모든 필드에 선택적인 string[] 오류를 연결하고 모델에 없는 키는 허용하지 않도록 고치세요.',
    goals: ['keyof T를 순회하는 매핑 타입을 작성한다.', '오류가 없는 필드를 optional 속성으로 표현한다.'],
    hints: ['[K in keyof T] 형태로 원본 키를 순회하세요.', '각 속성 값은 여러 메시지를 담는 string[]입니다.', '속성 이름 뒤에 ?를 붙여 오류 없는 필드를 생략하세요.'],
    explanation: ['OrderForm의 필드가 바뀌면 FieldErrors<OrderForm>도 같은 키 변경을 따라갑니다.', '런타임 검증 로직과 오류 메시지를 실제로 생성하는 일은 이 타입이 대신하지 않으며 별도의 함수가 필요합니다.'],
    starter: { 'index.ts': `export type FieldErrors<T> = Record<string, string[]>;
` },
    solution: { 'index.ts': `export type FieldErrors<T> = { [K in keyof T]?: string[] };
` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [mapped],
  }),
  make({
    id: 'ts28.infer-and-distribution', chapter: 5, order: 28,
    title: '선택 심화: infer 추출과 조건부 타입 분산 제어하기', navTitle: '선택: infer와 분산',
    summary: '이벤트 유니온에서 payload 속성의 타입을 구성원별로 추출하는 경우와 유니온 전체가 조건을 만족하는지 검사하는 경우를 구분해 작성합니다.',
    story: '이벤트 라이브러리 타입을 읽는 중 일부 이벤트만 payload 속성이 있는데 전체 이벤트에 이 속성이 있다고 잘못 판단했습니다. 조건부 타입의 분산 여부를 의도에 맞게 제어해 공개 타입의 거짓 보장을 막아 봅니다.',
    concept: ['조건부 타입의 왼쪽에 타입 매개변수 T가 직접 있으면 유니온 구성원마다 조건을 따로 계산합니다. 이를 분산 조건부 타입이라고 합니다. infer 키워드는 일치한 구조 안의 타입을 새 이름으로 잡아 PayloadOf 같은 추출 타입을 만들 수 있습니다.', '유니온 전체를 한 번에 검사하려면 [T] extends [U]처럼 조건의 양쪽을 튜플로 감쌉니다. 그러면 분산을 막고 모든 구성원이 조건을 만족하는지 확인할 수 있습니다.'],
    workedExample: {
      title: '완성 예시: payload 속성 추출과 전체 조건 검사 구분하기',
      code: 'type PayloadOf<T> = T extends { payload: infer P } ? P : never;\ntype IsAllPayload<T> = [T] extends [{ payload: unknown }] ? true : false;\n\ntype Event = { payload: string } | { type: "close" };',
      result: ['PayloadOf<Event> 타입은 각 구성원에 분산되어 string 타입만 추출합니다.', 'Event의 모든 구성원에 payload 속성이 있지는 않으므로 IsAllPayload<Event> 타입은 false입니다.'],
    },
    mission: 'PayloadOf<T> 타입은 각 이벤트의 payload 속성 타입을 추출하고, IsAllPayload<T> 타입은 모든 구성원이 payload 속성을 가질 때만 true가 되도록 완성하세요.',
    goals: ['infer로 구조 안의 타입을 추출한다.', '분산 조건부 타입과 유니온 전체 검사의 결과를 예상한다.'],
    hints: ['PayloadOf<T> 타입에서는 T 타입 매개변수를 조건식 왼쪽에 직접 두세요.', 'payload 속성의 타입은 infer P 구문으로 잡을 수 있습니다.', '전체 유니온을 한 번에 비교하려면 양쪽 타입을 튜플로 감싸세요.'],
    explanation: ['분산은 각 이벤트의 payload 속성 타입을 유니온으로 얻을 때 유용하고, 전체 보장을 물을 때는 막아야 합니다.', '이 타입 계산은 실행 중 이벤트 값의 모양을 검사하지 않으므로 외부 이벤트에는 런타임 검증이 여전히 필요합니다.'],
    starter: { 'index.ts': `export type PayloadOf<T> = T extends { payload: infer P } ? P[] : never;
export type IsAllPayload<T> = T extends { payload: unknown } ? true : false;
` },
    solution: { 'index.ts': `export type PayloadOf<T> = T extends { payload: infer P } ? P : never;
export type IsAllPayload<T> = [T] extends [{ payload: unknown }] ? true : false;
` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [conditional],
  }),
  make({
    id: 'ts29.template-key-remap', chapter: 5, order: 29,
    title: '선택 심화: 템플릿 키 재매핑의 범위 정하기', navTitle: '선택: key remap',
    summary: '모델 키로 "Changed" 이벤트와 "metric_" 공개 필드를 제한적으로 계산하고, 가능한 문자열 조합이 커질 때의 타입 검사 비용과 API 복잡성을 설명합니다.',
    story: '대시보드 이벤트와 메트릭 키를 손으로 관리해 오타가 반복됐지만 모든 모델 키 조합을 자동 생성하자 공개 API가 지나치게 커졌습니다. 필요한 문자열 키만 계산하도록 범위를 좁혀 자동화의 비용을 통제해 봅니다.',
    concept: ['템플릿 리터럴 타입은 문자열 리터럴 타입을 조합합니다. 매핑 타입의 as 절은 각 키의 이름을 다시 계산합니다. Extract<keyof T, string> 타입으로 숫자와 심볼 키를 제외할 수 있습니다.', '이 레슨은 선택 심화입니다. 작은 닫힌 키 집합에는 유용하지만 유니온을 여러 번 교차 조합하면 가능한 문자열 수와 오류 메시지, 타입 검사 비용이 빠르게 늘어날 수 있습니다.'],
    workedExample: {
      title: '완성 예시: 모델 키를 변경 이벤트 이름으로 바꾸기',
      code: 'type ChangeEvent<T> = `${Extract<keyof T, string>}Changed`;\n\ntype OrderEvent = ChangeEvent<{ title: string; quantity: number }>;',
      result: ['Extract 타입이 모델에서 문자열 키만 골라냅니다.', '템플릿 리터럴 타입이 각 키에 "Changed"를 붙이므로 OrderEvent 타입은 "titleChanged" | "quantityChanged"입니다.'],
    },
    mission: 'ChangeEvent<T>와 PublicMetrics<T>를 완성해 문자열 키만 계산하고 원래 값 타입을 보존하세요.',
    goals: ['템플릿 리터럴과 키 재매핑을 제한된 공개 키에 적용한다.', '조합 폭발과 읽기 어려운 공개 API라는 비용을 설명한다.'],
    hints: ['keyof T 타입에서 문자열 키만 Extract 타입으로 고르세요.', '이벤트 이름은 원래 키 뒤에 "Changed"를 붙입니다.', '공개 메트릭 키는 as 절에서 "metric_" 접두사를 붙이고 값은 T[K] 타입으로 유지하세요.'],
    explanation: ['모델 키가 바뀌면 두 공개 타입도 자동으로 따라가 오타와 복사 누락을 줄입니다.', '키 집합이 크거나 외부 사용자가 읽어야 하는 API라면 명시적 유니온이나 코드 생성이 더 나은 대안일 수 있습니다.'],
    starter: { 'index.ts': `export type ChangeEvent<T> = string;
export type PublicMetrics<T> = { [K in keyof T]: T[K] };
` },
    solution: { 'index.ts': `export type ChangeEvent<T> = \`${'${Extract<keyof T, string>}'}Changed\`;
export type PublicMetrics<T> = { [K in keyof T as \`metric_${'${Extract<K, string>}'}\`]: T[K] };
` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [templateTypes, mapped],
    interview: { question: '템플릿 리터럴 타입 대신 명시적인 이벤트 유니온을 선택할 상황은 언제인가요?', answer: '키 조합이 커져 타입 검사와 오류 메시지가 복잡해지거나 공개 API에서 허용 이벤트를 명시적으로 검토해야 할 때입니다.', points: ['자동 갱신의 이점', '조합 수의 비용', '명시적 유니온 대안'] },
  }),
  make({
    id: 'ts30.brand-at-boundary', chapter: 5, order: 30,
    title: '선택 심화: 검증된 ID만 브랜드 타입으로 만들기', navTitle: '선택: branded ID',
    summary: 'unknown 타입의 주문 ID를 실제 접두사와 숫자 규칙으로 검증한 뒤 OrderId 브랜드를 부여해 UserId와 섞이는 실수를 컴파일 단계에서 막습니다.',
    story: '주문 조회 함수에 사용자 ID 문자열을 넘겨도 둘 다 string이라 컴파일을 통과했습니다. 외부 문자열을 검증하는 생성 경계에서만 브랜드를 부여하고, 데이터베이스 존재 여부까지 보장한다고 과장하지 않게 범위를 정합니다.',
    concept: ['브랜드 타입은 string 타입에 고유한 타입 표식을 교차해 구조적으로 같은 ID를 구분하는 패턴입니다. 이 표식은 런타임에 자동 생성되지 않으므로 검증 함수가 성공한 지점에서만 타입 단언을 사용해야 합니다.', '이 레슨은 ID 혼동이 실제 위험인 경우의 선택 심화입니다. 형식 검증을 통과해도 해당 주문이 DB에 존재하거나 현재 사용자가 접근할 권한이 있다는 뜻은 아닙니다.'],
    workedExample: {
      title: '완성 예시: 검증한 문자열에만 브랜드 부여하기',
      code: 'declare const orderIdBrand: unique symbol;\ntype OrderId = string & { readonly [orderIdBrand]: "OrderId" };\n\nfunction toOrderId(value: string): OrderId {\n  if (!value.startsWith("ord_")) throw new Error("잘못된 주문 ID");\n  return value as OrderId;\n}',
      result: ['"ord_" 접두사를 확인한 경계에서만 OrderId 타입으로 단언합니다.', 'OrderId 타입은 다른 string 기반 브랜드와의 혼동을 막지만 주문의 존재나 접근 권한은 보장하지 않습니다.'],
    },
    mission: 'toOrderId 함수가 unknown 타입의 값을 "ord_" 접두사와 양의 정수 규칙으로 검증한 뒤에만 OrderId 타입을 반환하게 하세요. 잘못된 값은 오류로 거절해야 합니다.',
    goals: ['검증 경계 밖에서 임의 브랜드 단언을 퍼뜨리지 않는다.', '브랜드가 보장하는 형식과 보장하지 않는 존재·권한을 구분한다.'],
    hints: ['먼저 value 매개변수가 string 타입인지 확인하세요.', '정규식 /^ord_[1-9]\\d*$/로 전체 형식을 검사할 수 있습니다.', '모든 검사를 통과한 한 지점에서만 OrderId 타입으로 단언하세요.'],
    explanation: ['OrderId 타입과 UserId 타입은 컴파일할 때 서로 대입되지 않아 같은 string 기반 식별자의 혼동을 줄입니다.', '브랜드 타입은 데이터베이스 외래 키나 권한 검사를 대신하지 않습니다. 실제 존재와 접근 가능성은 저장소와 인가 경계에서 확인해야 합니다.'],
    starter: { 'index.ts': `declare const orderIdBrand: unique symbol;
export type OrderId = string & { readonly [orderIdBrand]: 'OrderId' };
export function toOrderId(value: unknown): OrderId { return value as OrderId; }
` },
    solution: { 'index.ts': `declare const orderIdBrand: unique symbol;
export type OrderId = string & { readonly [orderIdBrand]: 'OrderId' };
export function toOrderId(value: unknown): OrderId {
  if (typeof value !== 'string' || !/^ord_[1-9]\\d*$/.test(value)) throw new Error('잘못된 주문 ID');
  return value as OrderId;
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [narrowing],
    interview: { question: 'OrderId 브랜드를 얻으면 주문의 존재와 접근 권한도 보장되나요?', answer: '아니요. 이 변환기는 문자열 형식만 보장하며 존재는 저장소 조회, 접근 권한은 인가 로직에서 따로 검증해야 합니다.', points: ['형식 보장', 'DB 존재 미보장', '권한 미보장'] },
  }),
];
