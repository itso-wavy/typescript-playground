import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

function chapterArgument(argumentsList) {
  const argumentsWithoutRun = argumentsList.filter((argument) => argument !== '--run');
  if (argumentsWithoutRun.length === 0) return undefined;
  if (argumentsWithoutRun.length === 2 && argumentsWithoutRun[0] === '--chapter' && /^\d+$/.test(argumentsWithoutRun[1])) return argumentsWithoutRun[1];
  throw new Error('Usage: npm run test:curriculum -- [--run] [--chapter <number>]');
}

let chapter;
try {
  chapter = chapterArgument(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}

function runPhase(name, command, argumentsList, env) {
  return new Promise((resolvePhase) => {
    const child = spawn(command, argumentsList, {
      cwd: process.cwd(),
      env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const collect = (chunk) => { output += chunk.toString(); };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', (error) => resolvePhase({ name, passed: false, output: `${output}${error.message}` }));
    child.on('exit', (code, signal) => resolvePhase({ name, passed: code === 0 && !signal, output }));
  });
}

function startViteServer() {
  const root = process.cwd();
  const child = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5181', '--strictPort'], {
    cwd: root,
    env: { ...process.env, LOCAL_PREVIEW: '1' },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const collect = (chunk) => { output += chunk.toString(); };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  return { child, output: () => output };
}

async function waitForServer(server) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) throw new Error(`Vite exited before becoming ready.\n${server.output()}`);
    try {
      const response = await fetch('http://127.0.0.1:5181/');
      if (response.ok) return;
    } catch { /* The process has not bound its port yet. */ }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error(`Vite did not become ready within 10 seconds.\n${server.output()}`);
}

async function stopViteServer(server) {
  if (server.child.exitCode !== null) return;
  server.child.kill();
  await Promise.race([
    new Promise((resolveExit) => server.child.once('exit', resolveExit)),
    new Promise((resolveDelay) => setTimeout(resolveDelay, 3_000)),
  ]);
  if (server.child.exitCode === null) server.child.kill('SIGKILL');
}

function browserMatrixMetric(output) {
  const marker = '{"event":"curriculum-browser-runtime-matrix"';
  const start = output.lastIndexOf(marker);
  if (start < 0) return undefined;
  const end = output.indexOf('\n', start);
  try { return JSON.parse(output.slice(start, end < 0 ? undefined : end)); }
  catch { return undefined; }
}

if (process.exitCode === undefined) {
  const root = process.cwd();
  const nativeOnly = chapter === '0';
  const sharedEnvironment = { ...process.env, ...(chapter && !nativeOnly ? { CURRICULUM_CHAPTER: chapter } : {}) };
  const phases = [
    await runPhase('native-type-matrix', process.execPath, [resolve(root, 'node_modules/vitest/vitest.mjs'), 'run', 'tests/compiler-matrix.test.ts', '--reporter=dot'], sharedEnvironment),
  ];

  if (phases[0].passed && !nativeOnly) {
    const server = startViteServer();
    try {
      await waitForServer(server);
      phases.push(await runPhase('browser-runtime-matrix', process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config=playwright.curriculum.config.ts', 'tests/e2e/curriculum-runtime.spec.ts', '--reporter=dot'], sharedEnvironment));
    } catch (error) {
      phases.push({ name: 'browser-runtime-matrix', passed: false, output: error instanceof Error ? error.message : String(error) });
    } finally {
      await stopViteServer(server);
    }
  }

  const failed = phases.find((phase) => !phase.passed);
  if (failed) process.stderr.write(failed.output);
  const browserPhase = phases.find((phase) => phase.name === 'browser-runtime-matrix');
  console.log(JSON.stringify({
    event: 'curriculum-verification',
    scope: nativeOnly ? 'native-type-matrix' : chapter ? `chapter-${chapter}` : 'all-published-lessons',
    phases: phases.map(({ name, passed }) => ({ name, status: passed ? 'passed' : 'failed' })),
    ...(browserPhase?.passed ? { browser: browserMatrixMetric(browserPhase.output) } : {}),
  }));
  process.exitCode = failed ? 1 : 0;
}
