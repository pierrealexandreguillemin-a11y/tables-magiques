/**
 * Integration Tests Setup - MSW Server
 * ISO/IEC 29119 - Mock Service Worker for hook/API integration tests
 */

import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { profileHandlers } from './handlers/profile';
import { badgesHandlers } from './handlers/badges';
import { scoresHandlers } from './handlers/scores';

export const server = setupServer(
  ...authHandlers,
  ...profileHandlers,
  ...badgesHandlers,
  ...scoresHandlers
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
