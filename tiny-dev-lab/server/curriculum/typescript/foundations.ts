import type { LessonFixture } from '../types.js';

const noAny = 'type IsAny<T> = 0 extends (1 & T) ? true : false; type Assert<T extends true> = T;';

function fixture(
  lessonId: string,
  typeTests: string,
  alternatives: LessonFixture['alternatives'],
  invalid: LessonFixture['invalid'],
  runtimeTests?: string,
): LessonFixture {
  return { lessonId, typeTests, alternatives, invalid, runtimeTests };
}

export const fixtures: LessonFixture[] = [
  fixture(
    'ts01.inference-literals',
    `import { environments, type Environment } from './index.js';
const app: 'production' = environments.app;
const preview: 'development' = environments.preview;
const allowed: Environment = environments.app;
// @ts-expect-error the configuration is readonly
environments.app = 'development';
// @ts-expect-error staging is outside Environment
const staging: 'staging' = environments.preview;`,
    [{ 'index.ts': 'export type Environment = "development" | "production";\nexport const environments = Object.freeze({ app: "production", preview: "development" }) satisfies Readonly<Record<"app" | "preview", Environment>>;\n' }],
    [
      { name: 'widens values and leaves configuration mutable', files: { 'index.ts': 'export type Environment = "development" | "production";\nexport const environments: Record<"app" | "preview", Environment> = { app: "production", preview: "development" };\n' } },
      { name: 'accepts an unsupported environment', files: { 'index.ts': 'export type Environment = "development" | "production";\nexport const environments = { app: "production", preview: "staging" } as const satisfies Record<"app" | "preview", Environment>;\n' } },
    ],
  ),
  fixture(
    'ts02.tuple-readonly',
    `import { nextPage, type PageCursor } from './index.js';
const start: PageCursor = [1, null];
const readonlyInput = [2, 'cursor-2'] as const;
const result: PageCursor = nextPage(readonlyInput, 'cursor-3');
const page: number = result[0];
const cursor: string | null = result[1];
// @ts-expect-error the first position is a number
const wrongPosition: PageCursor = ['1', null];
// @ts-expect-error page cursors cannot be mutated
start[0] = 2;`,
    [{ 'index.ts': 'export type PageCursor = Readonly<[page: number, nextCursor: string | null]>;\nexport const nextPage = (cursor: PageCursor, nextCursor: string | null): PageCursor => [cursor[0] + 1, nextCursor];\n' }],
    [
      { name: 'uses a mutable tuple', files: { 'index.ts': 'export type PageCursor = [page: number, nextCursor: string | null];\nexport function nextPage(cursor: PageCursor, nextCursor: string | null): PageCursor { return [cursor[0] + 1, nextCursor]; }\n' } },
      { name: 'returns the current page unchanged', files: { 'index.ts': 'export type PageCursor = readonly [page: number, nextCursor: string | null];\nexport function nextPage(cursor: PageCursor, nextCursor: string | null): PageCursor { return [cursor[0], nextCursor]; }\n' } },
    ],
    `const moved = learner.nextPage([1, null], 'cursor-2');
check('다음 페이지 번호', moved[0] === 2);
check('새 커서', moved[1] === 'cursor-2');
const ended = learner.nextPage([4, 'cursor-4'], null);
check('마지막 페이지 커서', ended[0] === 5 && ended[1] === null);`,
  ),
  fixture(
    'ts03.top-bottom-types',
    `import { assertNever, describeAction, parseJson, report } from './index.js';
${noAny}
type ParseIsNotAny = Assert<IsAny<ReturnType<typeof parseJson>> extends false ? true : false>;
const parsed: unknown = parseJson('{"type":"save"}');
const notify: (message: string) => void = report;
const stop: (value: never) => never = assertNever;
const saved: string = describeAction({ type: 'save' });
const cancelled: string = describeAction({ type: 'cancel' });
// @ts-expect-error unknown JSON must be checked before property access
parseJson('{}').type;`,
    [{ 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport const parseJson = (text: string): unknown => JSON.parse(text) as unknown;\nexport const report = (message: string): void => { console.log(message); };\nexport const assertNever = (value: never): never => { throw new Error("처리하지 않은 명령: " + JSON.stringify(value)); };\nexport function describeAction(action: OrderAction): string { if (action.type === "save") return "주문 저장"; if (action.type === "cancel") return "주문 취소"; return assertNever(action); }\n' }],
    [
      { name: 'returns any from the JSON boundary', files: { 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport function parseJson(text: string): any { return JSON.parse(text); }\nexport function report(message: string): void { console.log(message); }\nexport function assertNever(value: never): never { throw new Error(String(value)); }\nexport function describeAction(action: OrderAction): string { return action.type === "save" ? "주문 저장" : "주문 취소"; }\n' } },
      { name: 'forgets the cancel branch', files: { 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport function parseJson(text: string): unknown { return JSON.parse(text) as unknown; }\nexport function report(message: string): void { console.log(message); }\nexport function assertNever(value: never): never { throw new Error(String(value)); }\nexport function describeAction(action: OrderAction): string { if (action.type === "save") return "주문 저장"; return "알 수 없는 명령"; }\n' } },
    ],
    `check('JSON 결과', typeof learner.parseJson('{"ok":true}') === 'object');
check('저장 분기', learner.describeAction({ type: 'save' }) === '주문 저장');
check('취소 분기', learner.describeAction({ type: 'cancel' }) === '주문 취소');
let threw = false;
try { learner.assertNever('unexpected'); } catch { threw = true; }
check('never 종료 흐름', threw);`,
  ),
  fixture(
    'ts04.models-alias-interface',
    `import type { Entity, Order, OrderStatus, OrderUpdate } from './index.js';
const status: OrderStatus = 'draft';
const order: Order = { id: 'o1', itemName: '키보드', quantity: 1, status: 'confirmed' };
const entity: Entity = order;
const quantityOnly: OrderUpdate = { orderId: 'o1', quantity: 2 };
const statusOnly: OrderUpdate = { orderId: 'o1', status: 'draft' };
// @ts-expect-error unsupported order status
const badStatus: OrderStatus = 'paid';
// @ts-expect-error an Order extends Entity and needs id
const missingId: Order = { itemName: '키보드', quantity: 1, status: 'draft' };
// @ts-expect-error update status uses the same closed status union
const badUpdate: OrderUpdate = { orderId: 'o1', status: 'paid' };`,
    [{ 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = "draft" | "confirmed";\nexport interface Order extends Entity { itemName: string; quantity: number; status: OrderStatus }\nexport interface OrderUpdate { orderId: string; quantity?: number; status?: OrderStatus }\n' }],
    [
      { name: 'widens the status and omits the entity id', files: { 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = string;\nexport interface Order { itemName: string; quantity: number; status: string }\nexport type OrderUpdate = { orderId: string; quantity?: number; status?: string };\n' } },
      { name: 'requires every update field', files: { 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = "draft" | "confirmed";\nexport interface Order extends Entity { itemName: string; quantity: number; status: OrderStatus }\nexport type OrderUpdate = { orderId: string; quantity: number; status: OrderStatus };\n' } },
    ],
  ),
  fixture(
    'ts05.unions-narrowing',
    `import { receipt, type Payment, type PaymentResponse } from './index.js';
const card: Payment = { kind: 'card', last4: '1234' };
const bank: PaymentResponse = { kind: 'bank', bank: '우리은행', requestId: 'r1' };
const a: string = receipt({ ...card, requestId: 'r2' });
const b: string = receipt(bank);
const pending: string = receipt('결제 처리 중');
// @ts-expect-error tracked responses require requestId
const untracked: PaymentResponse = { kind: 'card', last4: '1234' };
// @ts-expect-error bank payments do not have last4
const wrong = bank.last4;`,
    [{ 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = (CardPayment | BankPayment) & { requestId: string };\nexport function receipt(value: PaymentResponse | string): string { if (typeof value === "string") return value; switch (value.kind) { case "card": return "카드 끝자리 " + value.last4; case "bank": return "계좌 이체 " + value.bank; } }\n' }],
    [
      { name: 'drops the request tracking contract', files: { 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = Payment;\nexport function receipt(value: PaymentResponse | string): string { if (typeof value === "string") return value; return value.kind === "card" ? "카드 끝자리 " + value.last4 : "계좌 이체 " + value.bank; }\n' } },
      { name: 'assumes every object is a card payment', files: { 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = Payment & { requestId: string };\nexport function receipt(value: PaymentResponse | string): string { if (typeof value === "string") return value; return "카드 끝자리 " + (value as CardPayment).last4; }\n' } },
    ],
    `check('처리 중 문자열', learner.receipt('결제 처리 중') === '결제 처리 중');
check('카드 영수증', learner.receipt({ kind: 'card', last4: '1234', requestId: 'r1' }) === '카드 끝자리 1234');
check('계좌 영수증', learner.receipt({ kind: 'bank', bank: '우리은행', requestId: 'r2' }) === '계좌 이체 우리은행');`,
  ),
  fixture(
    'ts06.structural-typing',
    `import { log, newAction, savedAction, type Audit } from './index.js';
const event = { id: 'e3', action: 'open', createdAt: 1700000001 };
const action: string = log(event);
const saved: string = savedAction;
const recent: string = newAction;
// @ts-expect-error a fresh object literal must contain action with the right spelling
log({ id: 'e4', actoin: 'close' });
const contract: Audit = { id: 'e5', action: 'close' };`,
    [{ 'index.ts': 'export interface Audit { id: string; action: string }\nexport const log = (event: Audit): string => event.action;\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", action: "cancel" });\n' }],
    [
      { name: 'keeps the misspelled fresh property', files: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit): string { return event.action; }\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", actoin: "cancel" });\n' } },
      { name: 'returns the id instead of the action', files: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit): string { return event.id; }\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", action: "cancel" });\n' } },
    ],
    `check('추가 필드가 있는 기존 객체', learner.savedAction === 'save');
check('올바른 새 객체 키', learner.newAction === 'cancel');
check('최소 Audit 구조', learner.log({ id: 'e3', action: 'open' }) === 'open');`,
  ),
];
