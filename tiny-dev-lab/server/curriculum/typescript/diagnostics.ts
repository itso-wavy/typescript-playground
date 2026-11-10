import type { LessonFixture } from '../types.js';

const fixture = (lessonId: string, typeTests: string, alternatives: LessonFixture['alternatives'], invalid: LessonFixture['invalid'], runtimeTests?: string): LessonFixture => ({ lessonId, typeTests, alternatives, invalid, runtimeTests });

export const fixtures: LessonFixture[] = [
  fixture('d1', `import { releaseChannel } from './index.js';
const stable: 'stable' | 'beta' = releaseChannel('stable');
// @ts-expect-error unsupported channel
releaseChannel('preview');`, [{ 'index.ts': 'export const releaseChannel = (channel: "stable" | "beta") => channel;\nconst channel: "stable" = "stable"; releaseChannel(channel);\n' }], [{ name: 'widened let value', files: { 'index.ts': 'export function releaseChannel(channel: "stable" | "beta") { return channel; }\nlet channel = "stable"; releaseChannel(channel);\n' } }]),
  fixture('d2', `import { receipt, type Payment } from './index.js';
const card: Payment = { kind: 'card', last4: '1234' };
const bank: Payment = { kind: 'bank', bank: 'hana' };
const maybe: string | undefined = receipt(card);
const none: string | undefined = receipt(bank);`, [{ 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment): string | undefined { if (payment.kind !== "card") return undefined; return payment.last4; }\n' }], [{ name: 'union field before narrowing', files: { 'index.ts': 'export type Payment = { kind: "card"; last4: string } | { kind: "bank"; bank: string };\nexport function receipt(payment: Payment) { return payment.last4; }\n' } }], `check('card last4', learner.receipt({ kind: 'card', last4: '1234' }) === '1234'); check('bank has no receipt', learner.receipt({ kind: 'bank', bank: 'hana' }) === undefined);`),
  fixture('d3', `import { readTheme } from './index.js';
const ok: string | undefined = readTheme({ theme: 'dark' });
const missing: string | undefined = readTheme(null);`, [{ 'index.ts': 'export function readTheme(value: unknown): string | undefined { if (typeof value !== "object" || value === null) return undefined; const theme = (value as Record<string, unknown>).theme; return typeof theme === "string" ? theme : undefined; }\n' }], [{ name: 'unknown property access', files: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { return value.theme; }\n' } }, { name: 'unchecked assertion returns every value', files: { 'index.ts': 'export function readTheme(value: unknown): string | undefined { return (value as { theme?: string }).theme; }\n' } }], `check('theme string', learner.readTheme({ theme: 'dark' }) === 'dark'); check('null rejected', learner.readTheme(null) === undefined); check('non-string rejected', learner.readTheme({ theme: 1 }) === undefined);`),
  fixture('d4', `import { log, type Audit } from './index.js';
const event: Audit = { id: 'a1', action: 'save' };
const value: string = log(event);
// @ts-expect-error typo is not an Audit field
log({ id: 'a1', actoin: 'save' });`, [{ 'index.ts': 'export type Audit = { id: string; action: string }; export const log = ({ action }: Audit) => action;\n' }], [{ name: 'misspelled object key', files: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit) { return event.action; }\nlog({ id: "u1", actoin: "save" });\n' } }]),
];
