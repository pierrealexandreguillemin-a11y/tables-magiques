/**
 * next-server.mjs — start `next start` on a free port for a measurement, then stop it.
 * Owning the server guarantees the measured build is the one on disk (a stale server
 * on a fixed port once answered with an older build, 2026-10-17).
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

export const ROUTES = ['/', '/practice', '/challenge', '/profile', '/settings'];

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/** @returns {Promise<{ base: string, stop: () => void }>} */
export async function startNextServer() {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
    { stdio: 'ignore' }
  );
  const base = `http://localhost:${port}`;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return { base, stop: () => child.kill() };
    } catch {
      // server not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill();
  throw new Error(`next start did not answer on ${base} within 60 s`);
}

/** External server (--base) or our own. */
export function serverFor(base) {
  return base ? Promise.resolve({ base, stop: () => {} }) : startNextServer();
}
