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
    title: '클래스를 런타임 값과 인스턴스 타입으로 활용하기', navTitle: '클래스 값과 타입',
    summary: 'OrderStore 인터페이스를 구현하고, MemoryOrderStore 클래스에 주문 저장과 조회 동작을 작성합니다.',
    story: '주문 저장소 로직을 테스트용 메모리 구현체로 교체하려 했으나, 클래스 이름을 생성자 호출 자리와 타입 선언 자리에서 혼동하면서 의존성 주입 코드가 복잡해졌습니다. 인터페이스 계약, 클래스 구현체, 그리고 new 연산자로 생성되는 런타임 인스턴스 값을 실습을 통해 확실히 구분해 봅니다.',
    concept: [
      'class 선언은 new 연산자로 호출할 생성자 값과, 이를 통해 생성될 인스턴스 타입을 동시에 정의합니다. `typeof MemoryOrderStore` 타입은 생성자 자체를 가리키며, `MemoryOrderStore` 타입은 인스턴스 객체를 가리킵니다.',
      'implements 절은 클래스가 인터페이스 스펙을 올바르게 준수하는지 컴파일 타임에 검사합니다. 구현부 메서드를 자동으로 생성하거나 런타임 입력을 검증해주지는 않으므로, 데이터 저장 및 조회 로직은 클래스 내부에서 직접 구현해야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: 클래스의 값(Value)과 타입(Type) 구분하기',
      code: 'class MemoryStore {}\n\nconst storeConstructor: typeof MemoryStore = MemoryStore;\nconst store: MemoryStore = new storeConstructor();',
      result: ['typeof MemoryStore 타입은 new 연산자로 인스턴스를 생성할 수 있는 생성자 함수(값)를 의미합니다.', 'MemoryStore 타입은 생성된 인스턴스 객체를 의미하므로, store 변수에 새 인스턴스를 안전하게 할당할 수 있습니다.'],
    },
    mission: 'OrderStore 인터페이스를 구현하는 MemoryOrderStore 클래스를 완성하세요. 생성자로 인스턴스를 생성할 수 있어야 하며, 저장된 주문을 id 속성을 사용해 다시 조회할 수 있어야 합니다.',
    goals: ['인터페이스를 구현하는 클래스의 메서드 계약을 지킨다.', 'Map에 주문을 저장하고 id 속성값으로 조회한다.'],
    hints: ['`Map<string, Order>` 타입의 저장소를 클래스 내부의 private 필드로 선언해 보세요.', 'save 메서드에서는 order.id를 키(Key)로 사용하여 주문을 저장하세요.', 'find 메서드의 반환 타입에는 주문을 찾지 못했을 경우를 대비해 undefined 타입을 포함해야 합니다.'],
    explanation: ['`typeof Class` 타입과 `Class` 타입이 서로 다른 맥락에서 쓰인다는 점은 NestJS 같은 DI(의존성 주입) 프레임워크의 프로바이더 토큰과 인스턴스 타입을 이해하는 기초가 됩니다.', 'implements 절은 오직 컴파일 타임의 타입 계약 검사일 뿐입니다. 외부 JSON 입력이 실제 Order 타입인지 검증해 주지 않으므로 런타임 경계 검증은 별도로 구현해야 합니다.'],
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
    title: '선택 심화: 공통 로직이 존재할 때 추상 클래스 선택하기', navTitle: '선택: 추상 클래스',
    summary: '여러 저장소 간에 재사용 가능한 공통 조회 로직이 존재할 때만 추상 클래스를 도입하고, 구현 없는 단순 계약 정의에는 인터페이스가 더 가벼운 선택인 이유를 알아봅니다.',
    story: '여러 주문 저장소에서 동일한 메모리 조회 로직이 중복되어 공통 클래스로 추출할 필요성이 생겼습니다. 단순히 객체의 구조만 맞추기 위해 불필요하게 추상 계층을 추가하지 않고, 실제로 재사용할 상태와 로직이 있는 상황에서 추상 클래스 도입의 장단점을 비교해 봅니다.',
    concept: [
      'abstract class 선언은 new 연산자로 직접 인스턴스를 생성할 수 없으며, 파생 클래스가 반드시 구현해야 하는 abstract 멤버와 공통 구현 로직을 함께 가질 수 있습니다. 공통 상태나 동작이 없다면 interface를 사용하는 것이 결합도를 낮추는 데 더욱 적합합니다.',
      '본 레슨은 선택 심화 과정입니다. 실제 재사용해야 하는 공통 로직이나 상태가 존재하는 경우에만 추상 클래스 기반의 구조를 고려합니다.',
    ],
    workedExample: {
      title: '완성 예시: 공통 조회 로직은 상속하고 저장 로직만 직접 구현하기',
      code: 'abstract class Repository {\n  abstract save(id: string): void;\n  find(id: string): string { return id; }\n}\n\nclass MemoryRepository extends Repository {\n  save(id: string): void { void id; }\n}',
      result: ['Repository 추상 클래스는 직접 인스턴스화할 수 없으며, MemoryRepository 파생 클래스에서 save 추상 메서드를 반드시 구현해야 합니다.', 'find 메서드는 기본 클래스에 이미 구현되어 있으므로 파생 클래스에서 다시 구현하지 않아도 됩니다.'],
    },
    mission: 'OrderRepository 추상 클래스에 공통 find 메서드를 구현하고, MemoryOrderRepository 파생 클래스에는 save 메서드만 구현하세요.',
    goals: ['추상 멤버의 역할과 상속된 공통 구현 로직의 책임을 구분한다.', '공통 구현 로직이 없을 때 인터페이스를 선택해야 하는 이유를 이해한다.'],
    hints: ['기본 클래스의 orders 필드는 파생 클래스에서도 접근할 수 있도록 protected 접근 제한자로 선언하세요.', 'find 메서드는 기본 클래스 내부에 공통 로직으로 구현합니다.', 'save 메서드는 abstract 키워드로 선언만 하고, 실제 구현은 파생 클래스로 위임하세요.'],
    explanation: ['공통 `Map` 상태와 `find` 메서드 로직이 존재하므로, 이 예제에서는 추상 클래스를 사용하는 것이 코드 중복을 줄이는 효율적인 선택입니다.', '단순히 여러 구현체 간의 스펙 계약이나 서로 다른 데이터 저장 방식만 필요하다면 인터페이스 기반의 조합(Composition)이 훨씬 유연합니다. 자바스크립트의 클래스는 단일 상속만 지원한다는 점에 유의하세요.'],
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
    interview: { question: '저장소 계약에서 공통 상태와 로직이 모두 사라진다면 추상 클래스와 인터페이스 중 무엇을 선택해야 하나요?', answer: '공통 구현 없이 데이터 구조와 메서드 모양만 공유한다면 인터페이스를 선택합니다. 이를 통해 단일 상속 제약을 피하고 불필요한 계층 구조 생성을 막을 수 있습니다.', points: ['공통 구현 로직의 유무', '단일 상속 제약에 따른 비용', '유연한 대체재로서의 인터페이스'] },
  }),
  make({
    id: 'ts20.decorator-boundary', chapter: 4, order: 20,
    title: '메서드 데코레이터의 실행 시점과 타입 시스템의 한계 이해하기', navTitle: 'decorator 경계',
    summary: '메서드 호출 로그를 남기는 표준 데코레이터를 구현해 보며, 데코레이터가 런타임에 실행되는 코드임을 이해하고 외부 입력값의 타입을 검증해주지는 못하는 한계를 확인합니다.',
    story: '결제 서비스 메서드에 데코레이터를 적용하자, 팀원들이 런타임 요청값까지 자동으로 검증된다고 오해했습니다. 데코레이터가 클래스 정의 시점과 실제 메서드 호출 시점에 어떻게 개입하는지 실행 결과로 확인하고, DTO 검증 책임의 명확한 경계를 설정해 봅니다.',
    concept: [
      '표준 메서드 데코레이터 함수는 원본 메서드와 context 객체를 받아 래퍼 함수를 반환할 수 있습니다. This는 this 객체, Args는 인수 목록, Return은 반환값을 나타내는 타입 매개변수입니다. 데코레이터 함수는 클래스 정의 시점에 실행되고 래퍼 함수는 메서드를 호출할 때 실행됩니다.',
      '데코레이터의 타입 시그니처는 컴파일 타임에 잘못된 입력을 방지할 수 있지만, 네트워크를 통해 들어오는 실제 런타임 데이터의 형태를 검증해주지는 않습니다. NestJS Controller 등의 파이프라인 검증 체계는 별도의 런타임 로직으로 동작합니다.',
    ],
    workedExample: {
      title: '완성 예시: 메서드를 감싸 호출 기록 남기기',
      code: 'function log<This>(target: (this: This) => string, context: ClassMethodDecoratorContext<This, (this: This) => string>) {\n  return function (this: This): string {\n    console.log(String(context.name));\n    return target.call(this);\n  };\n}',
      result: ['log 데코레이터 함수는 클래스가 정의될 때 원본 메서드를 전달받아 래퍼 함수를 반환합니다.', '래퍼 함수 내부의 console.log 실행 로직은 인스턴스의 메서드가 실제 호출될 때 동작합니다.'],
    },
    mission: '`@logCall` 데코레이터를 구현하여 charge 메서드가 호출될 때마다 메서드 이름을 calls 배열에 기록하고, 원본 this 바인딩, 전달된 인수, 반환값을 그대로 유지하도록 작성하세요.',
    goals: ['데코레이터가 평가되는 시점과 반환된 래퍼 함수가 실행되는 시점을 구분한다.', '데코레이터의 정적 타입 지정과 런타임 데이터 검증이 별개의 책임임을 이해한다.'],
    hints: ['데코레이터 함수는 원본 메서드인 target과 메서드의 메타데이터를 담은 context를 매개변수로 받습니다.', '반환되는 래퍼 함수 내부에서 calls 배열에 `String(context.name)`을 추가하세요.', '`target.call(this, ...args)`를 호출해 원본 메서드의 this 바인딩과 인수를 손실 없이 전달하세요.'],
    explanation: ['호출 로그 기록은 데코레이터가 반환한 래퍼 함수가 호출될 때 실행되는 런타임 동작이며, 데코레이터를 선언했다고 해서 charge 입력값이 자동으로 검증되는 것은 아닙니다.', '네트워크 경계에서는 unknown 데이터 검증이나 프레임워크 수준의 검증 파이프라인이 필수적이며, 데코레이터 단독으로는 런타임 데이터의 안전성을 보장할 수 없습니다.'],
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
    interview: { question: '@logCall 데코레이터를 붙였다고 해서 HTTP 요청의 total 매개변수가 무조건 number 타입이라고 신뢰할 수 없는 이유는 무엇인가요?', answer: '타입 표식은 컴파일 타임의 정적 타입만 검사할 뿐 실제 네트워크를 통해 들어오는 런타임 값을 검증하지 않으며, 해당 데코레이터는 호출 기록 작성만 수행하기 때문입니다.', points: ['데코레이터 래퍼 함수의 실행 시점', '정적 타입 시스템의 보장 범위 한계', '별도 런타임 데이터 검증의 필요성'] },
  }),
  make({
    id: 'ts21.enum-or-const-object', chapter: 4, order: 21,
    title: '선택 심화: enum과 as const 객체 비교 분석하기', navTitle: '선택: enum 비교',
    summary: 'enum과 as const 객체의 런타임 형태를 구분하고, JSON 상태값에 맞는 문자열 유니온을 만듭니다.',
    story: '서버 JSON API는 문자열 형태의 상태값을 반환하는데, 클라이언트 도메인 모델에서 숫자 enum을 사용하다 보니 로깅 및 응답 값 일치 과정에서 혼선이 발생했습니다. 기존 라이브러리의 enum 호환성은 유지하면서, 신규 공개 스펙에서는 런타임 구조와 직렬화 표현이 명확히 드러나는 설계를 선택해 봅니다.',
    concept: [
      'enum 선언은 타입 역할을 하는 동시에 런타임 자바스크립트 객체를 생성합니다. `as const` 단언을 적용한 객체 역시 런타임 값으로 남지만, 속성값으로부터 유니온 타입을 추출하여 JSON 문자열과 일치하는 명확한 타입을 구성할 수 있습니다.',
      '본 레슨은 선택 심화 과정입니다. 기존 API가 enum을 사용한다면 호환해야 합니다. 새 앱 모델에서는 문자열 유니온이나 as const 객체가 JSON 값과 직접 대응해 더 단순할 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: 상수 객체로부터 문자열 유니온 타입 생성하기',
      code: 'const STATUS = { pending: "pending", paid: "paid" } as const;\ntype Status = typeof STATUS[keyof typeof STATUS];\n\nconst current: Status = "pending";',
      result: ['as const 단언을 붙이면 객체 속성의 값이 일반 string이 아닌 "pending" 및 "paid" 문자열 리터럴 타입으로 동결됩니다.', 'typeof와 keyof를 조합해 만든 Status 타입은 "pending" | "paid" 유니온 타입이 되므로 지정되지 않은 다른 문자열 할당을 방지합니다.'],
    },
    mission: 'ORDER_STATUS 객체에서 OrderStatus 유니온 타입을 만들고, statusLabel 함수가 "pending"에는 "결제 대기", "paid"에는 "결제 완료"를 반환하도록 작성하세요.',
    goals: ['enum과 as const 객체가 모두 런타임 값으로 남는다는 점을 이해한다.', 'JSON 문자열 상태값과 맞는 유니온 타입을 만든다.'],
    hints: ['객체 속성의 리터럴 타입을 추론 상태로 유지하려면 `as const` 단언을 추가하세요.', '`typeof ORDER_STATUS[keyof typeof ORDER_STATUS]` 구문으로 값들의 유니온 타입을 추출할 수 있습니다.', 'statusLabel 함수 내부에서 허용된 두 가지 상태값을 모두 처리하세요.'],
    explanation: ['서버가 "pending", "paid"와 같은 문자열 데이터를 전송하는 스펙에서는 동일한 문자열 값을 가지는 const 객체가 직렬화 형식을 직관적으로 보여줍니다.', 'enum 선언이 무조건 잘못된 것은 아닙니다. 레거시 라이브러리와의 호환성, 역방향 매핑(Reverse Mapping)의 필요성, 팀 내부 컨벤션 등을 다각도로 비교하여 선택해야 합니다.'],
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
    interview: { question: '문자열 기반의 JSON 상태값을 새롭게 설계할 때 enum과 as const 중 어떤 기준을 바탕으로 선택해야 하나요?', answer: 'JSON 직렬화 포맷과 런타임 객체 형태가 그대로 드러나는지, 레거시 호환성이 필요한지, 컴파일 시 추가 코드가 생성되는 부담이 있는지 등을 비교하여 선택합니다.', points: ['트랜스파일 시 런타임 출력 결과물의 차이', 'JSON 직렬화 및 디시리얼라이즈 표현 명확성', '기존 공개 API 계약과의 호환 가능 여부'] },
  }),
  make({
    id: 'ts22.strict-baseline', chapter: 4, order: 22,
    title: 'strict 옵션이 감지한 에러를 코드 경계별로 해결하기', navTitle: 'strict 기준선',
    summary: 'strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes 옵션이 각각 지적하는 배열 접근 에러, catch 블록 unknown 타입 문제, 선택적 속성 타입을 안전한 코드로 보완합니다.',
    story: '기존 어드민 코드베이스에 strict 검사 기준을 적용하자 빈 배열 접근 시점의 undefined 에러, catch 블록의 에러 객체 접근 문제, nickname: undefined 요청 등의 에러가 대거 감지되었습니다. 컴파일러 옵션을 끄지 않고 각 값이 실제로 없거나 타입을 알 수 없는 경계에서 안전하게 처리하도록 기준선을 구축합니다.',
    concept: [
      'strict 옵션은 여러 엄격 검사를 묶은 기준선입니다. noUncheckedIndexedAccess와 exactOptionalPropertyTypes는 strict에 포함되지 않는 별도 옵션입니다. 앞 옵션은 인덱스 접근 결과에 undefined를 추가하고, 뒤 옵션은 선택적 속성의 생략과 명시적인 undefined 대입을 구분합니다.',
      '아래 예시에서는 배열의 첫 번째 원소가 존재하지 않을 경우를 대비해 "없음"이라는 기본값을 설정합니다. 데이터의 부재 가능성을 런타임 경계에서 명확히 처리해 두면 이후 코드는 안전하게 string 타입만 다룰 수 있게 됩니다.',
    ],
    workedExample: {
      title: '완성 예시: 배열 인덱스 접근 시 undefined 안전하게 처리하기',
      code: 'type Settings = { locale?: string };\n\nfunction firstName(names: readonly string[]): string {\n  return names[0]?.trim() ?? "이름 없음";\n}\n\nfunction message(error: unknown): string {\n  return error instanceof Error ? error.message : String(error);\n}\n\nfunction settings(locale: string | undefined): Settings {\n  return locale === undefined ? {} : { locale };\n}',
      result: ['noUncheckedIndexedAccess를 사용하면 names[0]은 string | undefined이므로 기본값을 처리합니다.', 'catch 등에서 받은 unknown 오류는 Error인지 확인한 뒤 message 속성을 읽습니다.', 'exactOptionalPropertyTypes를 사용하면 locale이 undefined일 때 속성 자체를 생략합니다.'],
    },
    mission: '유사한 마이그레이션 대상 코드에서 firstLabel, errorMessage, makeProfile 함수를 수정하여 엄격한 검사 기준을 통과하고 의도된 tsconfig 설정과 일치시키세요.',
    goals: ['배열 인덱스 접근 및 catch 블록의 unknown 타입이 유발할 수 있는 실패 가능성을 코드에 안전하게 반영한다.', '선택적 속성의 키 생략과 명시적 undefined 할당의 차이를 이해하고 안전하게 분기한다.'],
    hints: ['items[0]에 접근했을 때 값이 없을 경우에 대비한 기본 대체 문자열을 지정하세요.', 'catch 블록으로 전달된 error 변수가 Error 인스턴스인지 instanceof 연산자로 검증한 후 message 속성에 접근하세요.', 'nickname 매개변수가 undefined로 들어오면 빈 객체를 반환하여 키 자체를 생략하세요.'],
    explanation: ['엄격 옵션을 즉시 전체 도입하기 어려운 대형 프로젝트라면 에러 발생 건수와 경계를 측정하여 단계적으로 마이그레이션할 수 있으나, 신규 작성 코드에 대한 검사 기준선은 명확히 문서화해야 합니다.', '본 실습 환경에서는 strict 및 noUncheckedIndexedAccess가 기본으로 설정되어 있으며 exactOptionalPropertyTypes가 픽스처 옵션으로 적용됩니다.'],
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
    title: '선택 심화: 콜백 매개변수의 안전한 허용 범위 이해하기 (함수 변성)', navTitle: '선택: 함수 변성',
    summary: 'strictFunctionTypes 옵션 환경에서 호출자가 모든 Row 객체를 전달할 수 있도록 renderRow 콜백의 매개변수 타입을 올바르게 수정하고, 더 좁은 매개변수 타입 지정을 방지하는 이유를 확인합니다.',
    story: '테이블 라이브러리는 일반 Row와 VIP Row를 모두 넘겨주며 콜백을 호출하는데, 클라이언트 콜백 함수가 vip 필드가 반드시 존재한다고 타입을 좁혀 선언해 두었습니다. 일반 Row가 입력되는 런타임 경로를 고려하여 콜백 타입을 넓게 정의해 속성 참조 에러를 방지합니다.',
    concept: [
      '콜백을 호출하는 주체가 Row 타입에 해당하는 다양한 데이터를 전달할 수 있다면, 콜백 함수의 매개변수 타입은 Row보다 좁은 타입(특수 타입)이어서는 안 됩니다. strictFunctionTypes 옵션은 이러한 함수 매개변수의 반변성(Contravariance) 대입 가능성을 엄격하게 검사합니다.',
      '본 레슨은 공용 라이브러리나 API의 콜백 타입을 설계할 때 알아두어야 할 선택 심화 내용입니다. 콜백 스펙은 작성자가 원하는 타입이 아닌, 호출자가 실제로 전달할 수 있는 전체 데이터 범위를 기준으로 정의해야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: 호출자가 전달하는 모든 데이터 형태 받아내기',
      code: 'type Message = { text: string };\ntype MessageHandler = (message: Message) => void;\n\nconst handleMessage: MessageHandler = (message) => {\n  console.log(message.text);\n};',
      result: ['handleMessage 콜백은 호출자가 전달할 수 있는 모든 Message 객체를 받습니다.', '콜백 매개변수에 더 좁은 속성을 요구하면 일반 Message 객체를 전달하는 호출과 맞지 않습니다.'],
    },
    mission: 'renderRow 함수가 모든 Row 데이터를 안전하게 전달받을 수 있도록 수정하고, vip 속성을 필수 타입으로 요구하는 콜백이 왜 RowRenderer 위치에 할당될 수 없는지 확인하세요.',
    goals: ['콜백 호출자가 전달 가능한 전체 데이터 범위를 입력 타입으로 받아들인다.', '너무 좁게 정의된 매개변수 타입이 유발하는 런타임 실패 사례를 이해한다.'],
    hints: ['RowRenderer 타입이 이미 매개변수의 타입을 정의해 주고 있으므로 중복 타입 지정을 덜어내세요.', '일반 Row 객체에는 vip 필드가 포함되어 있지 않습니다.', '추가 필드 접근이 필요하다면 콜백 내부에서 타입 가드로 존재 여부를 좁혀 사용하세요.'],
    explanation: ['렌더러 함수는 VIP 행만 처리하는 특수 목적 함수가 아니라, 테이블 컴포넌트가 전달할 수 있는 모든 Row 객체를 다룰 수 있어야 합니다.', '함수 변성(Variance) 규칙을 무작정 외우기보다는, "누가 이 함수를 호출하며 어떤 형태의 데이터값들을 넘겨줄 수 있는가?"를 먼저 고민하면 타입 안전성을 쉽게 확보할 수 있습니다.'],
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
    title: '전역 스크립트 범위와 명시적 모듈 경계 분리하기', navTitle: 'script와 module',
    summary: '전역 식별자 충돌을 일으키는 레거시 스크립트 파일들을 독립된 모듈로 변경하고, import type을 사용해 런타임 값과 컴파일 전용 타입 의존성을 분리합니다.',
    story: '서로 다른 레거시 파일에 선언된 mode 상수가 전역 스코프에서 충돌하고, 타입으로만 사용하는 Order import 구문이 트랜스파일 후에도 런타임 의존성으로 남았습니다. 각 파일의 모듈 스코프와 타입/값 구분을 명확히 고쳐 빌드 에러와 불필요한 번들 로딩을 해결해 봅니다.',
    concept: [
      'import나 export 구문이 전혀 없는 파일은 일반 스크립트로 평가되어 내부 선언들이 전역 스코프를 공유합니다. 파일에 `export {}` 구문을 추가하면 독립된 모듈로 변환되어 파일 간에 동일한 식별자 이름을 자유롭게 사용할 수 있습니다.',
      '타입 전용 import(`import type`) 구문은 자바스크립트로 트랜스파일될 때 깔끔히 제거되지만, 일반 값 import는 런타임 모듈 로딩 코드로 남게 됩니다. verbatimModuleSyntax 옵션을 활용하면 이러한 의도를 코드상에 명확히 구별할 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: 일반 스크립트를 모듈로 전환하고 타입만 가져오기',
      code: '// config.ts\nconst region = "seoul";\nexport {};\n\n// view.ts\nimport type { User } from "./user.js";',
      result: ['export {} 구문을 통해 config.ts 파일이 모듈로 다뤄지므로 region 상수가 전역 이름과 충돌하지 않습니다.', 'User 타입에 사용한 import type은 컴파일 시 제거되므로 런타임 의존성을 만들지 않습니다.'],
    },
    mission: '제시된 파일들 중 두 전역 스크립트를 독립 모듈로 전환하고, index.ts 파일에서 Order 타입의 import와 label 값의 import 구문을 깔끔하게 분리해 보세요.',
    goals: ['전역 스크립트로 인한 식별자 충돌을 파일 수준의 모듈 경계로 해결한다.', '타입 전용 import 구문과 런타임 값 import 구문을 명확히 구분한다.'],
    hints: ['전역 스코프에 굳이 둘 필요가 없는 파일의 가장 하단에 `export {}` 구문을 추가하세요.', 'Order 타입을 임포트할 때는 `import type` 구문을 사용하세요.', 'label은 런타임에 실행할 함수이므로 일반 값 import 방식을 유지하세요.'],
    explanation: ['export {}는 해당 파일을 모듈로 표시해 선언의 범위를 파일 안으로 제한합니다.', 'import type은 타입 의존성에 사용하고, 실행에 필요한 값은 일반 import로 가져옵니다.'],
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
    title: '사용하는 API 표면만 최소한의 타입 선언 파일(.d.ts)로 정의하기', navTitle: '최소 .d.ts',
    summary: '타입 선언이 없는 analytics 패키지에서 사용하는 API만 .d.ts 파일에 선언해 이벤트 오타와 필드 누락을 찾습니다.',
    story: '타입 선언이 없는 레거시 analytics 패키지를 any 타입으로 임의 사용했더니 checkout 이벤트 이름의 오타나 orderId 속성 누락을 빌드 시점에 전혀 감지하지 못했습니다. 문서로 검증된 최소한의 사용 표면만 타입으로 선언하여 잘못된 호출을 컴파일 단계에서 포착해 봅니다.',
    concept: [
      '`declare module` 구문은 타입 정의가 없는 외부 자바스크립트 모듈에 정적 타입 인터페이스를 부여할 때 사용합니다. 널리 사용되지 않는 전체 API를 섣불리 추측해 작성하기보다는, 실제로 사용되는 함수와 매개변수 스펙만 좁혀 선언하는 것이 좋습니다.',
      '다음 예시는 track 함수가 처리하는 이벤트 리터럴과 payload 객체를 최소한으로 선언한 모습입니다. 정상적인 호출은 컴파일을 통과하지만 이벤트명 오타나 orderId 누락 시에는 타입 에러를 냅니다. 선언 파일은 타입 힌트만 제공할 뿐 실제 런타임 구현을 생성해 주지는 않으므로 문서 확인과 통합 테스트가 병행되어야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: 외부 모듈의 최소 호출 스펙 선언하기',
      code: 'declare module "feature-flags" {\n  export function enabled(\n    flag: "new_search" | "quick_pay",\n  ): boolean;\n}',
      result: ['enabled 함수는 문서에서 확인한 두 기능 이름만 받습니다.', '선언에 없는 기능 이름을 넘기면 컴파일 타임 오류가 발생합니다. 선언 파일이 실제 구현을 만들지는 않습니다.'],
    },
    mission: 'analytics 모듈 호출부에서 any 타입을 제거하세요. "checkout_started"와 "checkout_completed" 이벤트를 받아들이는 최소한의 track 함수 타입을 analytics.d.ts 파일에 정의하세요.',
    goals: ['프로젝트에서 실제로 사용하는 패키지 API의 최소 표면만 선언한다.', '선언 파일의 정적 타입 보장과 자바스크립트 모듈의 런타임 실제 동작을 구분한다.'],
    hints: ['`declare module "analytics"` 블록 내부에서 track 함수 스펙을 선언하세요.', 'event 매개변수의 타입은 허용된 두 문자열 리터럴의 유니온 타입으로 지정하세요.', 'payload 매개변수는 필수 string 타입의 orderId 속성을 포함해야 하며 반환 타입은 void입니다.'],
    explanation: ['최소한의 스펙만 좁혀 선언하면 검증되지 않은 패키지 전체 기능을 임의로 타입화하여 발생하는 위험을 예방할 수 있습니다.', '타입 선언과 실제 설치된 라이브러리의 버전이 다를 경우 타입 시스템이 거짓 보장을 제공할 수 있으므로, 공식 스펙 문서 및 통합 테스트 환경을 통한 재검증이 필수적입니다.'],
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
    title: '패키지의 export = 및 ESM 타입 선언 명세 읽기', navTitle: 'package 타입 계약',
    summary: '레거시 CommonJS 방식의 export = 선언과 ESM named export 선언 모듈의 사용 형태를 비교해 보고, 실제 앱에서 사용하는 format API를 가벼운 래퍼 함수로 감싸 가져옵니다.',
    story: '패키지 문서의 CommonJS 예제 코드를 ESM import 문법으로 그대로 가져왔더니 타입 추론과 런타임 동작 형태가 어긋났습니다. 모듈 배포 포맷을 자의적으로 지레짐작하지 않고, 제공된 타입 선언 파일의 내보내기 방식에 맞추어 래퍼 함수 패턴으로 캡슐화해 봅니다.',
    concept: [
      '`export =` 선언 구문은 모듈 자체가 하나의 단일 값으로 내보내지는 CommonJS 모듈 구조를 표현합니다. 반면 ESM 선언의 `export function` 구문은 이름을 가지는 내보내기(Named Export) 형태를 의미합니다. 소비하는 측에서는 패키지가 제공하는 선언 포맷과 모듈 설정 규격을 충실히 따라야 합니다.',
      '패키지 타사 타입을 앱 전체에 노출하기보다 필요한 format 기능만 래퍼 함수 내부로 숨기면, 향후 해당 패키지의 포맷이나 버전이 변경되더라도 수정 영향을 최소화할 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: export = 선언 모듈을 래퍼 함수로 캡슐화하기',
      code: 'import slugger from "./legacy-slugger.js";\n\nexport function toSlug(title: string): string {\n  return slugger(title, { lowercase: true });\n}',
      result: ['esModuleInterop 또는 allowSyntheticDefaultImports 설정이 허용하면 export = 모듈을 default import 형태로 가져올 수 있습니다.', 'toSlug 래퍼 함수는 외부 패키지의 옵션을 감추고 string 입력과 string 반환만 앱에 제공합니다.'],
    },
    mission: '제시된 export = 타입 선언을 분석하여 formatter를 올바르게 가져온 후, 주문 id를 대문자 형식으로 반환하는 formatOrder 래퍼 함수를 완성하세요.',
    goals: ['export = 구문과 ESM 내보내기 구문 간의 모듈 형태 차이를 식별한다.', '외부 패키지의 의존 범위를 앱 내부의 가벼운 래퍼 함수 인터페이스로 격리한다.'],
    hints: ['legacy-formatter.d.ts에 명시된 export = 형태를 확인해 보세요.', '프로젝트 설정에서 지원하는 default import 문법으로 모듈 값을 임포트하세요.', 'formatOrder 래퍼는 넓은 패키지 옵션을 노출하지 않고 string을 받아 string을 반환하도록 단순하게 작성하세요.'],
    explanation: ['이러한 래퍼 함수 패턴은 앱 도메인 코드가 외부 레거시 패키지의 구체적인 타입 정의 형태에 직접 의존하지 않도록 보호해 줍니다.', '타입 선언 파일이 ESM 형태처럼 보이더라도 package.json의 exports 설정에 따라 런타임 결과가 다를 수 있으므로 Node 환경 통합 테스트를 확인하는 습관이 필요합니다.'],
    starter: { 'legacy-formatter.d.ts': `declare function formatter(value: string, options?: { uppercase?: boolean }): string;
export = formatter;`, 'modern-formatter.d.ts': `export function format(value: string, options?: { uppercase?: boolean }): string;`, 'index.ts': `export function formatOrder(id: string): string { return id; }` },
    solution: { 'legacy-formatter.d.ts': `declare function formatter(value: string, options?: { uppercase?: boolean }): string;
export = formatter;`, 'modern-formatter.d.ts': `export function format(value: string, options?: { uppercase?: boolean }): string;`, 'index.ts': `import formatter from './legacy-formatter.js';
export function formatOrder(id: string): string { return formatter(id, { uppercase: true }); }` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [declarations, modules],
    interview: { question: '패키지의 .d.ts 파일만 확인하고 실제 ESM/CommonJS 런타임 호환성을 단정할 수 없는 이유는 무엇인가요?', answer: '타입 선언 파일은 정적 타입만 설명합니다. 런타임 로딩 방식은 자바스크립트 파일, package.json의 exports, 실행 환경의 모듈 해석에 따라 달라집니다.', points: ['정적 타입 선언 파일의 한계', '런타임 exports 확인', '래퍼 함수로 변경 범위 제한'] },
  }),
  make({
    id: 'ts27.mapped-errors', chapter: 5, order: 27,
    title: '매핑 타입을 활용해 도메인 모델 동기화 필드 에러 타입 만들기', navTitle: 'mapped errors',
    summary: '폼 모델의 모든 필드 키를 순회하여 선택적 `string[]` 타입 에러로 변환하는 `FieldErrors<T>` 매핑 타입을 작성해 봅니다. 필드가 추가되거나 이름이 변경되어도 에러 타입이 자동으로 동기화됩니다.',
    story: '주문 폼 모델에 note 필드를 추가했지만 수동으로 작성한 에러 객체 타입에는 이 키가 누락되어 화면 컴포넌트가 에러 메시지를 노출하지 못하는 버그가 발생했습니다. 원본 데이터 모델의 키 목록을 수동으로 복사해 관리하지 않고 자동 동기화되는 타입 구조를 만들어 봅니다.',
    concept: [
      '매핑 타입(Mapped Type)은 `keyof T`로 추출한 타입 키들을 순회하여 새로운 객체 타입을 생성합니다. `[K in keyof T]` 형태의 템플릿 구문을 통해 기존 속성의 키와 반환 타입을 동적으로 매핑합니다.',
      '에러가 발생하지 않은 정상 필드는 에러 응답 객체에서 생략될 수 있어야 하므로 `?` 옵셔널 수식어를 추가하여 선택적 속성으로 정의합니다. 본 실습은 1차원 필드 매핑만 다루며 재귀적 중첩 구조 검증은 다루지 않습니다.',
    ],
    workedExample: {
      title: '완성 예시: 모델의 필드 키마다 선택적 에러 배열 타입 매핑하기',
      code: 'type Flags<T> = {\n  [K in keyof T]?: boolean;\n};\n\ntype FeatureFlags = Flags<{ search: string; checkout: string }>;',
      result: ['매핑 타입이 "search"와 "checkout" 키를 순회해 같은 이름의 boolean 속성을 만듭니다.', '? 수식어가 있으므로 설정하지 않은 기능은 생략할 수 있습니다.'],
    },
    mission: '`FieldErrors<T>`가 T 타입 매개변수로 받은 모델의 각 키에 선택적인 `string[]` 오류 목록을 연결하도록 고치세요.',
    goals: ['`keyof T` 키를 순회하는 Mapped Type을 올바르게 정의한다.', '에러가 없는 정상 필드를 optional(?) 속성으로 명확히 표현한다.'],
    hints: ['`[K in keyof T]` 형태로 원본 데이터의 키를 순회하세요.', '각 속성에 매핑될 타입은 여러 에러 메시지들을 보관할 수 있는 `string[]`입니다.', '속성 이름 뒤에 `?` 수식어를 덧붙여 에러 없는 필드가 생략될 수 있도록 하세요.'],
    explanation: ['OrderForm의 속성 스펙이 변경되면 `FieldErrors<OrderForm>` 타입 역시 동적으로 변경 사항을 추적하므로 누락 위험이 방지됩니다.', '이 타입 정의는 어디까지나 컴파일 타임의 에러 객체 형태만 규정할 뿐, 실제 런타임 검증을 수행하거나 에러 메시지를 생성해 주지는 않으므로 별도의 런타임 로직이 수반되어야 합니다.'],
    starter: { 'index.ts': `export type FieldErrors<T> = Record<string, string[]>;
` },
    solution: { 'index.ts': `export type FieldErrors<T> = { [K in keyof T]?: string[] };
` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [mapped],
  }),
  make({
    id: 'ts28.infer-and-distribution', chapter: 5, order: 28,
    title: '선택 심화: infer 타입 추출과 조건부 타입의 분산 동작 제어하기', navTitle: '선택: infer와 분산',
    summary: '이벤트 유니온에서 payload 타입을 추출하고, 유니온 전체가 조건을 만족하는지는 분산 없이 검사합니다.',
    story: '이벤트 버스 라이브러리 타입을 분석하던 중, 일부 이벤트만 payload 속성을 갖고 있음에도 전체 이벤트 타입에 payload가 항상 존재한다고 잘못 판단하는 문제가 생겼습니다. 조건부 타입의 분산(Distributive) 특성을 의도에 맞춰 제어하여 타입 안전성을 높여 봅니다.',
    concept: [
      '조건부 타입 삼항 연산자의 좌변에 감싸지지 않은 제네릭 타입 매개변수 T가 들어오면, 유니온 타입의 개별 요소 단위로 조건식이 각각 적용되는 분산(Distributive) 동작이 일어납니다. 이때 `infer` 키워드를 활용하면 매칭된 타입 내부의 특정 요소만 추출하여 변수처럼 다룰 수 있습니다.',
      '유니온 전체를 단일 단위로 묶어 일괄 검사하고 싶다면 `[T] extends [U]` 구문처럼 조건문의 좌/우변을 튜플 타입으로 감싸 분산 동작을 억제해야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: payload 타입 추출과 전체 유니온 조건 검사 구분하기',
      code: 'type ItemOf<T> = T extends readonly (infer Item)[] ? Item : never;\ntype AreAllArrays<T> = [T] extends [readonly unknown[]] ? true : false;\n\ntype Input = string[] | number;',
      result: ['ItemOf<Input> 타입은 유니온에 분산되어 string 타입을 추출합니다.', 'Input의 모든 구성원이 배열은 아니므로 AreAllArrays<Input> 타입은 false로 평가됩니다.'],
    },
    mission: '`PayloadOf<T>` 타입은 각 이벤트의 payload 속성 타입을 추출하고, `IsAllPayload<T>` 타입은 모든 유니온 구성원에 payload 속성이 있을 때만 true 타입으로 평가되도록 완성하세요.',
    goals: ['infer 키워드를 활용해 구조화된 타입의 내부 요소를 추론/추출한다.', '분산 조건부 타입(Distributive Conditional Type)과 튜플을 활용한 분산 억제 기술을 이해한다.'],
    hints: ['`PayloadOf<T>`에서는 제네릭 매개변수 T를 조건식 좌변에 감싸지 않고 직접 위치시키세요.', 'payload 타입은 `infer P` 구문을 통해 동적으로 캡처할 수 있습니다.', '유니온 전체를 한 덩어리로 비교하려면 조건식 양변을 `[T]` 형태로 감싸 튜플로 만드세요.'],
    explanation: ['분산 특성은 각 이벤트 형태별로 정의된 payload 유니온 타입을 획득할 때 유용하며, 유니온 전체가 공통 조건 스펙을 충족하는지 검증할 때는 억제시켜야 합니다.', '이 조건부 타입 계산은 어디까지나 정적 컴파일 단계의 계산이므로 런타임 이벤트 데이터에 대한 검증은 별도로 이루어져야 합니다.'],
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
    title: '선택 심화: 템플릿 리터럴과 키 재매핑(Key Remapping) 적용 범위 설정하기', navTitle: '선택: key remap',
    summary: '도메인 모델의 문자열 키로 "Changed" 이벤트와 "metric_" 접두사가 붙은 속성을 만듭니다.',
    story: '대시보드 이벤트와 메트릭 키를 손으로 반복해서 적다 보니 오타가 생겼습니다. 원본 모델의 문자열 키에서 공개 이름을 만들고 값 타입은 그대로 유지합니다.',
    concept: [
      '템플릿 리터럴 타입(Template Literal Type)은 문자열 리터럴 타입들을 결합하여 새로운 형태의 문자열 타입을 생성합니다. 매핑 타입의 `as` 절을 조합하면 원본 객체 속성의 키 이름을 동적으로 재정의(Remap)할 수 있습니다.',
      '`Extract<keyof T, string>` 구문을 사용하면 symbol이나 number 형태의 키를 안전하게 제어할 수 있습니다. 무분별한 조합 생성은 타입 체커 연산 성능 저하 및 에러 메시지 가독성 저하로 이어질 수 있으므로 유의해야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: 문자열 키를 조합하고 새 키로 바꾸기',
      code: 'type GetterName<T> = `get${Capitalize<Extract<keyof T, string>>}`;\ntype ApiView<T> = {\n  [K in keyof T as `api_${Extract<K, string>}`]: T[K];\n};\n\ntype UserGetter = GetterName<{ name: string; age: number }>;\ntype ApiUser = ApiView<{ name: string; age: number }>;',
      result: ['UserGetter 타입은 "getName" | "getAge" 유니온으로 평가됩니다.', 'ApiView는 as 절에서 원본 키 앞에 "api_"를 붙입니다. 값 타입은 T[K]로 그대로 유지합니다.'],
    },
    mission: 'ChangeEvent<T>와 PublicMetrics<T> 타입을 작성하여 string 키만 골라 재매핑을 수행하고 원본 값 타입을 온전히 유지하도록 완성하세요.',
    goals: ['템플릿 리터럴 타입으로 문자열 키를 조합한다.', '매핑 타입의 as 절로 키 이름을 바꾸면서 원본 값 타입을 유지한다.'],
    hints: ['`keyof T`로 얻은 타입 중 `Extract<..., string>`을 사용해 문자열 키만 걸러내세요.', '이벤트명 생성 시에는 추출된 원본 키 뒤에 "Changed" 접미사를 덧붙이세요.', 'PublicMetrics 구현 시에는 `as` 절을 사용해 키 앞에 `metric_` 접두사를 지정하고, 반환값 타입은 `T[K]` 형태를 유지하세요.'],
    explanation: ['도메인 모델의 속성이 변경될 경우 템플릿 기반으로 매핑된 타입도 자동 동기화되어 오타나 속성 누락을 효과적으로 예방할 수 있습니다.', '다만 키 집합의 크기가 지나치게 가변적이거나 외부에 노출되는 공용 API 형태라면 명시적인 유니온 타입이나 코드 제네레이터를 활용하는 편이 더 명확할 수 있습니다.'],
    starter: { 'index.ts': `export type ChangeEvent<T> = string;
export type PublicMetrics<T> = { [K in keyof T]: T[K] };
` },
    solution: { 'index.ts': `export type ChangeEvent<T> = \`${'${Extract<keyof T, string>}'}Changed\`;
export type PublicMetrics<T> = { [K in keyof T as \`metric_${'${Extract<K, string>}'}\`]: T[K] };
` },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [templateTypes, mapped],
    interview: { question: '템플릿 리터럴 타입을 통한 동적 생성 대신 명시적인 유니온 타입을 선택해야 하는 상황은 언제인가요?', answer: '타입 조합의 수가 커져 컴파일 속도가 저하되거나 에러 메시지가 지나치게 복잡해지는 경우, 또는 외부 공개 API 스펙에서 허용되는 이벤트 목록을 사람이 명확히 검토해야 하는 경우입니다.', points: ['타입 자동 추론이 주는 DX 편의성', '조합 수 폭발에 따른 타입 체커 계산 비용', '명시적 유니온 타입을 통한 스펙 검증의 이점'] },
  }),
  make({
    id: 'ts30.brand-at-boundary', chapter: 5, order: 30,
    title: '선택 심화: 검증을 통과한 식별자에 브랜드 타입(Branded Type) 부여하기', navTitle: '선택: branded ID',
    summary: 'unknown 타입으로 입력된 주문 ID를 접두사 및 정수 포맷 규칙으로 검증한 후 OrderId 브랜드 타입을 부여하여, UserId 등 다른 ID와 뒤섞여 발생하는 실수를 컴파일 타임에 차단합니다.',
    story: '주문 조회 함수 매개변수에 실수로 유저 ID 문자열을 전달했으나, 둘 다 일반 string 타입이라 컴파일러가 이를 잡아내지 못했습니다. 데이터가 입력되는 런타임 경계 검증 통과 시점에 전용 브랜드를 부여하여 ID 간의 혼용을 차단하되, 해당 데이터가 실제 DB에 존재하는지까지 보장하는 것으로 오해하지 않도록 범위를 한정합니다.',
    concept: [
      '브랜드 타입(Branded Type)은 일반 primitive 타입(예: string)에 고유한 심볼 태그를 교차(Intersection)시켜, 동일한 primitive 구조를 갖는 다른 식별자 간의 임의 대입을 방지하는 패턴입니다. 이 태그는 런타임에 자동 생성되지 않으므로, 검증 함수를 통과한 직후 단언(Assertion) 형태로 부여하는 것이 일반적입니다.',
      '본 레슨은 문자열 식별자 오용 위험이 높은 프로젝트를 위한 선택 심화 과정입니다. 타입 시스템상 포맷 검증을 통과했더라도, 그것이 실제 DB 상에 해당 레코드가 존재한다거나 접근 권한이 있음을 보증하는 것은 아닙니다.',
    ],
    workedExample: {
      title: '완성 예시: 검증을 통과한 문자열에만 브랜드 타입 부여하기',
      code: 'declare const userIdBrand: unique symbol;\ntype UserId = string & { readonly [userIdBrand]: "UserId" };\n\nfunction toUserId(value: string): UserId {\n  if (!/^user_[1-9]\\d*$/.test(value)) throw new Error("잘못된 사용자 ID");\n  return value as UserId;\n}',
      result: ['"user_" 뒤에 선행 0이 없는 양의 정수가 오는지 확인한 뒤 UserId 타입을 부여합니다.', '일반 string은 UserId가 필요한 곳에 넣을 수 없습니다. UserId는 string의 하위 타입이므로 string을 받는 곳에는 전달할 수 있습니다.'],
    },
    mission: 'toOrderId 함수가 unknown 값을 받아 "ord_" 뒤에 선행 0이 없는 양의 정수가 오는지 검사하게 만드세요. 검사를 통과하면 OrderId 타입을 반환하고, 나머지는 오류로 처리하세요.',
    goals: ['검증되지 않은 임의의 런타임 지점에서 브랜드 단언을 남발하지 않는다.', '브랜드 타입이 정적으로 보장해 주는 포맷 검증과, 런타임에 보장해야 하는 데이터 존재/권한 영역을 구분한다.'],
    hints: ['전달받은 value 매개변수가 string 타입인지 먼저 검사하세요.', '정규 표현식 `/^ord_[1-9]\\d*$/`를 사용해 전체 문자열 포맷 규칙을 확인하세요.', '모든 런타임 검증 조건을 통과한 마지막 단 한 곳에서만 `as OrderId`로 단언을 적용하세요.'],
    explanation: ['OrderId와 UserId가 서로 다른 브랜드 타입으로 분리되면, 두 값이 모두 자바스크립트의 string일지라도 컴파일 타임에 서로 교차 할당될 수 없어 식별자 혼용 사고를 방지할 수 있습니다.', '브랜드 타입은 데이터베이스의 외래 키(FK) 검증이나 사용자 인가 검사를 대신해주지 않습니다. 실제 레코드의 존재 여부와 접근 권한은 레포지토리 레이어 및 인가 로직 경계에서 별도로 다루어야 합니다.'],
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
    interview: { question: 'OrderId 브랜드 타입을 성공적으로 부여받았다면, 해당 주문 데이터의 실존 및 접근 권한까지 보장된다고 볼 수 있나요?', answer: '아니요. 브랜드 타입 변환기는 정해진 문자열 포맷 규격만 보장합니다. 실제 데이터의 DB 존재 여부는 저장소(Repository) 조회로, 접근 권한은 별도의 인가(Authorization) 로직으로 검증해야 합니다.', points: ['문자열 포맷의 정적 검증 보장', 'DB 존재 여부 미보장', '사용자 인가 권한 미보장'] },
  }),
];
