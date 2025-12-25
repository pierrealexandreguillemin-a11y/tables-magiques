/**
 * MSW Server Setup - Node.js (Vitest)
 * ISO/IEC 29119 - Test infrastructure
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create MSW server with handlers
export const server = setupServer(...handlers);
