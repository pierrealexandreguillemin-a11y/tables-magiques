/**
 * Route de test d'isolation Redis
 * GET: Liste toutes les clés tm:* et vérifie l'isolation
 * POST: Écrit une clé de test
 * DELETE: Supprime la clé de test
 */

import { NextResponse } from 'next/server';
import { getRedis, KEYS } from '@/lib/db/upstash';

const TEST_KEY = 'tm:test:isolation';
const TEST_VALUE = {
  app: 'tables-magiques',
  timestamp: new Date().toISOString(),
  message: 'Si vous voyez ceci dans hay-chess-tracker, isolation ÉCHOUÉE!',
};

export async function GET() {
  try {
    const redis = getRedis();

    // Lire la clé de test
    const testData = await redis.get(TEST_KEY);

    // Scanner les clés tm:*
    const allKeys = await redis.keys('tm:*');

    // Scanner aussi les clés hay-chess-tracker pour comparaison
    const hayKeys = await redis.keys('hay-chess-tracker:*');

    return NextResponse.json({
      status: 'ok',
      isolation: {
        tablesmagiques_keys: allKeys,
        haychesstracker_keys: hayKeys,
        test_key_exists: !!testData,
        test_data: testData,
      },
      conclusion:
        hayKeys.length > 0
          ? 'hay-chess-tracker utilise la même base - isolation par préfixe active'
          : 'hay-chess-tracker non détecté sur cette base',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Redis non configuré', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const redis = getRedis();

    // Écrire la clé de test avec TTL de 5 minutes
    await redis.set(TEST_KEY, JSON.stringify(TEST_VALUE), { ex: 300 });

    return NextResponse.json({
      status: 'ok',
      action: 'write',
      key: TEST_KEY,
      value: TEST_VALUE,
      ttl: '5 minutes',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Échec écriture', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const redis = getRedis();
    await redis.del(TEST_KEY);

    return NextResponse.json({
      status: 'ok',
      action: 'delete',
      key: TEST_KEY,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Échec suppression', details: String(error) },
      { status: 500 }
    );
  }
}
