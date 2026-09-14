import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApi } from './server/index.js';

export default defineConfig(({ mode }) => {
  // Vite loads .env files for the dev middleware, while production uses
  // Node's --env-file-if-exists flag in the start script below.
  const env = loadEnv(mode, process.cwd(), '');
  for (const [name, value] of Object.entries(env)) {
    if (process.env[name] === undefined) process.env[name] = value;
  }
  return {
    plugins: [react(), { name: 'tiny-dev-lab-api', configureServer(server) {
      server.middlewares.use((request, response, next) => { void handleApi(request, response).then((handled) => { if (!handled) next(); }); });
    } }],
  };
});
