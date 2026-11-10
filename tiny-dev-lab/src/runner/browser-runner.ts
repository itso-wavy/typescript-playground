import type { RuntimeResult } from '../shared/contracts.js';
import { RUNNER_DOCUMENT } from './runner-document.js';

const failure = (error: string): RuntimeResult => ({ status: 'failed', checks: [], logs: [], error });
const MAX_BUNDLE_BYTES = 256 * 1024;
const MAX_CHECK_NAME = 512;
const MAX_LOG_ENTRY = 2_048;
const MAX_ERROR = 2_048;
const MAX_HTML = 64 * 1024;
const MAX_RESULT_BYTES = 256 * 1024;

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function validBundle(value: string): boolean {
  try {
    const payload: unknown = JSON.parse(value);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
    const { learner, runtime } = payload as { learner?: unknown; runtime?: unknown };
    return typeof learner === 'string'
      && typeof runtime === 'string'
      && learner.length > 0
      && runtime.length > 0
      && byteLength(learner) + byteLength(runtime) <= MAX_BUNDLE_BYTES;
  } catch {
    return false;
  }
}

function validResult(value: unknown): value is RuntimeResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as RuntimeResult;
  if (!['passed', 'failed', 'timeout'].includes(result.status) || !Array.isArray(result.checks) || !Array.isArray(result.logs)) return false;
  if (result.checks.length > 100 || result.logs.length > 100) return false;
  if (result.html !== undefined && (typeof result.html !== 'string' || byteLength(result.html) > MAX_HTML)) return false;
  if (result.error !== undefined && (typeof result.error !== 'string' || byteLength(result.error) > MAX_ERROR)) return false;
  if (!result.checks.every((check) => typeof check?.name === 'string' && check.name.trim().length > 0 && byteLength(check.name) <= MAX_CHECK_NAME && typeof check?.passed === 'boolean')) return false;
  if (!result.logs.every((log) => typeof log === 'string' && byteLength(log) <= MAX_LOG_ENTRY)) return false;
  const resultBytes = result.checks.reduce((total, check) => total + byteLength(check.name), 0)
    + result.logs.reduce((total, log) => total + byteLength(log), 0)
    + (result.html ? byteLength(result.html) : 0)
    + (result.error ? byteLength(result.error) : 0);
  if (resultBytes > MAX_RESULT_BYTES) return false;
  return result.status !== 'passed' || (result.checks.length > 0 && result.checks.every((check) => check.passed));
}

export function runBundle(bundle: string, signal?: AbortSignal): Promise<RuntimeResult> {
  if (typeof document === 'undefined') return Promise.resolve(failure('browser runner is unavailable'));
  if (byteLength(bundle) > MAX_BUNDLE_BYTES) return Promise.resolve(failure('runtime bundle exceeds 256 KiB'));
  if (!validBundle(bundle)) return Promise.resolve(failure('invalid runtime bundle'));
  return new Promise((resolve) => {
    const nonce = crypto.randomUUID();
    const frame = document.createElement('iframe');
    frame.sandbox.add('allow-scripts');
    frame.srcdoc = RUNNER_DOCUMENT;
    frame.hidden = true;
    let done = false;
    let loadDeadline = 0;
    let runDeadline = 0;
    const finish = (result: RuntimeResult) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', receive);
      signal?.removeEventListener('abort', abort);
      window.clearTimeout(loadDeadline);
      window.clearTimeout(runDeadline);
      frame.remove();
      resolve(result);
    };
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || !event.data || event.data.type !== 'result' || event.data.nonce !== nonce) return;
      finish(validResult(event.data.result) ? event.data.result : failure('runner returned an invalid result'));
    };
    const abort = () => finish(failure('execution aborted'));
    window.addEventListener('message', receive);
    signal?.addEventListener('abort', abort, { once: true });
    loadDeadline = window.setTimeout(() => finish(failure('runner frame failed to load')), 2_000);
    runDeadline = window.setTimeout(() => finish({ status: 'timeout', checks: [], logs: [] }), 2_500);
    frame.addEventListener('load', () => { window.clearTimeout(loadDeadline); frame.contentWindow?.postMessage({ type: 'run', nonce, bundle }, '*'); }, { once: true });
    document.body.append(frame);
  });
}
