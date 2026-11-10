import * as esbuild from 'esbuild';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import type { FileMap } from '../src/shared/contracts.js';

const MAX_BUNDLE_BYTES = 256 * 1024;

function virtualFiles(files: FileMap): Map<string, string> {
  return new Map(Object.entries(files).map(([path, source]) => [`/lesson/${path}`, source]));
}

function resolveRelative(importer: string, specifier: string, files: Map<string, string>): string | undefined {
  if (!specifier.startsWith('./')) return undefined;
  const base = new URL(specifier, `file://${importer}`).pathname;
  const sourceBase = base.replace(/\.jsx?$/, '');
  return [base, `${sourceBase}.ts`, `${sourceBase}.tsx`, `${sourceBase}.d.ts`, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
    .find((candidate) => files.has(candidate));
}

function dependencyResolver(files: Map<string, string>): esbuild.Plugin {
  return { name: 'lesson-memory-only', setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (files.has(args.path)) return { path: args.path, namespace: 'lesson' };
      if (args.path === 'react') return { path: resolve(process.cwd(), 'node_modules/react/index.js') };
      if (args.path === 'react-dom') return { path: resolve(process.cwd(), 'node_modules/react-dom/index.js') };
      if (args.path === 'react-dom/server') return { path: resolve(process.cwd(), 'node_modules/react-dom/server.browser.js') };
      if (args.path === 'react/jsx-runtime') return { path: resolve(process.cwd(), 'node_modules/react/jsx-runtime.js') };
      if (args.path === 'scheduler') return { path: resolve(process.cwd(), 'node_modules/scheduler/index.js') };
      if (args.importer.includes('/node_modules/') || args.importer.includes('\\node_modules\\')) {
        return args.path.startsWith('.') ? { path: resolve(dirname(args.importer), args.path) } : undefined;
      }
      const resolved = args.path.startsWith('./') ? resolveRelative(args.importer, args.path, files) : undefined;
      if (!resolved) return { errors: [{ text: `unapproved module: ${args.path}` }] };
      return { path: resolved, namespace: 'lesson' };
    });
    build.onLoad({ filter: /.*/, namespace: 'lesson' }, (args) => {
      const contents = files.get(args.path);
      if (contents === undefined) return { errors: [{ text: 'virtual file missing' }] };
      return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts', resolveDir: process.cwd() };
    });
  } };
}

async function build(entry: string, files: Map<string, string>): Promise<string> {
  const result = await esbuild.build({
    absWorkingDir: process.cwd(), entryPoints: [entry], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022', jsx: 'automatic', minify: true, define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent', plugins: [dependencyResolver(files)],
  });
  return result.outputFiles[0]?.text ?? '';
}

/** A per-bundle private runtime module shares React with learner code without exposing the result capability. */
export async function bundleRuntime(files: FileMap, runtimeTests: string): Promise<string> {
  const sources = virtualFiles(files);
  const entry = files['index.tsx'] ? './index.tsx' : './index.ts';
  const runtimeEntry = `__tiny_dev_lab_runtime_${randomUUID().replaceAll('-', '')}.ts`;
  const needsRender = /\brender\s*\(/.test(runtimeTests);
  const needsCreateElement = /\bcreateElement\s*\(/.test(runtimeTests);
  const runtimeSource = `
import * as learner from '${entry}';
${needsRender ? "import { renderToStaticMarkup } from 'react-dom/server';" : ''}
${needsCreateElement ? "import { createElement } from 'react';" : ''}
void (async () => {
  const checks = []; const logs = []; let html; let allPassed = true;
  const check = (name, passed) => { const passedBoolean = passed === true; checks[checks.length] = { name: typeof name === 'string' ? name : '', passed: passedBoolean }; if (!passedBoolean) allPassed = false; };
  const render = (element) => ${needsRender ? 'renderToStaticMarkup(element)' : "{ throw new Error('render is unavailable for this lesson'); }"};
  const setHtml = (value) => { html = String(value).slice(0, 65536); };
  console.log = (...values) => { if (logs.length < 100) logs.push(values.map(String).join(' ').slice(0, 2048)); };
  try { await (async () => { ${runtimeTests} })();
    __TRUSTED_POST_MESSAGE__({ type: 'result', nonce: __TRUSTED_RUNNER_CAPABILITY__, result: { status: checks.length > 0 && allPassed ? 'passed' : 'failed', checks, logs, html } });
  } catch (error) { __TRUSTED_POST_MESSAGE__({ type: 'result', nonce: __TRUSTED_RUNNER_CAPABILITY__, result: { status: 'failed', checks, logs, html, error: error instanceof Error ? error.message : String(error) } }); }
})();`;
  sources.set(`/lesson/${runtimeEntry}`, runtimeSource);
  const runtime = await build(`/lesson/${runtimeEntry}`, sources);
  const payload = JSON.stringify({ learner: 'void 0;', runtime });
  if (!runtime || new TextEncoder().encode(payload).byteLength > MAX_BUNDLE_BYTES) throw new Error('runtime bundle exceeds 256 KiB');
  return payload;
}
