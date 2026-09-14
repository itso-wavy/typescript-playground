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
    'ts07.function-contracts',
    `import { formatPrices } from './index.js';
${noAny}
const readonlyPrices = [1000, 2000] as const;
const all: string[] = formatPrices(readonlyPrices, (price, index) => index + ':' + price);
const one: string[] = formatPrices(readonlyPrices, price => price + '원', 1);
type NoAnyResult = Assert<IsAny<ReturnType<typeof formatPrices>> extends false ? true : false>;
// @ts-expect-error the formatter must return a string
formatPrices([1000], price => price * 2);
// @ts-expect-error prices are numbers
formatPrices(['1000'], price => String(price));`,
    [{ 'index.ts': 'export function formatPrices(prices: readonly number[], format: (price: number, index: number) => string, limit?: number): string[] { const output: string[] = []; const count = limit ?? prices.length; for (let index = 0; index < Math.min(count, prices.length); index += 1) output.push(format(prices[index]!, index)); return output; }\n' }],
    [
      { name: 'requires the optional limit', files: { 'index.ts': 'export function formatPrices(prices: readonly number[], format: (price: number, index: number) => string, limit: number): string[] { return prices.slice(0, limit).map(format); }\n' } },
      { name: 'ignores the requested limit', files: { 'index.ts': 'export function formatPrices(prices: readonly number[], format: (price: number, index: number) => string, limit?: number): string[] { return prices.map(format); }\n' } },
    ],
    `check('전체 가격 변환', learner.formatPrices([1000, 2000], value => value + '원').join(',') === '1000원,2000원');
check('개수 제한', learner.formatPrices([1000, 2000], value => String(value), 1).join(',') === '1000');
check('0개 경계', learner.formatPrices([1000], value => String(value), 0).length === 0);`,
  ),
  fixture(
    'ts08.generic-basics',
    `import { first, mapItems } from './index.js';
${noAny}
const numbers = [1, 2] as const;
const numeric: number | undefined = first(numbers);
const empty: string | undefined = first<string>([]);
const labels: string[] = mapItems([{ id: 1 }], item => '주문 ' + item.id);
const flags: boolean[] = mapItems(['a', ''], item => item.length > 0);
type FirstNoAny = Assert<IsAny<ReturnType<typeof first<number>>> extends false ? true : false>;
type FirstAllowsEmpty = Assert<undefined extends ReturnType<typeof first<number>> ? true : false>;
type MapNoAny = Assert<IsAny<ReturnType<typeof mapItems<number, string>>> extends false ? true : false>;
// @ts-expect-error projection returns strings
const wrong: number[] = mapItems([1], item => String(item));`,
    [{ 'index.ts': 'export const first = <T,>(items: readonly T[]): T | undefined => items.at(0);\nexport const mapItems = <T, U>(items: readonly T[], project: (item: T) => U): U[] => Array.from(items, project);\n' }],
    [
      { name: 'loses both relations with any', files: { 'index.ts': 'export function first(items: any[]): any { return items[0]; }\nexport function mapItems(items: any[], project: (item: any) => any): any[] { return items.map(project); }\n' } },
      { name: 'claims the first item always exists', files: { 'index.ts': 'export function first<T>(items: readonly T[]): T { return items[0]!; }\nexport function mapItems<T, U>(items: readonly T[], project: (item: T) => U): U[] { return items.map(project); }\n' } },
    ],
    `check('첫 원소', learner.first([3, 4]) === 3);
check('빈 배열', learner.first([]) === undefined);
check('서로 다른 결과 타입', learner.mapItems([1, 2], value => 'n' + value).join(',') === 'n1,n2');`,
  ),
  fixture(
    'ts09.generic-constraints',
    `import { cacheKey, selectField } from './index.js';
${noAny}
const key: string = cacheKey({ id: 'o1', total: 3000 });
const minimalKey: string = cacheKey({ id: 'u1' });
const name: string = selectField({ name: 'Wavy', age: 20 }, 'name');
const age: number = selectField({ name: 'Wavy', age: 20 }, 'age');
type SelectedNoAny = Assert<IsAny<ReturnType<typeof selectField<{ name: string }, 'name'>>> extends false ? true : false>;
// @ts-expect-error cache keys require a string id
cacheKey({ id: 1 });
// @ts-expect-error the key must exist on the record
selectField({ name: 'Wavy' }, 'missing');`,
    [{ 'index.ts': 'export const cacheKey = <T extends { id: string }>(item: T): string => `item:${item.id}`;\nexport const selectField = <T extends object, K extends keyof T>(record: T, key: K): T[K] => record[key];\n' }],
    [
      { name: 'accepts arbitrary keys and returns any', files: { 'index.ts': 'export function cacheKey(item: { id: string }): string { return "item:" + item.id; }\nexport function selectField(record: Record<string, any>, key: string): any { return record[key]; }\n' } },
      { name: 'requires a full order instead of the minimum id shape', files: { 'index.ts': 'export function cacheKey(item: { id: string; total: number }): string { return "item:" + item.id; }\nexport function selectField<T, K extends keyof T>(record: T, key: K): T[K] { return record[key]; }\n' } },
    ],
    `check('최소 id 제약', learner.cacheKey({ id: 'u1' }) === 'item:u1');
check('추가 필드 허용', learner.cacheKey({ id: 'o1', total: 3000 }) === 'item:o1');
check('선택한 필드 값', learner.selectField({ name: 'Wavy', age: 20 }, 'age') === 20);`,
  ),
  fixture(
    'ts10.generic-models',
    `import type { Page } from './index.js';
${noAny}
type User = { id: string; name: string };
type Order = { id: string; total: number };
const users: Page<User> = { items: [{ id: 'u1', name: 'Wavy' }] };
const orders: Page<Order> = { items: [{ id: 'o1', total: 3000 }], nextCursor: 'next' };
type UserItem = Page<User>['items'][number];
type UserItemNoAny = Assert<IsAny<UserItem> extends false ? true : false>;
const user: UserItem = users.items[0]!;
// @ts-expect-error item must match the Page argument
const wrong: Page<User> = { items: [{ id: 'o1', total: 3000 }] };`,
    [{ 'index.ts': 'export interface Page<T> { items: T[]; nextCursor?: string }\n' }],
    [
      { name: 'is not generic', files: { 'index.ts': 'export type Page = { items: unknown[]; nextCursor?: string };\n' } },
      { name: 'uses any for page items', files: { 'index.ts': 'export type Page<T> = { items: any[]; nextCursor?: string };\n' } },
    ],
  ),
  fixture(
    'ts11.utility-update-contract',
    `import type { EditableProfile, FieldErrors, UpdateProfile } from './index.js';
const editable: EditableProfile = { displayName: 'Wavy', bio: '개발자' };
const nameOnly: UpdateProfile = { displayName: 'Wavy' };
const empty: UpdateProfile = {};
const errors: FieldErrors = { bio: ['소개를 입력하세요'] };
if (errors.bio) {
  // @ts-expect-error error lists are readonly
  errors.bio.push('추가 오류');
}
// @ts-expect-error server-owned id cannot be edited
const idPatch: UpdateProfile = { id: 'u2' };
// @ts-expect-error errors only use editable profile fields
const roleError: FieldErrors = { role: ['권한 오류'] };`,
    [{ 'index.ts': 'export interface Profile { id: string; displayName: string; bio: string; role: "user" | "admin"; createdAt: string }\nexport type EditableProfile = Omit<Profile, "id" | "role" | "createdAt">;\nexport type UpdateProfile = Partial<EditableProfile>;\nexport type FieldErrors = Partial<Record<keyof EditableProfile, readonly string[]>>;\n' }],
    [
      { name: 'allows every profile field to be patched', files: { 'index.ts': 'export interface Profile { id: string; displayName: string; bio: string; role: "user" | "admin"; createdAt: string }\nexport type EditableProfile = Profile;\nexport type UpdateProfile = Partial<Profile>;\nexport type FieldErrors = Partial<Record<keyof Profile, readonly string[]>>;\n' } },
      { name: 'accepts arbitrary mutable error fields', files: { 'index.ts': 'export interface Profile { id: string; displayName: string; bio: string; role: "user" | "admin"; createdAt: string }\nexport type EditableProfile = Pick<Profile, "displayName" | "bio">;\nexport type UpdateProfile = Partial<EditableProfile>;\nexport type FieldErrors = Record<string, string[]>;\n' } },
    ],
  ),
  fixture(
    'ts12.conditional-response',
    `import type { ById, Document, Query, SearchResult } from './index.js';
const one: SearchResult<ById> = { id: 'd1', title: '한 문서' };
const many: SearchResult<Query> = [{ id: 'd1', title: '첫 문서' }];
const document: Document = one;
// @ts-expect-error id lookup returns one document
const wrongOne: SearchResult<ById> = [{ id: 'd1', title: '한 문서' }];
// @ts-expect-error query lookup returns a document array
const wrongMany: SearchResult<Query> = { id: 'd1', title: '한 문서' };`,
    [{ 'index.ts': 'export type ById = { id: string }; export type Query = { query: string }; export type SearchRequest = ById | Query; export type Document = { id: string; title: string };\nexport type SearchResult<T extends SearchRequest> = T extends { id: string } ? Document : Document[];\n' }],
    [
      { name: 'always returns a broad union', files: { 'index.ts': 'export type ById = { id: string }; export type Query = { query: string }; export type SearchRequest = ById | Query; export type Document = { id: string; title: string };\nexport type SearchResult<T extends SearchRequest> = Document | Document[];\n' } },
      { name: 'reverses request result shapes', files: { 'index.ts': 'export type ById = { id: string }; export type Query = { query: string }; export type SearchRequest = ById | Query; export type Document = { id: string; title: string };\nexport type SearchResult<T extends SearchRequest> = T extends ById ? Document[] : Document;\n' } },
    ],
  ),
];
