/**
 * Types utilisateur - ISO/IEC 25010 (Contrats)
 */

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string; // ISO 8601
}

export interface UserSession {
  userId: string;
  username: string;
  expiresAt: number; // Unix timestamp
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
  };
}
