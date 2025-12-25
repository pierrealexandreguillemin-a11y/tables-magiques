/**
 * Module Auth - Export centralise
 * ISO/IEC 25010 - Organisation modulaire
 */

// Password utilities
export { hashPassword, verifyPassword } from './password';

// Session management
export {
  createSession,
  getSession,
  deleteSession,
  refreshSession,
} from './session';

// User management
export {
  createUser,
  authenticateUser,
  getUserById,
  getUserByUsername,
  isUsernameAvailable,
} from './user';
