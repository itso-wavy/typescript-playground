# TypeScript Learning Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 개인 소유자만 사용하는 React 학습 사이트에서 선택 진단 4개와 제네릭·중고급·실무 중심 36개 TypeScript 과제를 실제 검사·실행하고 Supabase에 학습 기록을 동기화한다.

**Architecture:** React + Vite 정적 화면과 Node HTTP 검사 API를 같은 출처로 제공한다. 서버는 최신 TypeScript CLI로 타입 검사·출력만 수행하고 사용자 JavaScript는 실행하지 않는다. 브라우저의 opaque-origin iframe 안 Worker에서 번들된 코드를 실행하고 시간 제한으로 중단하며, React 과제는 사전 제공된 React 런타임으로 HTML을 생성해 script 없는 별도 preview에 표시한다. Supabase가 이메일 인증과 RLS/CAS 기반 기록 동기화를 담당한다.

**Tech Stack:** Node 24, TypeScript 7.0.2, React 19.2.8, Vite, Supabase JS, esbuild(학습 코드 및 React 런타임 번들), Vitest, React Testing Library, Playwright. 최신 안정 버전은 설치 시 공식 registry에서 확인하고 lockfile로 고정한다. 에디터는 접근 가능한 textarea로 시작하며 외부 IDE 엔진을 추가하지 않는다.

**Spec:** `docs/superpowers/specs/2026-09-07-typescript-learning-design.md` — 특히 개정된 13번이 교육 범위의 기준이다.

## Global Constraints

- React로 사이트를 구현한다. 첫 학습 과정은 TypeScript다.
- 설명과 실습은 한 화면에 배치한다. 다섯 단계의 마법사를 반복하지 않는다.
- 면접 복습은 챕터 끝에서 선택적으로 제공한다. 서술 답변을 AI로 채점하지 않는다.
- 공식 문서와 최신 안정 버전을 기준으로 교육 내용을 작성한다.
- 본과정은 8 + 8 + 6 + 6 + 4 + 4 = 36개다. 선택 진단은 수료 분모에 포함하지 않는다.
- 생성된 사용자 코드를 서버에서 실행하지 않는다.
- 사용자에게 비밀키를 채팅으로 요청하지 않는다.
- 사용자가 Supabase 프로젝트를 아직 만들지 않았으며 실제 연결은 구현 후 진행한다고 명시했다. 라이브 연결 검증을 모의 테스트로 대체했다고 주장하지 않는다.
- 추가 학습 기술·유료 가입·공개 배포·외부 메시지는 현재 작업에 포함하지 않는다.
- 구현은 gpt-5.6-terra 또는 gpt-5.6-luna의 하위 모델 에이전트가 수행한다. Astra는 계획·조정·검증, Sol은 설계 검토를 맡는다.
- 신규 프로젝트 폴더를 그대로 사용한다. 다른 사용자 프로젝트를 수정하지 않는다. 에이전트는 자신의 파일만 수정하고 다른 작업자의 변경을 되돌리지 않는다.

## Delivery and dependency order

T1 계약과 실행 가능한 기초 → T2 검사/브라우저 실행, T3 인증/동기화, T4 UI → T5/T6 콘텐츠 → T7 통합 검증 → T8 온라인 연결 준비.

서로 다른 파일의 작업만 병렬 수행한다. T1의 공유 계약을 바꾸려면 조정자에게 보고한다. 패키지 manifest와 lockfile은 T1 담당자가 소유하고 이후 추가는 조정한다. 검증은 실제 실행 결과를 기록한다. 실패·제약을 완료로 표시하지 않는다.

## Shared contracts

T1은 아래를 `src/shared/contracts.ts`에 정의한다. 클라이언트에 제공되는 Lesson은 해설을 포함할 수 있지만 서버 전용 fixture는 별도 모듈이다.

```ts
export type FileMap = Record<string, string>;
export type LessonKind = 'practice' | 'diagnostic';
export type RunMode = 'typecheck' | 'runtime' | 'react';
export interface SourceLink { title: string; url: string }
export interface Lesson {
  id: string; chapter: number; order: number; kind: LessonKind;
  title: string; summary: string; story: string; concept: string[];
  mission: string; goals: string[]; hints: string[]; explanation: string[];
  starter: FileMap; solution: FileMap; editableFiles: string[];
  mode: RunMode; sources: SourceLink[]; checkedAt: string;
  compilerVersion: string; revision: number; minutes: number;
  interview?: { question: string; answer: string; points: string[] };
}
export interface Diagnostic {
  file: string; line: number; column: number; code: number; message: string;
}
export interface CheckRequest {
  lessonId: string; files: FileMap; requestId: string; codeRevision: number;
}
export interface CheckResult {
  requestId: string; lessonId: string; codeRevision: number;
  status: 'ready' | 'type-error' | 'contract-error' | 'system-error';
  diagnostics: Diagnostic[]; checks: {name: string; passed: boolean}[];
  bundle?: string; compilerVersion: string; message?: string;
}
export interface RuntimeResult {
  status: 'passed' | 'failed' | 'timeout';
  checks: {name: string; passed: boolean}[]; logs: string[];
  html?: string; error?: string;
}
export interface LessonProgress {
  lessonId: string; lessonRevision: number; files: FileMap;
  version: number; completedAt: string | null; completedCode: string | null;
  note: string; updatedAt: string;
}
export type SaveResult =
  | {status: 'saved'; progress: LessonProgress}
  | {status: 'conflict'; remote: LessonProgress}
  | {status: 'offline'; message: string};
```

서버 fixture 계약 타입 in `server/curriculum/types.ts`:

```ts
import type {FileMap} from '../../src/shared/contracts.js';
export interface LessonFixture {
  lessonId: string;
  typeTests: string; // trusted .ts/.tsx contract imports './index'
  runtimeTests?: string; // trusted async code appended to learner bundle
  alternatives: FileMap[];
  invalid: {name: string; files: FileMap}[];
  compilerOptions?: {exactOptionalPropertyTypes?: boolean; verbatimModuleSyntax?: boolean};
}
```

Type contracts assert positive assignments and negative cases with trusted `@ts-expect-error`. Learner files cannot suppress diagnostics. Tests must reject `any` when it defeats the objective using `IsAny<T> = 0 extends (1 & T) ? true : false` and multiple invocation contracts. No source equality grading. Advanced TypeScript cannot be exhaustively certified by finite tests; do not market tests as proof of total correctness.


Runtime fixture contract: `runtimeTests` is JavaScript async function BODY. It receives in-scope `learner` (entry module exports), `check(name: string, passed: boolean)` (records check), `render(element)` (React static HTML helper), and `setHtml(html: string)` (records bounded snapshot). Example: `check("첫 값", learner.first([1,2]) === 1); check("빈 목록", learner.first([]) === undefined);`. TSX runtime tests use `learner` exported demo/React element; no TypeScript syntax inside runtimeTests. Server bundles these trusted helpers, calls fixture body with explicit capabilities, and returns RuntimeResult via a trusted capture. Learner cannot select fixture, compiler config or mode. `typeTests` is trusted TS/TSX text importing `./index.js`; server resolves to lesson index.ts or index.tsx. Each lesson provides one of these entries. Runtime bundle executes entry module in Worker only. `mode=typecheck` needs no bundle and passes only when all compiler contracts pass. Chapter fixture files export `fixtures`, client chapters export `lessons`.
### Task 1: Foundation and first working type contract

**Files:** create `package.json`, `package-lock.json`, `.gitignore`, `.env.example`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/shared/contracts.ts`, `server/curriculum/types.ts`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `tests/contracts.test.ts`.
**Interfaces:** produces shared contracts above and npm scripts `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:curriculum`, `test:e2e`.

- [ ] Create a branch in the new repository, and add project dependencies with exact installed versions. Keep credentials, dist, caches, reports ignored; include `.env.example` with variable names and blank values.
- [ ] Write and run a first contract test using Vitest. Runtime schema guards reject a missing lessonId, traversal path, unknown file, files above 64KiB total; use tests below as a baseline.
```ts
expect(validateCheckRequest({lessonId: 'g01', files: {'../secret.ts': 'x'}, requestId:'a', codeRevision:1})).toBe(false);
expect(validateCheckRequest({lessonId: 'g01', files: {'index.ts':'export {}'}, requestId:'a', codeRevision:1})).toBe(true);
```
- [ ] Implement `validateCheckRequest(value: unknown): value is CheckRequest` in `src/shared/validation.ts`; file keys are relative ASCII segments with .ts/.tsx/.d.ts suffix, no dot segments, and further narrowed by lesson editableFiles in T2.
- [ ] Render a minimal React entry so `npm run build` and `npm run typecheck` pass. This is integration scaffolding, not the final UI.
- [ ] Record installed versions with `npm ls --depth=0`. Commit only owned files using Lore intent and Tested trailers.

### Task 2: Compiler and isolated browser runner

**Files:** create `server/check.ts`, `server/source-policy.ts`, `server/index.ts`, `server/bundle.ts`, `src/runner/browser-runner.ts`, `src/runner/runner-document.ts`, `tests/check.test.ts`, `tests/runner.spec.ts`.
**Interfaces:** consumes CheckRequest and LessonFixture; exports `checkLesson(request: CheckRequest): Promise<CheckResult>` and `runBundle(bundle: string, signal?: AbortSignal): Promise<RuntimeResult>`.

- [ ] Write failing tests for a semantic type mismatch, alternate correct generic function, empty source, malformed Unicode import, path traversal, external URL import, triple-slash reference, suppressed diagnostics, runtime loop, and learner fetch/storage access.
```ts
const result = await checkLesson({lessonId:'g01', files:{'index.ts':'export function first<T>(items:T[]):T|undefined{return items[0]}'}, requestId:'one',codeRevision:1});
expect(result.status).toBe('ready');
expect(result.compilerVersion).toBe('7.0.2');
```
- [ ] Invoke pinned native `tsc` using spawn with an argument array, `shell:false`, fixed config, timeout 10s and 256KiB output ceiling. Each job gets a fresh bounded temp directory; cleanup checks the resolved path is within its task temp root. Never execute emitted code on Node.
- [ ] Validate learner imports/references with a proper parser or fail-closed tokenizer: only lesson fixture paths and fixed react/react-dom entries. No dynamic imports, external require, escaped import paths or triple-slash directives; no user tsconfig. If a parser dependency is needed, report the reason before adding it. Reject `@ts-ignore`/`@ts-nocheck`; trusted fixture `@ts-expect-error` is permitted. Do not confuse comments/strings with active syntax when selecting safe files.
- [ ] Typecheck source and trusted positive/negative contract. Type-error means learner diagnostic; contract-error means public goals unmet. Limit diagnostics and sanitize temp paths. Only trusted fixture may choose documented compiler options.
- [ ] Bundle emitted code and trusted runtime tests with esbuild; prebundle allowed React dependencies. SSR React output is acceptable for typing tasks: generated HTML appears in a scriptless iframe. Interactive DOM tasks require explicit browser tests, not fake return strings.
- [ ] In an iframe with `sandbox="allow-scripts"` and no same-origin, create a Blob Worker under restrictive inherited CSP (`default-src 'none'; connect-src 'none'; worker-src blob:` plus only the trusted inline bootstrap). The Worker has no DOM and an opaque origin. Execute learner bundle there; iframe controller terminates at 2 seconds. Cap logs at 100 and HTML at 64KiB. Parent validates event.source and per-run nonce; aborted/older runs are ignored.
- [ ] No test bypass in production: dev preview may bind loopback only with `LOCAL_PREVIEW=1`; production fails closed without Supabase URL/key and owner ID. Compiler API consumes authorization function produced by T3.
- [ ] Run `npm test -- tests/check.test.ts` and Playwright runner tests. Do not claim safe execution until actual fetch, IndexedDB, endless loop and forged parent-message cases have been tested in browser.
- [ ] Commit and report spec and security limitations explicitly.

### Task 3: Owner authentication and conflict-safe Supabase persistence

**Files:** create `src/auth/client.ts`, `src/auth/AuthGate.tsx`, `server/auth.ts`, `src/progress/repository.ts`, `src/progress/local-drafts.ts`, `src/progress/use-progress.ts`, `supabase/migrations/202609080001_progress.sql`, `supabase/tests/progress.sql`, `tests/progress.test.ts`, `tests/auth.test.ts`.
**Interfaces:** `authorize(token: string): Promise<{id:string}>`; repository `load(lessonId: string): Promise<LessonProgress|null>` and `save(progress: LessonProgress, expectedVersion: number): Promise<SaveResult>`; `AuthGate` supplies authenticated content or local-preview notice.

- [ ] Failing tests: missing/expired token, different valid user, first insert race, simultaneous edits, offline write, stale load after lesson switch, and logout with pending draft.
```ts
const [a,b] = await Promise.all([repo.save(draft,0),repo.save(otherDraft,0)]);
expect([a.status,b.status].sort()).toEqual(['conflict','saved']);
```
- [ ] Use Supabase default Magic Link via `signInWithOtp({email, options:{shouldCreateUser:false,emailRedirectTo}})`. Keep same-origin redirect and resend cooldown; use the default link template without custom SMTP. API validates bearer token with Supabase getUser(jwt), then compares configured owner UUID. Never trust client getSession as server authentication.
- [ ] Migration creates owner allowlist (not writable by authenticated users), lesson_progress, preferences and an authenticated save RPC. Enable RLS; policies require auth.uid equals row user_id and membership in owner allowlist. RPC checks auth.uid, locks row, compares revision, and returns saved/conflict. Concurrent insert uses unique(user_id,lesson_id) plus conflict resolution; no check-then-insert gap. Grant only necessary privileges; set safe search_path.
- [ ] Browser debounces saves; offline snapshot includes base version. On conflict keep both versions, show explicit choose remote/keep mine with comparison, resubmit chosen version using remote version. Never blindly overwrite on reconnect. Persistence failure is not lesson failure.
- [ ] Last visit and optional notes sync too. Completion from earlier code survives edits and a “수정 후 재검증 필요” state distinguishes current source. Do not auto-complete on reading solution.
- [ ] Actual Supabase service unavailable: deliver SQL authorization/CAS tests plus mocked transport tests and record live-test prerequisite without inventing a passing remote result.
- [ ] Run auth/progress tests and commit.

### Task 4: Learning UI and accessible monochrome design

**Files:** replace `src/App.tsx`, `src/styles.css`; create `src/learning/LessonPage.tsx`, `src/learning/Sidebar.tsx`, `src/learning/CodeEditor.tsx`, `src/learning/ResultPanel.tsx`, `src/learning/ReviewPanel.tsx`, `tests/learning.test.tsx`.
**Interfaces:** consumes Lesson[] exported by `src/curriculum/index.ts`, `checkLesson` via `/api/check`, runBundle, auth/progress modules. UI can be built with injected fixture props before transport integration; do not hardcode fake success.

- [ ] Write RTL tests for navigate-without-complete, diagnostic exclusion, solution-without-complete, stale result after edit, hints progressive disclosure, reset confirmation, optional chapter review skip, keyboard access.
```tsx
await user.click(screen.getByRole('button',{name:'다음 실습'}));
expect(screen.getByText('0 / 36')).toBeVisible();
```
- [ ] Apply white #fff, ink #141414, muted #707070, gray #f3f3f3; no shadow, black pill CTA, 24px editor/results corners, 16px small inputs, system Korean sans and monospace code. The large learning heading and editor are the visual center. No marketing landing or unrelated dashboard.
- [ ] Desktop sidebar 256px; content width around 900px; at <=760px drawer with labelled toggle, Escape close and restored focus. At 360px no page overflow. Use CSS grid minmax(0,1fr) and textarea internal scroll.
- [ ] Provide file tabs, line numbers alongside textarea, Ctrl/Meta+Enter run, ordinary Tab focus exit (no keyboard trap), live status, 44px targets, visible focus. Explain type errors in Korean while preserving original diagnostic code.
- [ ] Persist URL lesson selection, safe fallback for missing ID, last lesson resume; do not auto-advance on success. Header progress excludes D1-D4. Completion page links back to weak chapters.
- [ ] Preview mode clearly states device-local storage and missing cloud connection. Production AuthGate is mandatory. Settings needed by the learner remain separate from deployment details.
- [ ] Run RTL and browser at 1440x1000 and 390x844; save screenshots and visual-verdict JSON before further visual edits. Commit.

### Task 5: Diagnostics and curriculum lessons 1–16

**Files:** create `src/curriculum/diagnostics.ts`, `src/curriculum/generics.ts`, `src/curriculum/transforms.ts`, `server/curriculum/diagnostics.ts`, `server/curriculum/generics.ts`, `server/curriculum/transforms.ts`, `tests/curriculum-first.test.ts`.
**Interfaces:** each client module exports `lessons: Lesson[]`; each server module exports `fixtures: LessonFixture[]`. IDs d1–d4, g01–g08, t09–t16; order matches design 13.3. chapter 0/1/2, diagnostics kind diagnostic; revision1.

- [ ] Read spec13.3 and primary official docs linked in 13.5. Write complete Korean lessons, not title-only placeholders. Each has 2–3 sentence situation, focused concept paragraphs, public contract, starter, 3 hints, complete solution, explanation, official URL, date and compiler version.
- [ ] Fixture tests should first fail on starter and representative invalid variants, then pass solution and at least one different valid implementation. Type-only questions need actual assignments and rejection cases, not matching text.
```ts
type IsAny<T> = 0 extends (1 & T) ? true : false;
type Assert<T extends true> = T;
const numeric: number | undefined = first([1,2]);
const textual: string | undefined = first(['a']);
type NoAny = Assert<IsAny<ReturnType<typeof first<number>>> extends false ? true : false>;
// @ts-expect-error
const wrong: boolean = first([1]);
```
- [ ] Keep beginners’ basics in optional diagnosis. Goals must fit code provided. Generic extends guarantees minimum shape, not identity; teach empty arrays and inference honestly. No identity-function repetition throughout chapter.
- [ ] Add optional reflection at each chapter end with sample answer and self-check points; never grade prose. Include advanced reference explanations required by spec13.4.
- [ ] Run `npm run test:curriculum -- --chapter=0,1,2` when runner exists; before that run content shape tests only and report fixture compilation as pending. Commit owned files.

### Task 6: Curriculum lessons 17–36 and catalogue

**Files:** create `src/curriculum/boundaries.ts`, `src/curriculum/react.ts`, `src/curriculum/integration.ts`, `src/curriculum/capstone.ts`, matching `server/curriculum/*.ts`, `src/curriculum/index.ts`, `server/curriculum/index.ts`, `tests/curriculum-rest.test.ts`.
**Interfaces:** same Lesson/LessonFixture; IDs b17–b22, r23–r28, p29–p32, c33–c36. Catalogue exports `lessons` and `fixtures` respectively, importing all modules; no renderer in content.

- [ ] Author complete lessons and fixtures per spec13.3. The capstone edits a supplied multi-file project in four stages. A user navigating directly to a stage receives a valid starter without needing prior stage completion; continuing a stage may reuse verified compatible files.
- [ ] Unknown external response must be validated before conversion. Include malformed/null/error variants and IDs accidentally swapped. Do not teach fetch<T> or declaration files as runtime guarantees.
- [ ] TSX exercises use supplied React/types and correct exports. Assert forbidden props and callback value mismatch, plus SSR output or trusted component behavior checks where relevant. Modules/settings lessons run genuine multi-file compiler checks under server-controlled options.
- [ ] Catalogue shape tests assert 4 diagnostics, 36 core, unique IDs, expected chapter distribution, at least one valid primary source per lesson, all starter editable paths exist, no empty content or missing fixture.
```ts
expect(lessons.filter(x=>x.kind==='practice')).toHaveLength(36);
expect(new Set(lessons.map(x=>x.id)).size).toBe(40);
expect(fixtures.map(x=>x.lessonId).sort()).toEqual(lessons.map(x=>x.id).sort());
```
- [ ] Run chapter fixtures and catalogue tests. Commit owned files and report any lessons exceeding a short focused task.

### Task 7: Integration, real browser verification and review

**Files:** create `playwright.config.ts`, `tests/e2e/learning.spec.ts`, `tests/e2e/runner-security.spec.ts`, `scripts/verify-curriculum.mjs`, update only concrete integration faults with owner coordination.
**Interfaces:** all previously defined contracts must agree; no duplicate implementations.

- [ ] Run all trusted type fixtures through pinned compiler: solution and alternate pass; starter/invalid fail according to lesson expectations. Runtime fixtures execute in browser, not Node. React HTML tests prove actual React rendering. Never mark content verified solely because JSON fields exist.
- [ ] Run lint, typecheck, unit, build. Then browser tests for editing→type failure→valid solution→completion→reload; file tabs; last lesson; optional review; diagnostic denominator; stale result; 360px viewport and keyboard.
- [ ] Verify native compiler process timeout and browser Worker infinite-loop termination; browser fetch/WebSocket/import/IndexedDB/parent-message cases fail closed. Production server without auth configuration refuses private APIs. Correct owner and wrong owner tests cover both server and SQL policies.
- [ ] Subagent task reviewer reports both spec compliance and code quality using an actual diff and test report. Fix important findings with implementer then scoped re-review. Final broad review uses Astra, per skill.
- [ ] Store screenshots and `docs/verification.md` with exact commands and results. Review requested design, current lesson content and limitations. Do not label real Supabase RLS or deployment tested unless connected and exercised.

### Task 8: Connection and deployment preparation

**Files:** create `README.md`, `.env.example`, `Dockerfile`, `.dockerignore`, `docs/deployment.md`.
**Interfaces:** `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `OWNER_USER_ID`, `APP_ORIGIN`, `PORT`; server exposes only safe public config through `/api/config`. `LOCAL_PREVIEW=1` works only on loopback with explicit banner; deployment disables it.

- [ ] Provide actual local setup/build/start commands and script descriptions. Document lesson authoring and fixture verification. Explain local unsynced preview honestly.
- [ ] Prepare non-root production container, serve same-origin app/API, limit job concurrency and size, avoid placing credentials in compiler child environment. If compiler sandbox host isolation cannot be verified locally (Docker is not currently installed), record this and do not deploy unsafe API.
- [ ] Document Supabase migration application, owner provisioning/allowlist, Magic Link email and signup disabled, redirect URL configuration, env wiring, private access smoke test, backup/conflict behavior. SQL examples use configuration variables, not fake secrets.
- [ ] User has deferred creating Supabase until implementation. Finish all local testable work, then report precisely which live checks require connection. No chargeable resource creation or public publishing.

## Self-review checklist (controller)

- [ ] Spec1–5 UI/learning/design map to T4–T6; spec6–8 compiler/security map to T2/T7; spec9 persistence maps T3; spec13 maps every one of 40 entries to T5/T6.
- [ ] Check interface exports are identical across tasks, especially filenames and runtime result shapes.
- [ ] Search placeholders; examples with invalid learner answers are deliberate educational fixtures, not unfinished implementation.
- [ ] Limit claims: offline/local verification is not online synchronization or deployed security validation.

