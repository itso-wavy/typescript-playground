import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';

const root = process.cwd();
const port = 5184;
const vite = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port)], {
  cwd: root,
  env: { ...process.env, LOCAL_PREVIEW: '1' },
  shell: false,
  stdio: 'inherit',
});

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      // The direct Vite child has not opened its socket yet.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error('Vite did not become ready within 10 seconds.');
}

async function stop(server) {
  if (server.exitCode !== null) return;
  const closed = once(server, 'close');
  server.kill('SIGTERM');
  await Promise.race([
    closed,
    new Promise((resolveDelay) => setTimeout(resolveDelay, 2_000)).then(() => server.kill('SIGKILL')),
  ]);
}

try {
  await waitForServer();
  const playwright = spawn(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config=playwright.config.ts'], {
    cwd: root,
    shell: false,
    stdio: 'inherit',
  });
  const [code] = await once(playwright, 'close');
  if (code !== 0) process.exitCode = 1;
} finally {
  await stop(vite);
}
