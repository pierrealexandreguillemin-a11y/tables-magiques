#!/usr/bin/env npx tsx
/**
 * Export Fixtures depuis Upstash Redis Production
 * ISO/IEC 29119 - Données RÉELLES pour tests
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=xxx UPSTASH_REDIS_REST_TOKEN=xxx npx tsx scripts/export-fixtures.ts
 *
 * Ou avec Vercel CLI:
 *   vercel env pull .env.local
 *   source .env.local && npx tsx scripts/export-fixtures.ts
 */

import { Redis } from '@upstash/redis';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIG
// =============================================================================

const APP_PREFIX = 'tm'; // tables-magiques

const KEYS = {
  user: (username: string) => `${APP_PREFIX}:user:${username}`,
  userId: (id: string) => `${APP_PREFIX}:user:id:${id}`,
  session: (token: string) => `${APP_PREFIX}:session:${token}`,
  scores: (userId: string, mode: string) =>
    `${APP_PREFIX}:scores:${userId}:${mode}`,
  userBadges: (userId: string) => `${APP_PREFIX}:badges:${userId}`,
};

// =============================================================================
// TYPES
// =============================================================================

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Score {
  userId: string;
  mode: 'practice' | 'challenge';
  table?: number;
  correct: number;
  total: number;
  timeRemaining?: number;
  timestamp: string;
}

interface EarnedBadge {
  id: string;
  mode: 'practice' | 'challenge';
  earnedAt: string;
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

async function exportUserData(redis: Redis): Promise<StoredUser | null> {
  console.log('📦 Exporting user data...');

  // Try to find a user (emma is our test user)
  const userData = await redis.get<string>(KEYS.user('emma'));

  if (!userData) {
    console.log('  ⚠️  No user "emma" found, trying to scan for users...');

    // Scan for any user
    const keys = await redis.keys(`${APP_PREFIX}:user:*`);
    const userKeys = keys.filter(
      (k) => !k.includes(':id:') && k !== `${APP_PREFIX}:user:`
    );

    const firstUserKey = userKeys[0];
    if (!firstUserKey) {
      console.log('  ❌ No users found in production');
      return null;
    }

    const firstUserData = await redis.get<string>(firstUserKey);
    if (firstUserData) {
      const user =
        typeof firstUserData === 'string'
          ? JSON.parse(firstUserData)
          : firstUserData;
      console.log(`  ✅ Found user: ${user.username}`);
      return user;
    }
  }

  const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
  console.log(`  ✅ Found user: ${user.username}`);
  return user;
}

async function exportScores(
  redis: Redis,
  userId: string
): Promise<{ practice: Score[]; challenge: Score[] }> {
  console.log('📦 Exporting scores...');

  const practiceScores = await redis.lrange(
    KEYS.scores(userId, 'practice'),
    0,
    -1
  );
  const challengeScores = await redis.lrange(
    KEYS.scores(userId, 'challenge'),
    0,
    -1
  );

  const parsedPractice = practiceScores.map((s) =>
    typeof s === 'string' ? JSON.parse(s) : s
  );
  const parsedChallenge = challengeScores.map((s) =>
    typeof s === 'string' ? JSON.parse(s) : s
  );

  console.log(`  ✅ Practice scores: ${parsedPractice.length}`);
  console.log(`  ✅ Challenge scores: ${parsedChallenge.length}`);

  return {
    practice: parsedPractice,
    challenge: parsedChallenge,
  };
}

async function exportBadges(
  redis: Redis,
  userId: string
): Promise<EarnedBadge[]> {
  console.log('📦 Exporting badges...');

  const badgesData = await redis.get<string>(KEYS.userBadges(userId));

  if (!badgesData) {
    console.log('  ⚠️  No badges found');
    return [];
  }

  const badges =
    typeof badgesData === 'string' ? JSON.parse(badgesData) : badgesData;
  console.log(`  ✅ Badges: ${badges.length}`);
  return badges;
}

// =============================================================================
// GENERATE FIXTURE FILES
// =============================================================================

function generateAuthFixture(user: StoredUser): string {
  const safeUser = {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };

  return `/**
 * Fixtures Auth - Exportées depuis Upstash Production
 * ISO/IEC 29119 - DONNÉES RÉELLES
 * Generated: ${new Date().toISOString()}
 */

import type { SafeUser, StoredUser } from '@/types/auth';

export const EMMA_USER_FIXTURE: SafeUser = ${JSON.stringify(safeUser, null, 2)};

export const EMMA_STORED_FIXTURE: StoredUser = ${JSON.stringify(user, null, 2)};

// ... rest of auth fixtures
`;
}

function generateScoresFixture(scores: {
  practice: Score[];
  challenge: Score[];
}): string {
  return `/**
 * Scores Fixtures - Exportées depuis Upstash Production
 * ISO/IEC 29119 - DONNÉES RÉELLES
 * Generated: ${new Date().toISOString()}
 */

import type { Score } from '@/types/game';

export const PRACTICE_SCORES_FIXTURE: Score[] = ${JSON.stringify(scores.practice, null, 2)};

export const CHALLENGE_SCORES_FIXTURE: Score[] = ${JSON.stringify(scores.challenge, null, 2)};

// First scores for single fixture
export const SCORE_PRACTICE_FIXTURE: Score = ${JSON.stringify(scores.practice[0] || {}, null, 2)};

export const SCORE_CHALLENGE_FIXTURE: Score = ${JSON.stringify(scores.challenge[0] || {}, null, 2)};
`;
}

function generateBadgesFixture(badges: EarnedBadge[]): string {
  return `/**
 * Badge Fixtures - Exportées depuis Upstash Production
 * ISO/IEC 29119 - DONNÉES RÉELLES
 * Generated: ${new Date().toISOString()}
 */

import type { EarnedBadge } from '@/types/badge';

export const EARNED_BADGES_FIXTURE: EarnedBadge[] = ${JSON.stringify(badges, null, 2)};

export const PRACTICE_BADGES_EARNED = EARNED_BADGES_FIXTURE.filter(b => b.mode === 'practice');
export const CHALLENGE_BADGES_EARNED = EARNED_BADGES_FIXTURE.filter(b => b.mode === 'challenge');
`;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🚀 Export Fixtures from Upstash Production\n');

  // Check environment variables
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ Missing environment variables:');
    console.error('   UPSTASH_REDIS_REST_URL');
    console.error('   UPSTASH_REDIS_REST_TOKEN');
    console.error('\nUsage:');
    console.error(
      '  UPSTASH_REDIS_REST_URL=xxx UPSTASH_REDIS_REST_TOKEN=xxx npx tsx scripts/export-fixtures.ts'
    );
    process.exit(1);
  }

  // Connect to Redis
  const redis = new Redis({ url, token });
  console.log('✅ Connected to Upstash Redis\n');

  try {
    // Export user
    const user = await exportUserData(redis);

    if (!user) {
      console.log('\n❌ No user data to export');
      process.exit(1);
    }

    // Export scores and badges
    const scores = await exportScores(redis, user.id);
    const badges = await exportBadges(redis, user.id);

    // Generate fixtures
    console.log('\n📝 Generating fixture files...');

    const outputDir = path.join(
      __dirname,
      '..',
      'tests',
      'fixtures',
      'production'
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write files
    fs.writeFileSync(
      path.join(outputDir, 'auth.generated.ts'),
      generateAuthFixture(user)
    );
    console.log('  ✅ tests/fixtures/production/auth.generated.ts');

    fs.writeFileSync(
      path.join(outputDir, 'scores.generated.ts'),
      generateScoresFixture(scores)
    );
    console.log('  ✅ tests/fixtures/production/scores.generated.ts');

    fs.writeFileSync(
      path.join(outputDir, 'badges.generated.ts'),
      generateBadgesFixture(badges)
    );
    console.log('  ✅ tests/fixtures/production/badges.generated.ts');

    // Summary
    console.log('\n✅ Export complete!');
    console.log(`   User: ${user.username}`);
    console.log(`   Practice scores: ${scores.practice.length}`);
    console.log(`   Challenge scores: ${scores.challenge.length}`);
    console.log(`   Badges: ${badges.length}`);
    console.log(`\nFiles written to: ${outputDir}`);
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

main();
