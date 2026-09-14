import type { LessonFixture } from './types.js';

const fixture = (lessonId: string, typeTests: string, runtimeTests: string | undefined, alternatives: LessonFixture['alternatives'], invalid: LessonFixture['invalid']): LessonFixture => ({ lessonId, typeTests, runtimeTests, alternatives, invalid });
const noAny = `type IsAny<T> = 0 extends (1 & T) ? true : false; type Assert<T extends true> = T;`;

export const fixtures: LessonFixture[] = [
  fixture('g01', `import { first } from './index.js'; ${noAny}
const numeric: number | undefined = first([1, 2]);
const textual: string | undefined = first(['a']);
type NoAny = Assert<IsAny<ReturnType<typeof first<number>>> extends false ? true : false>;
// @ts-expect-error boolean is not the item type
const wrong: boolean = first([1]);`, `check('첫 값', learner.first([1, 2]) === 1); check('빈 목록', learner.first([]) === undefined);`, [{ 'index.ts': 'export const first = <T,>(items: readonly T[]): T | undefined => items.at(0);\n' }], [{ name: 'loses generic relation with any', files: { 'index.ts': 'export function first(items: any[]): any { return items[0]; }\n' } }, { name: 'claims nonempty result', files: { 'index.ts': 'export function first<T>(items: T[]): T { return items[0]; }\n' } }]),
  fixture('g02', `import { parseRow } from './index.js'; ${noAny}
const values: number[] = parseRow('1,2', Number);
const chosen: (number | null)[] = parseRow<number | null>('1,2', Number);
const words: string[] = parseRow('a,b', value => value.toUpperCase());
type NoAny = Assert<IsAny<ReturnType<typeof parseRow<number>>> extends false ? true : false>;
// @ts-expect-error parser output is number
const wrong: string[] = parseRow('1', Number);`, `check('행 변환', learner.parseRow('1,2', Number).join(':') === '1:2');`, [{ 'index.ts': 'export function parseRow<T>(text: string, parse: (value: string) => T): T[] { return text.split(",").map(value => parse(value)); }\n' }], [{ name: 'unknown parser result', files: { 'index.ts': 'export function parseRow(text: string, parse: (value: string) => unknown): unknown[] { return text.split(",").map(parse); }\n' } }]),
  fixture('g03', `import { mapItems } from './index.js'; ${noAny}
const labels: string[] = mapItems([{ id: 1 }], item => String(item.id));
const flags: boolean[] = mapItems(['x'], item => item.length > 0);
type NoAny = Assert<IsAny<ReturnType<typeof mapItems<number, string>>> extends false ? true : false>;
// @ts-expect-error projection returns string
const wrong: number[] = mapItems([1], item => String(item));`, `check('목록 변환', learner.mapItems([1, 2], value => value * 2).join(',') === '2,4');`, [{ 'index.ts': 'export const mapItems = <T, U>(items: readonly T[], project: (item: T) => U): U[] => Array.from(items, project);\n' }], [{ name: 'single generic result', files: { 'index.ts': 'export function mapItems<T>(items: T[], project: (item: T) => T): T[] { return items.map(project); }\n' } }]),
  fixture('g04', `import { cacheKey } from './index.js';
const userKey: string = cacheKey({ id: 'u1', name: 'Han' });
const orderKey: string = cacheKey({ id: 'o1', total: 3 });
// @ts-expect-error id is required
cacheKey({ name: 'missing' });`, `check('캐시 키', learner.cacheKey({ id: 'u1' }) === 'item:u1');`, [{ 'index.ts': 'export function cacheKey<T extends { id: string }>(item: T) { return "item:" + item.id; }\n' }], [{ name: 'reads property outside constraint', files: { 'index.ts': 'export function cacheKey<T extends { id: string }>(item: T) { return item.name; }\n' } }]),
  fixture('g05', `import { hasField } from './index.js';
const result: boolean = hasField({ id: 'u1', name: 'Han' }, 'name');
// @ts-expect-error missing key
hasField({ id: 'u1' }, 'name');`, `check('있는 필드', learner.hasField({ id: 'u1' }, 'id') === true); check('없는 필드', learner.hasField({ id: 'u1' }, 'name') === false);`, [{ 'index.ts': 'export const hasField = <T extends object, K extends keyof T>(record: T, key: K) => Object.prototype.hasOwnProperty.call(record, key);\n' }], [{ name: 'accepts arbitrary key', files: { 'index.ts': 'export function hasField<T extends object>(record: T, key: string): boolean { return key in record; }\n' } }]),
  fixture('g06', `import { getField } from './index.js'; ${noAny}
const name: string = getField({ name: 'Han', total: 1 }, 'name');
const total: number = getField({ name: 'Han', total: 1 }, 'total');
type NoAny = Assert<IsAny<ReturnType<typeof getField<{ name: string }, 'name'>>> extends false ? true : false>;
// @ts-expect-error key does not exist
getField({ name: 'Han' }, 'missing');`, `check('필드 값', learner.getField({ total: 3 }, 'total') === 3);`, [{ 'index.ts': 'export function getField<T extends object, K extends keyof T>(record: T, key: K): T[K] { return record[key]; }\n' }], [{ name: 'unknown return', files: { 'index.ts': 'export function getField<T extends object>(record: T, key: keyof T): unknown { return record[key]; }\n' } }]),
  fixture('g07', `import { emptyPage, type Page } from './index.js';
const words: Page = emptyPage();
const users: Page<{ id: string }> = { items: [{ id: 'u1' }], nextCursor: undefined };
// @ts-expect-error item does not match Page user type
const invalid: Page<{ id: string }> = { items: ['u1'], nextCursor: undefined };`, undefined, [{ 'index.ts': 'export type Page<T = string> = { items: T[]; nextCursor?: string }; export const emptyPage = (): Page => ({ items: [] });\n' }], [{ name: 'cursor always required', files: { 'index.ts': 'export type Page<T = string> = { items: T[]; nextCursor: string }; export function emptyPage(): Page { return { items: [], nextCursor: undefined }; }\n' } }]),
  fixture('g08', `import { sendChannel } from './index.js';
const sent: boolean = sendChannel('email');
// @ts-expect-error unsupported channel
sendChannel('sms');`, `check('email 전송', learner.sendChannel('email') === true); check('slack 전송', learner.sendChannel('slack') === true);`, [{ 'index.ts': 'export const sendChannel = (channel: "email" | "slack") => channel === "email" || channel === "slack";\n' }], [{ name: 'unnecessary broad generic', files: { 'index.ts': 'export function sendChannel<T>(channel: T): boolean { return Boolean(channel); }\n' } }]),
];
