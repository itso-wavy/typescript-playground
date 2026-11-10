// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { lessons } from '../src/curriculum/index.js';

const script = resolve(process.cwd(), 'scripts/verify-curriculum-quality.mjs');
const goodFixture = JSON.parse(readFileSync(resolve('tests/fixtures/curriculum-quality/good-nextjs-project.json'), 'utf8'));

function project(moduleSource: string, indexSource = "export { lessons } from './sample.js';") {
  const directory = mkdtempSync(join(tmpdir(), 'curriculum-quality-'));
  mkdirSync(join(directory, 'src/curriculum'), { recursive: true });
  writeFileSync(join(directory, 'src/curriculum/sample.ts'), moduleSource);
  writeFileSync(join(directory, 'src/curriculum/index.ts'), indexSource);
  return spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' });
}

function practice(overrides = {}) {
  return { ...goodFixture.lessons[0], kind: 'practice', starter: { 'index.ts': '' }, solution: { 'index.ts': '' }, sources: [{ url: 'https://www.typescriptlang.org/docs/' }], ...overrides };
}

function course(lessonIds: string[], overrides = {}) {
  return {
    audience: {
      description: 'JavaScript로 함수와 객체를 작성해 봤고, 웹 프로젝트에서 타입 오류를 줄이려는 학습자입니다.',
      prerequisites: ['JavaScript 함수, 객체, 배열을 작성할 수 있다.', 'npm 프로젝트에서 파일을 열고 코드를 실행할 수 있다.'],
    },
    completionOutcomes: [
      '외부 API 응답을 검증한 뒤 앱에서 사용할 모델로 바꾼다.',
      '함수와 컴포넌트의 입력 및 결과 타입을 작성하고 잘못된 호출을 수정한다.',
      '컴파일 오류와 실행 결과를 보고 타입 설계의 문제를 설명한다.',
    ],
    flow: [{
      id: 'foundation', title: '기초 적용',
      rationale: '먼저 작은 함수에서 타입 오류를 고친 뒤 실제 프로젝트 데이터로 적용 범위를 넓힙니다.',
      outcomeRefs: [0, 1, 2], lessonIds,
    }],
    practicePlan: {
      minimum: lessonIds.length, maximum: lessonIds.length,
      rationale: '각 수료 목표를 새 코드와 오류 수정에서 한 번 이상 확인하는 데 필요한 실습 수입니다.',
      decision: 'approved',
    },
    ...overrides,
  };
}

function projectWithCourse(lessons: object[], courseValue: object) {
  return project(`export const lessons = ${JSON.stringify(lessons)}; export const course = ${JSON.stringify(courseValue)};`, "export { lessons, course } from './sample.js';");
}

describe('curriculum quality harness', () => {
  it('keeps the developer UX writing prompt connected to the harness documents', () => {
    const promptPath = resolve('docs/curriculum/developer-ux-writing-prompt.md');
    const prompt = readFileSync(promptPath, 'utf8');
    const standard = readFileSync(resolve('docs/curriculum/curriculum-quality-standard.md'), 'utf8');
    const workflow = readFileSync(resolve('docs/curriculum/harness-agent-workflow.md'), 'utf8');

    expect(prompt).toContain('문자열 값에는 반드시 따옴표');
    expect(prompt).toContain('코드 식별자를 문장에 쓸 때는 역할을 함께');
    expect(standard).toContain('developer-ux-writing-prompt.md');
    expect(workflow).toContain('developer-ux-writing-prompt.md');
  });

  it('rejects a course without a defined target learner', () => {
    const lessons = [practice({ id: 'p1' })];
    const result = projectWithCourse(lessons, course(['p1'], { audience: undefined }));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/대상 학습자/);
  });

  it('rejects a course without observable completion outcomes', () => {
    const lessons = [practice({ id: 'p1' })];
    const result = projectWithCourse(lessons, course(['p1'], { completionOutcomes: ['TypeScript를 이해한다.'] }));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/수료 후.*행동/);
  });

  it('rejects a flow that omits or repeats published practices', () => {
    const lessons = [practice({ id: 'p1' }), practice({ id: 'p2' })];
    const value = course(['p1', 'p1']);
    const result = projectWithCourse(lessons, value);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/p1.*중복/);
    expect(result.stderr).toMatch(/p2.*학습 흐름/);
  });

  it('rejects a completion outcome that no learning stage delivers', () => {
    const lessons = [practice({ id: 'p1' })];
    const value = course(['p1']);
    value.flow[0].outcomeRefs = [0, 1];
    const result = projectWithCourse(lessons, value);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/수료 목표 3.*학습 단계/);
  });

  it('rejects a course whose practice count falls outside its reviewed range', () => {
    const lessons = [practice({ id: 'p1' }), practice({ id: 'p2' })];
    const value = course(['p1', 'p2'], { practicePlan: { minimum: 3, maximum: 5, rationale: '세 가지 독립 수료 행동을 새 문제와 오류 수정 상황에서 각각 반복해서 확인해야 하는 과정입니다.', decision: 'approved' } });
    const result = projectWithCourse(lessons, value);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/실습 2개.*3~5개/);
  });

  it('rejects a practice-count decision that has not been reviewed', () => {
    const lessons = [practice({ id: 'p1' })];
    const value = course(['p1'], { practicePlan: { minimum: 1, maximum: 2, rationale: '수료 행동과 실습 수의 대응을 아직 검토해야 합니다.', decision: 'pending' } });
    const result = projectWithCourse(lessons, value);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/실습 수.*평가/);
  });

  it('accepts shared course criteria for a new technology stack', () => {
    const lessons = [practice({ id: 'p1' })];
    const result = projectWithCourse(lessons, course(['p1']));
    expect(result.status, result.stderr).toBe(0);
  });

  it('checks the same published IDs as the app and reports excluded diagnostics', () => {
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
    const report = JSON.parse(result.stdout.trim());
    expect(report.lessonIds.sort()).toEqual(lessons.map((lesson) => lesson.id).sort());
    expect(report.checkedLessons).toBe(36);
    expect(report.skippedDiagnostics).toBe(4);
    expect(report.course).toEqual({ practiceDecision: 'approved', practiceRange: [36, 36] });
  });

  it.each(['lesson', 'make'])('checks invalid content returned by %s helpers', (helper) => {
    const result = project(`const ${helper} = (data) => ({ ...data, kind: 'practice' }); export const lessons = [${helper}(${JSON.stringify(practice({ id: 'wrapped', summary: '짧음' }))})];`);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/wrapped.*요약/);
  });

  it('accepts valid helper content, but checks only the published subset', () => {
    const result = project(`const make = data => ({ ...data, kind: 'practice' }); export const lessons = [make(${JSON.stringify(practice({ id: 'published' }))}), make(${JSON.stringify(practice({ id: 'draft', summary: '' }))})]; export const course = ${JSON.stringify(course(['published']))};`, "import { lessons as all, course } from './sample.js'; export { course }; export const lessons = all.slice(0, 1);");
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).lessonIds).toEqual(['published']);
  });

  it('rejects duplicate IDs instead of reporting complete coverage', () => {
    const item = JSON.stringify(practice({ id: 'duplicate' }));
    const result = project(`export const lessons = [${item}, ${item}];`);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/duplicate.*중복/);
  });

  it('fails explicitly if a published lesson cannot be loaded', () => {
    const result = project('export const lessons = [missingLesson()];');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('missingLesson');
  });

  it.each(['https://typescriptlang.org.evil.example/docs', 'https://example.com/typescriptlang.org', 'https://typescriptlang.org@example.com/docs'])('rejects a misleading official source URL: %s', (url) => {
    const result = project(`export const lessons = [${JSON.stringify(practice({ id: 'source', sources: [{ url }] }))}];`);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/source.*공식 문서/);
  });
  it('accepts a curriculum fixture that follows the shared learning-content rules', () => {
    const fixture = resolve(process.cwd(), 'tests/fixtures/curriculum-quality/good-nextjs-project.json');

    const output = execFileSync(process.execPath, [script, '--fixture', fixture], { encoding: 'utf8' });

    expect(output).toContain('"status":"passed"');
  });

  it('rejects stack curricula that omit stack-specific required project steps', () => {
    const fixture = resolve(process.cwd(), 'tests/fixtures/curriculum-quality/missing-next-deployment.json');

    expect(() => execFileSync(process.execPath, [script, '--fixture', fixture], { encoding: 'utf8' })).toThrow(/Next\.js.*배포/);
  });

  it('rejects titles that present an arbitrary example function as the learning topic', () => {
    const fixture = resolve(process.cwd(), 'tests/fixtures/curriculum-quality/bad-example-name-title.json');

    expect(() => execFileSync(process.execPath, [script, '--fixture', fixture], { encoding: 'utf8' })).toThrow(/예제 이름이 학습 주제처럼/);
  });
});
