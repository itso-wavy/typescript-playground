import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import type { CheckRequest, CheckResult, Diagnostic, FileMap } from '../src/shared/contracts.js';
import { lessons } from '../src/curriculum/index.js';
import { fixtures } from './curriculum/index.js';
import { bundleRuntime } from './bundle.js';
import { assertSafeFiles, SourcePolicyError } from './source-policy.js';

const COMPILER_VERSION = '7.0.2';
const MAX_OUTPUT = 256 * 1024;
const COMPILER_TIMEOUT_MS = 10_000;
const MAX_JOBS = 2;
let inFlight = 0;
const queue: Array<() => void> = [];

async function withCompilerSlot<T>(work: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_JOBS) await new Promise<void>((resolve) => queue.push(resolve));
  inFlight += 1;
  try { return await work(); }
  finally { inFlight -= 1; queue.shift()?.(); }
}

function blankResult(request: CheckRequest, status: CheckResult['status'], message?: string): CheckResult {
  return { requestId: request.requestId, lessonId: request.lessonId, codeRevision: request.codeRevision, status, diagnostics: [], checks: [], compilerVersion: COMPILER_VERSION, message };
}

function diagnosticFromLine(line: string, directory: string): Diagnostic | undefined {
  const match = /^(.*)\((\d+),(\d+)\): error TS(\d+): (.*)$/.exec(line);
  if (!match) return undefined;
  const file = relative(directory, match[1]).replaceAll('\\', '/');
  return { file: file.startsWith('..') ? 'source.ts' : file, line: Number(match[2]), column: Number(match[3]), code: Number(match[4]), message: match[5].replaceAll(directory, '<lesson>') };
}

async function writeTree(root: string, files: FileMap): Promise<void> {
  for (const [relativePath, source] of Object.entries(files)) {
    const output = resolve(root, relativePath);
    if (!output.startsWith(`${root}${sep}`)) throw new Error('unsafe temporary path');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, source, 'utf8');
  }
}

async function typecheck(root: string, options: { exactOptionalPropertyTypes?: boolean; verbatimModuleSyntax?: boolean }): Promise<Diagnostic[]> {
  const config = {
    compilerOptions: {
      target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true,
      noUncheckedIndexedAccess: true, noEmit: true, skipLibCheck: true, jsx: 'react-jsx',
      noUnusedLocals: false, noUnusedParameters: false, allowJs: false,
      typeRoots: [resolve(process.cwd(), 'node_modules/@types')],
      exactOptionalPropertyTypes: options.exactOptionalPropertyTypes ?? false,
      verbatimModuleSyntax: options.verbatimModuleSyntax ?? false,
    },
    include: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
  };
  await writeFile(join(root, 'tsconfig.json'), JSON.stringify(config), 'utf8');
  const tsc = resolve(process.cwd(), 'node_modules/typescript/bin/tsc');
  const execution = await new Promise<{ output: string; code: number | null; signal: NodeJS.Signals | null; timedOut: boolean; startupError?: Error }>((resolveOutput) => {
    const child = spawn(process.execPath, [tsc, '--project', join(root, 'tsconfig.json'), '--pretty', 'false'], {
      cwd: root, shell: false,
      env: { PATH: process.env.PATH ?? '', TEMP: root, TMP: root, TMPDIR: root, NODE_OPTIONS: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const output: Buffer[] = [];
    let outputBytes = 0;
    const receive = (chunk: Buffer) => {
      if (outputBytes >= MAX_OUTPUT) return;
      const permitted = Math.min(chunk.byteLength, MAX_OUTPUT - outputBytes);
      output.push(chunk.subarray(0, permitted));
      outputBytes += permitted;
    };
    child.stdout.on('data', receive); child.stderr.on('data', receive);
    let timedOut = false;
    let settled = false;
    let forcedClose: NodeJS.Timeout | undefined;
    const settle = (result: { code: number | null; signal: NodeJS.Signals | null; startupError?: Error }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (forcedClose) clearTimeout(forcedClose);
      resolveOutput({ output: Buffer.concat(output).toString('utf8'), timedOut, ...result });
    };
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
      forcedClose = setTimeout(() => settle({ code: null, signal: 'SIGKILL' }), 1_000);
    }, COMPILER_TIMEOUT_MS);
    child.once('error', (error) => settle({ code: null, signal: null, startupError: error }));
    child.once('close', (code, signal) => settle({ code, signal }));
  });
  const diagnostics = execution.output.split(/\r?\n/).map((line) => diagnosticFromLine(line, root)).filter((value): value is Diagnostic => Boolean(value)).slice(0, 50);
  if (execution.timedOut) throw new Error('compiler timed out');
  if (execution.startupError) throw new Error(`compiler could not start: ${execution.startupError.message}`);
  if (execution.signal || execution.code === null) throw new Error('compiler exited unexpectedly');
  if (execution.code !== 0 && diagnostics.length === 0) throw new Error('compiler failed without parseable diagnostics');
  return diagnostics;
}

function assembleFiles(request: CheckRequest): { files: FileMap; editable: Set<string> } | SourcePolicyError {
  const lesson = lessons.find((candidate) => candidate.id === request.lessonId);
  if (!lesson) return new SourcePolicyError('lesson was not found');
  const editable = new Set(lesson.editableFiles);
  for (const path of Object.keys(request.files)) if (!editable.has(path)) return new SourcePolicyError(`file is not editable: ${path}`);
  if (Object.values(request.files).some((source) => source.trim() === '')) return new SourcePolicyError('empty source is not accepted');
  return { files: { ...lesson.starter, ...request.files }, editable };
}

/** Native TS 7 contract checker. Learner source is never executed by Node. */
export async function checkLesson(request: CheckRequest): Promise<CheckResult> {
  const fixture = fixtures.find((candidate) => candidate.lessonId === request.lessonId);
  if (!fixture) return blankResult(request, 'system-error', 'lesson fixture was not found');
  const assembled = assembleFiles(request);
  if (assembled instanceof SourcePolicyError) return blankResult(request, 'type-error', assembled.message);
  const packages = new Set(['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime']);
  if (Object.values(assembled.files).some((source) => /declare\s+module\s+['"]analytics['"]/.test(source))) packages.add('analytics');
  try { assertSafeFiles(request.files, packages); }
  catch (error) { return blankResult(request, 'type-error', error instanceof Error ? error.message : 'source policy rejected this code'); }

  return withCompilerSlot(async () => {
    const root = await mkdtemp(join(tmpdir(), 'tiny-dev-lab-check-'));
    try {
      const typeFiles = { ...assembled.files, 'contract.tsx': fixture.typeTests };
      await writeTree(root, typeFiles);
      const diagnostics = await typecheck(root, fixture.compilerOptions ?? {});
      if (diagnostics.length > 0) {
        const learnerPaths = new Set(Object.keys(request.files));
        const learnerDiagnostics = diagnostics.filter((diagnostic) => learnerPaths.has(diagnostic.file));
        const status = learnerDiagnostics.length > 0 ? 'type-error' : 'contract-error';
        return { ...blankResult(request, status), diagnostics: learnerDiagnostics.length > 0 ? learnerDiagnostics : diagnostics };
      }
      const result = blankResult(request, 'ready');
      result.checks = [{ name: '타입 계약', passed: true }];
      if (fixture.runtimeTests) result.bundle = await bundleRuntime(assembled.files, fixture.runtimeTests);
      return result;
    } catch (error) {
      return blankResult(request, 'system-error', error instanceof Error ? error.message.replaceAll(root, '<lesson>') : 'compiler failed');
    } finally {
      const temporaryRoot = resolve(root);
      const expectedBase = resolve(tmpdir());
      if (temporaryRoot.startsWith(`${expectedBase}${sep}`)) await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
}
