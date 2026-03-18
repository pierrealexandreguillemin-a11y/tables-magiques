/**
 * Tests Unitaires - Stats Storage
 * ISO/IEC 29119 - TDD: Tests persistence Redis stats utilisateur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Score } from '@/types/game';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  llen: vi.fn(),
  lrange: vi.fn(),
};

vi.mock('@/lib/db/upstash', () => ({
  getRedis: () => mockRedis,
  KEYS: {
    user: (username: string) => `tm:user:${username}`,
    userId: (id: string) => `tm:user:id:${id}`,
    scores: (userId: string, mode: string) => `tm:scores:${userId}:${mode}`,
    userBadges: (userId: string) => `tm:badges:${userId}`,
  },
}));

// Import apres mock
import {
  getUserStats,
  getModeStats,
  getSessionHistory,
  getTableProgress,
  getProfileData,
} from '@/lib/stats/storage';

// =============================================================================
// FIXTURES
// =============================================================================

const PRACTICE_SCORE_FIXTURE: Score = {
  userId: 'user-123',
  mode: 'practice',
  table: 7,
  correct: 8,
  total: 10,
  timestamp: '2024-12-26T10:00:00.000Z',
};

const CHALLENGE_SCORE_FIXTURE: Score = {
  userId: 'user-123',
  mode: 'challenge',
  correct: 25,
  total: 30,
  timeRemaining: 45,
  timestamp: '2024-12-26T11:00:00.000Z',
};

const OLDER_PRACTICE_SCORE: Score = {
  userId: 'user-123',
  mode: 'practice',
  table: 3,
  correct: 6,
  total: 10,
  timestamp: '2024-12-25T09:00:00.000Z',
};

const USER_DATA = {
  username: 'emma',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: '2024-12-26T11:00:00.000Z',
};

// =============================================================================
// HELPERS
// =============================================================================

function jsonList(scores: Score[]): string[] {
  return scores.map((s) => JSON.stringify(s));
}

function resetMocks() {
  vi.clearAllMocks();
  mockRedis.get.mockReset();
  mockRedis.llen.mockReset();
  mockRedis.lrange.mockReset();
}

// =============================================================================
// getUserStats
// =============================================================================

describe('getUserStats', () => {
  beforeEach(resetMocks);

  it('retourne stats vides si aucun score', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getUserStats('user-empty');

    expect(result.totalGames).toBe(0);
    expect(result.totalQuestions).toBe(0);
    expect(result.totalCorrect).toBe(0);
    expect(result.averageAccuracy).toBe(0);
    expect(result.practiceGames).toBe(0);
    expect(result.challengeGames).toBe(0);
    expect(result.lastPlayedAt).toBeNull();
  });

  it('calcule totalGames comme somme practice + challenge', async () => {
    mockRedis.get.mockResolvedValue(null);
    // llen called in Promise.all - both resolve independently
    mockRedis.llen
      .mockResolvedValueOnce(3) // practice
      .mockResolvedValueOnce(2); // challenge
    mockRedis.lrange
      .mockResolvedValueOnce(
        jsonList([
          PRACTICE_SCORE_FIXTURE,
          OLDER_PRACTICE_SCORE,
          PRACTICE_SCORE_FIXTURE,
        ])
      )
      .mockResolvedValueOnce(
        jsonList([CHALLENGE_SCORE_FIXTURE, CHALLENGE_SCORE_FIXTURE])
      );

    const result = await getUserStats('user-123');

    expect(result.totalGames).toBe(5);
    expect(result.practiceGames).toBe(3);
    expect(result.challengeGames).toBe(2);
  });

  it('calcule accuracyMoyenne correctement', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.llen.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList([PRACTICE_SCORE_FIXTURE])); // 8/10 = 80%

    const result = await getUserStats('user-123');

    expect(result.totalQuestions).toBe(10);
    expect(result.totalCorrect).toBe(8);
    expect(result.averageAccuracy).toBe(80);
  });

  it('trouve lastPlayedAt comme timestamp le plus recent (practice only)', async () => {
    mockRedis.get.mockResolvedValue(null);
    // Only practice scores, two with different timestamps
    mockRedis.llen
      .mockResolvedValueOnce(2) // practice
      .mockResolvedValueOnce(0); // challenge
    // Both scores in practice, PRACTICE_SCORE_FIXTURE is more recent (2024-12-26)
    mockRedis.lrange.mockResolvedValueOnce(
      jsonList([PRACTICE_SCORE_FIXTURE, OLDER_PRACTICE_SCORE])
    );

    const result = await getUserStats('user-123');

    expect(result.lastPlayedAt).toBe(PRACTICE_SCORE_FIXTURE.timestamp); // 2024-12-26T10:00
  });

  it('trouve lastPlayedAt parmi plusieurs modes', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.llen
      .mockResolvedValueOnce(1) // practice
      .mockResolvedValueOnce(1); // challenge
    // practice score: 2024-12-26T10:00, challenge score: 2024-12-26T11:00
    mockRedis.lrange
      .mockResolvedValueOnce(jsonList([PRACTICE_SCORE_FIXTURE]))
      .mockResolvedValueOnce(jsonList([CHALLENGE_SCORE_FIXTURE]));

    const result = await getUserStats('user-123');

    // CHALLENGE_SCORE_FIXTURE.timestamp (11:00) > PRACTICE_SCORE_FIXTURE.timestamp (10:00)
    expect(result.lastPlayedAt).toBe(CHALLENGE_SCORE_FIXTURE.timestamp);
  });

  it('utilise createdAt du userData si disponible', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma') // userId -> username
      .mockResolvedValueOnce(JSON.stringify(USER_DATA)); // user data
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getUserStats('user-123');

    expect(result.memberSince).toBe('2024-01-01T00:00:00.000Z');
  });

  it('utilise date actuelle pour memberSince si pas de userData', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const before = new Date().toISOString();
    const result = await getUserStats('user-new');
    const after = new Date().toISOString();

    expect(result.memberSince >= before).toBe(true);
    expect(result.memberSince <= after).toBe(true);
  });

  it('ignore scores avec JSON invalide', async () => {
    mockRedis.get.mockResolvedValue(null);
    // practice=2 (but one invalid), challenge=0
    mockRedis.llen.mockResolvedValueOnce(2).mockResolvedValueOnce(0);
    // Only practice lrange called (challenge count is 0)
    mockRedis.lrange.mockResolvedValueOnce([
      JSON.stringify(PRACTICE_SCORE_FIXTURE),
      'invalid{json',
    ]);

    const result = await getUserStats('user-123');

    // Seulement 1 score valide (8 correct, 10 total)
    expect(result.totalQuestions).toBe(10);
    expect(result.totalCorrect).toBe(8);
  });

  it('retourne bestStreak a 0 (non encore implemente)', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getUserStats('user-123');

    expect(result.bestStreak).toBe(0);
  });

  it('accepte userData deja parse (non-string)', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma')
      .mockResolvedValueOnce(USER_DATA); // objet deja parse
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getUserStats('user-123');

    expect(result.memberSince).toBe('2024-01-01T00:00:00.000Z');
  });
});

// =============================================================================
// getModeStats
// =============================================================================

describe('getModeStats', () => {
  beforeEach(resetMocks);

  it('retourne stats vides pour mode sans scores', async () => {
    mockRedis.llen.mockResolvedValue(0);

    const result = await getModeStats('user-123', 'practice');

    expect(result.mode).toBe('practice');
    expect(result.totalGames).toBe(0);
    expect(result.totalQuestions).toBe(0);
    expect(result.totalCorrect).toBe(0);
    expect(result.averageAccuracy).toBe(0);
    expect(result.bestScore).toBe(0);
    expect(result.averageScore).toBe(0);
  });

  it('calcule stats practice correctement', async () => {
    const scores = [
      { ...PRACTICE_SCORE_FIXTURE, correct: 8, total: 10 },
      { ...PRACTICE_SCORE_FIXTURE, correct: 6, total: 10 },
    ];
    mockRedis.llen.mockResolvedValue(2);
    mockRedis.lrange.mockResolvedValue(jsonList(scores));

    const result = await getModeStats('user-123', 'practice');

    expect(result.mode).toBe('practice');
    expect(result.totalGames).toBe(2);
    expect(result.totalQuestions).toBe(20);
    expect(result.totalCorrect).toBe(14);
    expect(result.averageAccuracy).toBe(70); // 14/20 = 70%
    expect(result.bestScore).toBe(8);
    expect(result.averageScore).toBe(7); // Math.round(14/2)
  });

  it('calcule stats challenge correctement', async () => {
    mockRedis.llen.mockResolvedValue(1);
    mockRedis.lrange.mockResolvedValue(jsonList([CHALLENGE_SCORE_FIXTURE]));

    const result = await getModeStats('user-123', 'challenge');

    expect(result.mode).toBe('challenge');
    expect(result.totalGames).toBe(1);
    expect(result.bestScore).toBe(25);
    expect(result.averageScore).toBe(25);
  });

  it('appelle Redis avec la bonne cle de scores', async () => {
    mockRedis.llen.mockResolvedValue(0);

    await getModeStats('user-abc', 'challenge');

    expect(mockRedis.llen).toHaveBeenCalledWith('tm:scores:user-abc:challenge');
  });

  it('calcule bestScore parmi plusieurs scores', async () => {
    const scores = [
      { ...PRACTICE_SCORE_FIXTURE, correct: 5 },
      { ...PRACTICE_SCORE_FIXTURE, correct: 10 },
      { ...PRACTICE_SCORE_FIXTURE, correct: 7 },
    ];
    mockRedis.llen.mockResolvedValue(3);
    mockRedis.lrange.mockResolvedValue(jsonList(scores));

    const result = await getModeStats('user-123', 'practice');

    expect(result.bestScore).toBe(10);
  });
});

// =============================================================================
// getSessionHistory
// =============================================================================

describe('getSessionHistory', () => {
  beforeEach(resetMocks);

  it('retourne historique vide si aucun score', async () => {
    mockRedis.llen.mockResolvedValue(0);

    const result = await getSessionHistory('user-empty', {});

    expect(result.sessions).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('retourne sessions des deux modes par defaut', async () => {
    mockRedis.llen
      .mockResolvedValueOnce(1) // practice
      .mockResolvedValueOnce(1); // challenge
    mockRedis.lrange
      .mockResolvedValueOnce(jsonList([PRACTICE_SCORE_FIXTURE]))
      .mockResolvedValueOnce(jsonList([CHALLENGE_SCORE_FIXTURE]));

    const result = await getSessionHistory('user-123', {});

    expect(result.sessions).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('filtre par mode si specifie', async () => {
    mockRedis.llen.mockResolvedValue(1);
    mockRedis.lrange.mockResolvedValue(jsonList([PRACTICE_SCORE_FIXTURE]));

    const result = await getSessionHistory('user-123', { mode: 'practice' });

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]!.mode).toBe('practice');
    // Redis ne doit etre appele qu'une fois (pour practice uniquement)
    expect(mockRedis.llen).toHaveBeenCalledTimes(1);
    expect(mockRedis.llen).toHaveBeenCalledWith('tm:scores:user-123:practice');
  });

  it('trie sessions par date decroissante', async () => {
    mockRedis.llen.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    // practice has older score, challenge has newer score
    mockRedis.lrange
      .mockResolvedValueOnce(jsonList([OLDER_PRACTICE_SCORE])) // 2024-12-25
      .mockResolvedValueOnce(jsonList([CHALLENGE_SCORE_FIXTURE])); // 2024-12-26

    const result = await getSessionHistory('user-123', {});

    expect(result.sessions[0]!.timestamp).toBe('2024-12-26T11:00:00.000Z');
    expect(result.sessions[1]!.timestamp).toBe('2024-12-25T09:00:00.000Z');
  });

  it('applique pagination avec offset et limit', async () => {
    const scores = Array.from({ length: 5 }, (_, i) => ({
      ...PRACTICE_SCORE_FIXTURE,
      timestamp: `2024-12-2${i + 1}T10:00:00.000Z`,
    }));
    mockRedis.llen.mockResolvedValueOnce(5).mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList(scores));

    const result = await getSessionHistory('user-123', { limit: 2, offset: 1 });

    expect(result.sessions).toHaveLength(2);
  });

  it('indique hasMore correctement', async () => {
    const scores = Array(5).fill(PRACTICE_SCORE_FIXTURE);
    mockRedis.llen
      .mockResolvedValueOnce(5) // 5 practice
      .mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList(scores));

    // limit=2, offset=0, total=5 -> hasMore=true
    const result = await getSessionHistory('user-123', { limit: 2, offset: 0 });

    expect(result.hasMore).toBe(true);
  });

  it('hasMore est false quand offset+limit >= total', async () => {
    const scores = Array(3).fill(PRACTICE_SCORE_FIXTURE);
    mockRedis.llen.mockResolvedValueOnce(3).mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList(scores));

    const result = await getSessionHistory('user-123', { limit: 3, offset: 0 });

    expect(result.hasMore).toBe(false);
  });

  it('calcule accuracy par session', async () => {
    mockRedis.llen.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList([PRACTICE_SCORE_FIXTURE])); // 8/10

    const result = await getSessionHistory('user-123', {});

    expect(result.sessions[0]!.accuracy).toBe(80);
    expect(result.sessions[0]!.score).toBe(8);
    expect(result.sessions[0]!.total).toBe(10);
  });

  it('genere un id unique par session', async () => {
    const scores = [PRACTICE_SCORE_FIXTURE, OLDER_PRACTICE_SCORE];
    mockRedis.llen.mockResolvedValueOnce(2).mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList(scores));

    const result = await getSessionHistory('user-123', {});

    const ids = result.sessions.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('utilise limit=20 par defaut', async () => {
    const scores = Array(25).fill(PRACTICE_SCORE_FIXTURE);
    mockRedis.llen.mockResolvedValueOnce(25).mockResolvedValueOnce(0);
    mockRedis.lrange.mockResolvedValueOnce(jsonList(scores));

    const result = await getSessionHistory('user-123', {});

    expect(result.sessions).toHaveLength(20);
  });
});

// =============================================================================
// getTableProgress
// =============================================================================

describe('getTableProgress', () => {
  beforeEach(resetMocks);

  it('retourne progression pour tables 1 a 10 avec aucun score', async () => {
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getTableProgress('user-empty');

    expect(result.tables).toHaveLength(10);
    expect(result.masteredCount).toBe(0);
    expect(result.totalTables).toBe(10);
    result.tables.forEach((t) => {
      expect(t.gamesPlayed).toBe(0);
      expect(t.accuracy).toBe(0);
      expect(t.mastered).toBe(false);
    });
  });

  it('inclut table numerotee de 1 a 10', async () => {
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getTableProgress('user-123');

    expect(result.tables.map((t) => t.table)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it('marque table comme mastered si >= 90% sur 5+ parties', async () => {
    // 5 parties sur table 7 avec 10/10 chacune = 100%
    const perfectScores = Array(5).fill({
      ...PRACTICE_SCORE_FIXTURE,
      table: 7,
      correct: 10,
      total: 10,
    });
    mockRedis.lrange.mockResolvedValue(jsonList(perfectScores));

    const result = await getTableProgress('user-123');

    const table7 = result.tables.find((t) => t.table === 7);
    expect(table7!.mastered).toBe(true);
    expect(result.masteredCount).toBe(1);
  });

  it('ne marque pas comme mastered si < 5 parties', async () => {
    // 4 parties parfaites - pas assez
    const scores = Array(4).fill({
      ...PRACTICE_SCORE_FIXTURE,
      table: 5,
      correct: 10,
      total: 10,
    });
    mockRedis.lrange.mockResolvedValue(jsonList(scores));

    const result = await getTableProgress('user-123');

    const table5 = result.tables.find((t) => t.table === 5);
    expect(table5!.mastered).toBe(false);
  });

  it('ne marque pas comme mastered si accuracy < 90%', async () => {
    // 5 parties mais seulement 80% de precision
    const scores = Array(5).fill({
      ...PRACTICE_SCORE_FIXTURE,
      table: 3,
      correct: 8,
      total: 10,
    });
    mockRedis.lrange.mockResolvedValue(jsonList(scores));

    const result = await getTableProgress('user-123');

    const table3 = result.tables.find((t) => t.table === 3);
    expect(table3!.mastered).toBe(false);
  });

  it('agrege correctement les scores de plusieurs parties', async () => {
    const scores = [
      { ...PRACTICE_SCORE_FIXTURE, table: 4, correct: 7, total: 10 },
      { ...PRACTICE_SCORE_FIXTURE, table: 4, correct: 9, total: 10 },
    ];
    mockRedis.lrange.mockResolvedValue(jsonList(scores));

    const result = await getTableProgress('user-123');

    const table4 = result.tables.find((t) => t.table === 4);
    expect(table4!.gamesPlayed).toBe(2);
    expect(table4!.accuracy).toBe(80); // 16/20 = 80%
  });

  it('ignore scores sans table definie (mode challenge)', async () => {
    mockRedis.lrange.mockResolvedValue(jsonList([CHALLENGE_SCORE_FIXTURE]));

    const result = await getTableProgress('user-123');

    // Aucune table ne doit avoir de jeux
    result.tables.forEach((t) => {
      expect(t.gamesPlayed).toBe(0);
    });
  });

  it('appelle Redis avec cle practice uniquement', async () => {
    mockRedis.lrange.mockResolvedValue([]);

    await getTableProgress('user-abc');

    expect(mockRedis.lrange).toHaveBeenCalledWith(
      'tm:scores:user-abc:practice',
      0,
      -1
    );
    expect(mockRedis.lrange).toHaveBeenCalledTimes(1);
  });

  it('compte correctement plusieurs tables maistrisees', async () => {
    const scores = [
      // Table 2: 5 parties parfaites
      ...Array(5).fill({
        ...PRACTICE_SCORE_FIXTURE,
        table: 2,
        correct: 10,
        total: 10,
      }),
      // Table 8: 5 parties parfaites
      ...Array(5).fill({
        ...PRACTICE_SCORE_FIXTURE,
        table: 8,
        correct: 10,
        total: 10,
      }),
    ];
    mockRedis.lrange.mockResolvedValue(jsonList(scores));

    const result = await getTableProgress('user-123');

    expect(result.masteredCount).toBe(2);
  });
});

// =============================================================================
// getProfileData
// =============================================================================

describe('getProfileData', () => {
  beforeEach(resetMocks);

  it('retourne null si userId introuvable', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getProfileData('user-unknown');

    expect(result).toBeNull();
  });

  it('retourne null si userData introuvable', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma') // userId -> username
      .mockResolvedValueOnce(null); // userData -> manquant
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getProfileData('user-123');

    expect(result).toBeNull();
  });

  it('retourne null si userData JSON invalide', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma')
      .mockResolvedValueOnce('invalid{json');
    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getProfileData('user-123');

    expect(result).toBeNull();
  });

  it('retourne ProfileData complet pour utilisateur valide', async () => {
    // getProfileData calls: get(userId), get(user:emma)
    // getUserStats (internal) calls: get(userId), get(user:emma), llen x2, lrange x (0-2)
    // getModeStats x2: llen x2, lrange x (0-2)
    // getSessionHistory: llen x2, lrange x (0-2)
    // getTableProgress: lrange x1
    // lrange for badges: 1 call
    mockRedis.get.mockResolvedValue(JSON.stringify(USER_DATA));
    mockRedis.get
      .mockResolvedValueOnce('emma') // getProfileData: userId -> username
      .mockResolvedValueOnce(JSON.stringify(USER_DATA)); // getProfileData: userData

    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getProfileData('user-123');

    expect(result).not.toBeNull();
    expect(result!.user.id).toBe('user-123');
    expect(result!.user.username).toBe('emma');
    expect(result!.user.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result!.user.lastLoginAt).toBe('2024-12-26T11:00:00.000Z');
  });

  it('inclut stats, modeStats, progress, recentSessions et badgeCount', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma')
      .mockResolvedValueOnce(JSON.stringify(USER_DATA))
      .mockResolvedValue(JSON.stringify(USER_DATA));

    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getProfileData('user-123');

    expect(result).not.toBeNull();
    expect(result!.stats).toBeDefined();
    expect(result!.modeStats.practice).toBeDefined();
    expect(result!.modeStats.challenge).toBeDefined();
    expect(result!.recentSessions).toBeDefined();
    expect(result!.progress).toBeDefined();
    expect(typeof result!.badgeCount).toBe('number');
  });

  it('badgeCount reflete le nombre de badges', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma')
      .mockResolvedValueOnce(JSON.stringify(USER_DATA))
      .mockResolvedValue(JSON.stringify(USER_DATA));

    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockImplementation((key: string) => {
      if (key.includes('badges')) {
        return Promise.resolve(['badge1', 'badge2', 'badge3']);
      }
      return Promise.resolve([]);
    });

    const result = await getProfileData('user-123');

    expect(result!.badgeCount).toBe(3);
  });

  it('recentSessions limites a 5 entrees', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma')
      .mockResolvedValueOnce(JSON.stringify(USER_DATA))
      .mockResolvedValue(JSON.stringify(USER_DATA));

    const manyScores = Array(10).fill(PRACTICE_SCORE_FIXTURE);
    mockRedis.llen.mockResolvedValue(10);
    mockRedis.lrange.mockImplementation((key: string) => {
      if (key.includes('badges')) return Promise.resolve([]);
      return Promise.resolve(jsonList(manyScores));
    });

    const result = await getProfileData('user-123');

    expect(result!.recentSessions.length).toBeLessThanOrEqual(5);
  });

  it('accepte userData deja parse (non-string)', async () => {
    mockRedis.get
      .mockResolvedValueOnce('emma')
      .mockResolvedValueOnce(USER_DATA) // objet non-string
      .mockResolvedValue(USER_DATA);

    mockRedis.llen.mockResolvedValue(0);
    mockRedis.lrange.mockResolvedValue([]);

    const result = await getProfileData('user-123');

    expect(result).not.toBeNull();
    expect(result!.user.username).toBe('emma');
  });
});
