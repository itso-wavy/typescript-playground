import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { authorize, AuthorizationConfigurationError, AuthorizationError, OwnerForbiddenError } from './auth.js';
import { checkLesson } from './check.js';
import { validateCheckRequest } from '../src/shared/validation.js';

const MAX_BODY_BYTES = 70 * 1024;
let queuedChecks = 0;
const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' };

function loopback(host: string | undefined): boolean {
  const value = (host ?? '').replace(/:\d+$/, '').toLowerCase();
  return value === 'localhost' || value === '127.0.0.1' || value === '[::1]' || value === '::1';
}

function localPreview(request: IncomingMessage): boolean {
  return process.env.LOCAL_PREVIEW === '1' && process.env.NODE_ENV !== 'production' && loopback(request.headers.host);
}

function publicConfig(request: IncomingMessage): { localPreview: boolean; supabaseUrl: string; supabasePublishableKey: string } {
  if (localPreview(request)) return { localPreview: true, supabaseUrl: '', supabasePublishableKey: '' };
  const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? '';
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.SUPABASE_ANON_KEY?.trim()
    || '';
  if (!supabaseUrl || !supabasePublishableKey || !(process.env.OWNER_USER_ID?.trim())) throw new AuthorizationConfigurationError('Cloud authorization is not configured.');
  return { localPreview: false, supabaseUrl, supabasePublishableKey };
}

function send(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > MAX_BODY_BYTES) throw new RangeError('Request body is too large.');
    chunks.push(buffer);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new SyntaxError('Request body must be valid JSON.'); }
}

function bearer(request: IncomingMessage): string {
  const value = request.headers.authorization ?? '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

function jsonContent(request: IncomingMessage): boolean {
  const contentType = request.headers['content-type'];
  return typeof contentType === 'string' && /^application\/json(?:\s*;|$)/i.test(contentType);
}

export async function handleApi(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (!pathname.startsWith('/api/')) return false;
  try {
    if (request.method === 'GET' && pathname === '/api/config') { send(response, 200, publicConfig(request)); return true; }
    if (request.method === 'GET' && pathname === '/api/me') {
      if (localPreview(request)) { send(response, 200, { id: 'local-preview' }); return true; }
      send(response, 200, await authorize(bearer(request))); return true;
    }
    if (request.method === 'POST' && pathname === '/api/check') {
      if (!jsonContent(request)) { send(response, 415, { message: 'Content-Type must be application/json.' }); return true; }
      const config = publicConfig(request);
      if (!config.localPreview) await authorize(bearer(request));
      const body = await readJson(request);
      if (!validateCheckRequest(body)) { send(response, 413, { message: 'The request is invalid or too large.' }); return true; }
      if (queuedChecks >= 2) { send(response, 429, { message: 'The compiler is busy. Try again shortly.' }); return true; }
      queuedChecks += 1;
      try { send(response, 200, await checkLesson(body)); return true; }
      finally { queuedChecks -= 1; }
    }
    send(response, 404, { message: 'API route not found.' }); return true;
  } catch (error) {
    if (error instanceof RangeError) { send(response, 413, { message: error.message }); return true; }
    if (error instanceof SyntaxError) { send(response, 400, { message: error.message }); return true; }
    if (error instanceof AuthorizationError || error instanceof OwnerForbiddenError || error instanceof AuthorizationConfigurationError) { send(response, error.status, { message: error.message }); return true; }
    send(response, 500, { message: 'Unexpected server error.' }); return true;
  }
}

async function serveStatic(request: IncomingMessage, response: ServerResponse, dist: string): Promise<void> {
  const requested = new URL(request.url ?? '/', 'http://localhost').pathname;
  // The production launcher is written into dist beside browser assets. It is
  // never a public asset: serving it would disclose server implementation.
  if (requested === '/server.mjs') {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  const root = resolve(dist);
  const candidate = resolve(root, `.${requested}`);
  const relation = relative(root, candidate);
  const file = !relation.startsWith('..') && !isAbsolute(relation) ? candidate : join(root, 'index.html');
  const chosen = await stat(file).then((value) => value.isFile() ? file : join(dist, 'index.html')).catch(() => join(dist, 'index.html'));
  response.writeHead(200, { 'content-type': types[extname(chosen)] ?? 'application/octet-stream' });
  createReadStream(chosen).pipe(response);
}

export function startProductionServer(port = Number(process.env.PORT ?? 4173)): ReturnType<typeof createServer> {
  process.env.NODE_ENV = 'production';
  const dist = resolve(process.cwd(), 'dist');
  const server = createServer(async (request, response) => {
    if (await handleApi(request, response)) return;
    await serveStatic(request, response, dist);
  });
  server.listen(port, process.env.HOST ?? '0.0.0.0');
  return server;
}

if (process.argv[1] && process.argv[1].endsWith('server.mjs')) startProductionServer();
