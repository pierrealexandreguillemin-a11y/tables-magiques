/**
 * Tests Unitaires - User Management
 * ISO/IEC 29119 - TDD: Tests CRUD utilisateurs Redis
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EMMA_STORED_FIXTURE,
  VALID_LOGIN_INPUT,
  VALID_REGISTER_INPUT,
} from '@/tests/fixtures';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  exists: vi.fn(),
};

vi.mock('@/lib/db/upstash', () => ({
  getRedis: () => mockRedis,
  KEYS: {
    user: (username: string) => `tm:user:${username}`,
    userId: (id: string) => `tm:userid:${id}`,
  },
}));

// Mock password (pour eviter le temps de hachage bcrypt)
vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2a$10$hashedpassword'),
  verifyPassword: vi.fn().mockImplementation((plain, hash) => {
    // Simuler verification: 'magique123' est le bon mot de passe
    return Promise.resolve(
      plain === 'magique123' && hash === EMMA_STORED_FIXTURE.passwordHash
    );
  }),
}));

// Import apres mock
import {
  createUser,
  authenticateUser,
  getUserById,
  getUserByUsername,
  isUsernameAvailable,
} from '@/lib/auth/user';

describe('User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockReset();
    mockRedis.set.mockReset();
    mockRedis.exists.mockReset();
  });

  describe('createUser', () => {
    it('cree un nouvel utilisateur', async () => {
      mockRedis.get.mockResolvedValue(null); // Username disponible
      mockRedis.set.mockResolvedValue('OK');

      const user = await createUser(VALID_REGISTER_INPUT);

      expect(user.id).toBeDefined();
      expect(user.username).toBe(VALID_REGISTER_INPUT.username.toLowerCase());
      expect(user.createdAt).toBeDefined();
      expect(
        (user as unknown as Record<string, unknown>).passwordHash
      ).toBeUndefined(); // SafeUser
    });

    it('stocke utilisateur avec 2 cles (username + id)', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await createUser(VALID_REGISTER_INPUT);

      expect(mockRedis.set).toHaveBeenCalledTimes(2);
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('tm:user:'),
        expect.any(String)
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('tm:userid:'),
        expect.any(String)
      );
    });

    it('throw si username existe deja', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(EMMA_STORED_FIXTURE));

      await expect(createUser(VALID_REGISTER_INPUT)).rejects.toThrow(
        'USER_EXISTS'
      );
    });
  });

  describe('authenticateUser', () => {
    it('retourne null si utilisateur inexistant', async () => {
      mockRedis.get.mockResolvedValue(null);

      const user = await authenticateUser({
        username: 'inconnu',
        password: 'password',
      });

      expect(user).toBeNull();
    });

    it('retourne null si mot de passe incorrect', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(EMMA_STORED_FIXTURE));

      const user = await authenticateUser({
        username: 'emma',
        password: 'mauvais_mdp',
      });

      expect(user).toBeNull();
    });

    it('retourne utilisateur si credentials valides', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(EMMA_STORED_FIXTURE));
      mockRedis.set.mockResolvedValue('OK');

      const user = await authenticateUser(VALID_LOGIN_INPUT);

      expect(user).not.toBeNull();
      expect(user?.username).toBe(EMMA_STORED_FIXTURE.username);
    });

    it('met a jour lastLoginAt apres connexion', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(EMMA_STORED_FIXTURE));
      mockRedis.set.mockResolvedValue('OK');

      await authenticateUser(VALID_LOGIN_INPUT);

      expect(mockRedis.set).toHaveBeenCalled();
      const setCall = mockRedis.set.mock.calls[0]!;
      const updatedUser = JSON.parse(setCall[1] as string);
      expect(updatedUser.lastLoginAt).toBeDefined();
    });
  });

  describe('getUserById', () => {
    it('retourne null si ID inexistant', async () => {
      mockRedis.get.mockResolvedValue(null);

      const user = await getUserById('unknown-id');

      expect(user).toBeNull();
    });

    it('retourne utilisateur par ID', async () => {
      mockRedis.get
        .mockResolvedValueOnce(EMMA_STORED_FIXTURE.username) // userId -> username
        .mockResolvedValueOnce(JSON.stringify(EMMA_STORED_FIXTURE)); // username -> user

      const user = await getUserById(EMMA_STORED_FIXTURE.id);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(EMMA_STORED_FIXTURE.id);
      expect(user?.username).toBe(EMMA_STORED_FIXTURE.username);
    });
  });

  describe('getUserByUsername', () => {
    it('retourne null si username inexistant', async () => {
      mockRedis.get.mockResolvedValue(null);

      const user = await getUserByUsername('inconnu');

      expect(user).toBeNull();
    });

    it('retourne utilisateur par username', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(EMMA_STORED_FIXTURE));

      const user = await getUserByUsername('emma');

      expect(user).not.toBeNull();
      expect(user?.username).toBe(EMMA_STORED_FIXTURE.username);
    });

    it('normalise username en minuscules', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(EMMA_STORED_FIXTURE));

      await getUserByUsername('EMMA');

      expect(mockRedis.get).toHaveBeenCalledWith('tm:user:emma');
    });
  });

  describe('isUsernameAvailable', () => {
    it('retourne true si username disponible', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const available = await isUsernameAvailable('nouveau');

      expect(available).toBe(true);
    });

    it('retourne false si username pris', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const available = await isUsernameAvailable('emma');

      expect(available).toBe(false);
    });
  });
});
