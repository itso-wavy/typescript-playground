import type { LessonFixture } from './types.js';

const fixture = (lessonId: string, typeTests: string, alternatives: LessonFixture['alternatives'], invalid: LessonFixture['invalid']): LessonFixture => ({ lessonId, typeTests, alternatives, invalid });

export const fixtures: LessonFixture[] = [
  fixture('t09', `import { environments } from './index.js';
const app: 'production' = environments.app;
const preview: 'development' = environments.preview;
// @ts-expect-error staging is not permitted
const invalid: 'staging' = environments.app;`, [{ 'index.ts': 'export const environments = { app: "production", preview: "development" } satisfies Record<string, "development" | "production">;\n' }], [{ name: 'invalid environment value', files: { 'index.ts': 'export const environments = { app: "production", preview: "staging" } as const satisfies Record<string, "development" | "production">;\n' } }]),
  fixture('t10', `import type { UpdateProfile } from './index.js';
const display: UpdateProfile = { displayName: 'Han' };
const empty: UpdateProfile = {};
// @ts-expect-error server-owned id cannot be patched
const invalid: UpdateProfile = { id: 'other' };`, [{ 'index.ts': 'export interface Profile { id: string; displayName: string; bio: string; createdAt: string; role: "user" | "admin" } export type UpdateProfile = Partial<Omit<Pick<Profile, "id" | "displayName" | "bio">, "id">>;\n' }], [{ name: 'allows server-owned fields', files: { 'index.ts': 'export interface Profile { id: string; displayName: string; bio: string; createdAt: string; role: "user" | "admin" } export type UpdateProfile = Partial<Profile>;\n' } }]),
  fixture('t11', `import type { FieldErrors } from './index.js';
type Form = { email: string; age: number };
const errors: FieldErrors<Form> = { email: ['형식이 아닙니다'] };
const none: FieldErrors<Form> = {};
// @ts-expect-error unknown field
const invalid: FieldErrors<Form> = { password: ['없음'] };`, [{ 'index.ts': 'export type FieldErrors<T> = { [K in keyof T]?: readonly string[] };\n' }], [{ name: 'requires every field', files: { 'index.ts': 'export type FieldErrors<T> = { [K in keyof T]: string[] };\n' } }]),
  fixture('t12', `import type { PublicMetrics } from './index.js';
type Input = { clicks: number; active: boolean };
const metrics: PublicMetrics<Input> = { metric_clicks: 1, metric_active: true };
// @ts-expect-error unprefixed key is hidden
const invalid: PublicMetrics<Input> = { clicks: 1, metric_active: true };`, [{ 'index.ts': 'export type PublicMetrics<T> = { [K in keyof T as `metric_${K & string}`]: T[K] };\n' }], [{ name: 'keeps internal keys', files: { 'index.ts': 'export type PublicMetrics<T> = { [K in keyof T]: T[K] };\n' } }]),
  fixture('t13', `import type { SearchResult, ById, Query, Document } from './index.js';
const one: SearchResult<ById> = { id: 'd1', title: 'one' };
const many: SearchResult<Query> = [{ id: 'd1', title: 'one' }];
// @ts-expect-error id lookup returns one Document
const invalid: SearchResult<ById> = [{ id: 'd1', title: 'one' }];`, [{ 'index.ts': 'export type ById = { id: string }; export type Query = { query: string }; export type Document = { id: string; title: string }; export type SearchResult<T> = T extends { id: string } ? Document : Document[];\n' }], [{ name: 'always union result', files: { 'index.ts': 'export type ById = { id: string }; export type Query = { query: string }; export type Document = { id: string; title: string }; export type SearchResult<T> = Document | Document[];\n' } }]),
  fixture('t14', `import type { SuccessValue } from './index.js';
type User = { id: string };
type Value = SuccessValue<() => Promise<User>>;
const user: Value = { id: 'u1' };
// @ts-expect-error extracted value is not string
const invalid: Value = 'u1';
type NotPromise = SuccessValue<() => number>;
// @ts-expect-error non-Promise result maps to never
const neverValue: NotPromise = 1;`, [{ 'index.ts': 'export type SuccessValue<F> = F extends () => Promise<infer Value> ? Value : never;\n' }], [{ name: 'does not extract promise value', files: { 'index.ts': 'export type SuccessValue<F> = F extends () => Promise<unknown> ? unknown : never;\n' } }]),
  fixture('t15', `import type { PayloadOf, IsAllPayload } from './index.js';
type Events = { type: 'added'; payload: { id: string } } | { type: 'removed'; payload: number };
const objectPayload: PayloadOf<Events> = { id: 'a' };
const numericPayload: PayloadOf<Events> = 1;
const all: IsAllPayload<Events> = true;
// @ts-expect-error payload union does not include boolean
const invalid: PayloadOf<Events> = false;`, [{ 'index.ts': 'export type PayloadOf<T> = T extends { payload: infer P } ? P : never; export type IsAllPayload<T> = [T] extends [{ payload: unknown }] ? true : false;\n' }], [{ name: 'wraps payload in array', files: { 'index.ts': 'export type PayloadOf<T> = T extends { payload: infer P } ? P[] : never; export type IsAllPayload<T> = [T] extends [{ payload: unknown }] ? true : false;\n' } }]),
  fixture('t16', `import type { ChangeEvent } from './index.js';
type Model = { title: string; done: boolean };
const a: ChangeEvent<Model> = 'titleChanged';
const b: ChangeEvent<Model> = 'doneChanged';
// @ts-expect-error misspelled event
const invalid: ChangeEvent<Model> = 'titlesChanged';`, [{ 'index.ts': 'export type ChangeEvent<T> = `${keyof T & string}Changed`;\n' }], [{ name: 'accepts arbitrary event', files: { 'index.ts': 'export type ChangeEvent<T> = string;\n' } }]),
];
