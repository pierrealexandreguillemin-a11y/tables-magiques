/**
 * Auth Feature - Barrel Export
 * ISO/IEC 25010 - Feature module encapsulation
 */

// Components
export { AuthModal, UserButton, AuthGateModal, AuthGate } from './components';
export type {
  AuthModalProps,
  UserButtonProps,
  AuthGateModalProps,
  AuthGateProps,
} from './components';

// React Query Hooks
export { useAuth, authKeys } from './hooks/useAuth';

// API
export {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from './api/auth';
export type { AuthResponse, MeResponse } from './api/auth';

// Re-export types from source of truth
export type {
  SafeUser,
  LoginInput,
  RegisterInput,
  Session,
} from '@/types/auth';
