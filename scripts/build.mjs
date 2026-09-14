import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await new Promise((resolveDone, reject) => {
  const child = spawn(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json', '--noEmit'], { stdio: 'inherit', shell: false });
  child.on('error', reject); child.on('close', (code) => code === 0 ? resolveDone() : reject(new Error('typecheck failed')));
});
await viteBuild();
await build({ entryPoints: ['server/index.ts'], bundle: true, platform: 'node', format: 'esm', target: 'node24', external: ['esbuild', 'typescript'], outfile: 'dist/server.mjs' });
