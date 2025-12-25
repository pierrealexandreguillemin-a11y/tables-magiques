# Architecture ISO/IEC 25010 - Tables Magiques

Guide d'architecture pour le developpement conforme aux standards.

## Diagrammes

| Diagramme    | Description          | Fichier                                           |
| ------------ | -------------------- | ------------------------------------------------- |
| Architecture | Vue C4 du systeme    | [architecture.svg](./diagrams/architecture.svg)   |
| Data Flow    | Flux de donnees      | [data-flow.svg](./diagrams/data-flow.svg)         |
| User Flows   | Parcours utilisateur | [user-flows.svg](./diagrams/user-flows.svg)       |
| Badges       | Systeme de badges    | [badges-system.svg](./diagrams/badges-system.svg) |

> Les fichiers `.mmd` (Mermaid) sont la source. Les `.svg` sont regeneres automatiquement par le hook pre-push.

---

## Standards appliques

| Standard      | Application        |
| ------------- | ------------------ |
| ISO/IEC 25010 | Qualite logicielle |
| ISO/IEC 29119 | Tests              |
| ISO/IEC 5055  | Qualite code       |
| ISO 8601      | Dates/timestamps   |
| WCAG 2.1 AA   | Accessibilite      |

---

## ISO/IEC 25010 - Caracteristiques qualite

### 1. Maintenabilite

**Modularite** : Separation claire des responsabilites

```
app/           -> Presentation (UI Layer)
components/    -> Composants reutilisables
lib/           -> Logique metier (Domain Layer)
types/         -> Contrats TypeScript
config/        -> Configuration
```

**Analysabilite** : Code lisible et documente

```typescript
/**
 * Calcule le score d'une session de jeu
 * @param correct Nombre de bonnes reponses
 * @param total Nombre total de questions
 * @returns Pourcentage de reussite (0-100)
 */
export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
```

**Modifiabilite** : Configuration externalisee

```typescript
// config/game.ts - Facile a modifier
export const GAME_CONFIG = {
  CHALLENGE_DURATION: 180, // 3 minutes
  QUESTION_TIMEOUT: 5, // 5 secondes
  TABLES_RANGE: { min: 1, max: 10 },
};
```

### 2. Fiabilite

**Tolerance aux fautes** : Gestion erreurs systematique

```typescript
// CORRECT: Gestion explicite
try {
  const result = await saveScore(score);
  return { success: true, data: result };
} catch (error) {
  console.error('[saveScore]', error);
  return { success: false, error: 'Erreur sauvegarde' };
}

// INTERDIT: Catch vide (bloque par pre-commit hook)
try {
  await saveScore(score);
} catch (e) {} // ERREUR: catch vide
```

**Recuperabilite** : Sauvegarde automatique

```typescript
// Hook sauvegarde periodique
useEffect(() => {
  const interval = setInterval(() => {
    if (gameState.inProgress) {
      saveGameState(gameState);
    }
  }, 30000); // Toutes les 30s
  return () => clearInterval(interval);
}, [gameState]);
```

### 3. Securite

**Authentification** : Sessions Redis avec expiration

```typescript
// Session structure
interface Session {
  userId: string;
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
}

// TTL automatique Redis
await redis.set(`tm:session:${token}`, session, { ex: 86400 }); // 24h
```

**Validation** : Schemas Zod sur API

```typescript
import { z } from 'zod';

const ScoreSchema = z.object({
  userId: z.string().uuid(),
  table: z.number().min(1).max(10),
  correct: z.number().min(0),
  total: z.number().min(1),
});
```

### 4. Performance

**Temps de reponse** : < 100ms pour operations courantes

```typescript
// Cache Redis pour lectures frequentes
const cacheKey = `tm:cache:badges:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

const badges = await fetchBadges(userId);
await redis.set(cacheKey, badges, { ex: 300 }); // 5min cache
return badges;
```

**Utilisation ressources** : Lazy loading

```typescript
// Chargement dynamique GSAP
const gsap = await import('gsap');
gsap.to(element, { opacity: 1 });
```

### 5. Utilisabilite

**Accessibilite** : WCAG 2.1 AA

```typescript
// Composant accessible
<button
  aria-label="Verifier la reponse"
  aria-disabled={!canSubmit}
  className="min-h-[44px] min-w-[44px]" // Touch target
>
  Verifier
</button>
```

**Protection erreurs utilisateur** : Validation temps reel

```typescript
// Feedback immediat
const isValid = answer.length > 0 && !isNaN(Number(answer));
```

---

## Structure des dossiers

```
tables-magiques/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: Auth
│   │   └── login/
│   │       └── page.tsx
│   ├── (game)/                   # Route group: Game
│   │   ├── practice/
│   │   │   └── page.tsx
│   │   ├── challenge/
│   │   │   └── page.tsx
│   │   └── badges/
│   │       └── page.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── scores/
│   │   │   └── route.ts
│   │   └── badges/
│   │       └── [userId]/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/                   # Composants UI
│   ├── ui/                       # shadcn/ui base
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── badge.tsx
│   ├── game/                     # Composants jeu
│   │   ├── NumberPad.tsx
│   │   ├── QuestionDisplay.tsx
│   │   ├── ScoreBoard.tsx
│   │   ├── BadgeCollection.tsx
│   │   └── Timer.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Container.tsx
│   └── animations/
│       └── Fireworks.tsx
│
├── lib/                          # Logique metier
│   ├── db/
│   │   ├── upstash.ts           # Client Redis
│   │   └── operations/
│   │       ├── users.ts
│   │       ├── scores.ts
│   │       └── badges.ts
│   ├── game/
│   │   ├── questions.ts         # Generation questions
│   │   ├── scoring.ts           # Calcul scores
│   │   ├── badges.ts            # Logique badges
│   │   └── constants.ts
│   ├── auth/
│   │   ├── session.ts           # Gestion sessions
│   │   └── password.ts          # Hash/verify
│   └── utils/
│       ├── cn.ts                # className utils
│       └── date.ts              # ISO 8601 helpers
│
├── hooks/                        # React Hooks
│   ├── useAuth.ts
│   ├── useGameState.ts
│   ├── useBadges.ts
│   └── useTheme.ts
│
├── types/                        # TypeScript types
│   ├── user.ts
│   ├── game.ts
│   ├── badge.ts
│   └── api.ts
│
├── config/                       # Configuration
│   ├── site.ts                  # Metadata app
│   ├── game.ts                  # Config jeu
│   └── badges.ts                # Definition badges
│
├── tests/                        # Tests (ISO 29119)
│   ├── unit/                    # 60%
│   │   ├── game/
│   │   │   ├── questions.test.ts
│   │   │   ├── scoring.test.ts
│   │   │   └── badges.test.ts
│   │   └── auth/
│   │       └── password.test.ts
│   ├── integration/             # 30%
│   │   ├── api/
│   │   │   ├── auth.test.ts
│   │   │   └── scores.test.ts
│   │   └── db/
│   │       └── operations.test.ts
│   └── e2e/                     # 10%
│       ├── login.spec.ts
│       ├── practice-mode.spec.ts
│       └── challenge-mode.spec.ts
│
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│
└── docs/
    ├── FEATURES.md
    ├── BADGES.md
    └── ARCHITECTURE.md
```

---

## Conventions de code

### Nommage

| Type                | Convention            | Exemple           |
| ------------------- | --------------------- | ----------------- |
| Fichiers composants | PascalCase            | `NumberPad.tsx`   |
| Fichiers lib        | camelCase             | `questions.ts`    |
| Fichiers tests      | _.test.ts / _.spec.ts | `scoring.test.ts` |
| Constantes          | UPPER_SNAKE           | `GAME_CONFIG`     |
| Types/Interfaces    | PascalCase            | `GameState`       |
| Fonctions           | camelCase             | `calculateScore`  |

### TypeScript strict

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Imports

```typescript
// Ordre des imports
// 1. React/Next
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Librairies externes
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

// 3. Components internes
import { Button } from '@/components/ui/button';
import { NumberPad } from '@/components/game/NumberPad';

// 4. Lib/utils
import { calculateScore } from '@/lib/game/scoring';
import { cn } from '@/lib/utils/cn';

// 5. Types
import type { GameState } from '@/types/game';
```

---

## Pyramide de tests (ISO/IEC 29119)

```
        /\
       /  \
      / E2E \           10% - Playwright
     /______\           Parcours utilisateur complets
    /        \
   / INTEGR.  \         30% - Vitest + Mocks
  /____________\        API routes, DB operations
 /              \
/   UNIT TESTS   \      60% - Vitest
\________________/      Fonctions pures, logique
```

### Tests unitaires (60%)

```typescript
// tests/unit/game/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore } from '@/lib/game/scoring';

describe('calculateScore', () => {
  it('calcule 100% pour score parfait', () => {
    expect(calculateScore(10, 10)).toBe(100);
  });

  it('calcule 0% pour aucune bonne reponse', () => {
    expect(calculateScore(0, 10)).toBe(0);
  });

  it('retourne 0 si total est 0', () => {
    expect(calculateScore(0, 0)).toBe(0);
  });

  it('arrondit correctement', () => {
    expect(calculateScore(7, 10)).toBe(70);
    expect(calculateScore(1, 3)).toBe(33);
  });
});
```

### Tests integration (30%)

```typescript
// tests/integration/api/scores.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/scores/route';

vi.mock('@/lib/db/upstash', () => ({
  getRedis: vi.fn(() => ({
    lpush: vi.fn(),
    lrange: vi.fn().mockResolvedValue([]),
  })),
}));

describe('POST /api/scores', () => {
  it('sauvegarde un score valide', async () => {
    const req = new Request('http://localhost/api/scores', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'test-user',
        table: 5,
        correct: 8,
        total: 10,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
```

### Tests E2E (10%)

```typescript
// tests/e2e/practice-mode.spec.ts
import { test, expect } from '@playwright/test';

test('complete practice session', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'test1234');
  await page.click('button[type="submit"]');

  // Navigate to practice
  await page.goto('/practice');
  await expect(page.locator('h1')).toContainText('Practice');

  // Select table 5
  await page.click('button:has-text("5")');

  // Answer question
  const answer = await page.locator('[data-testid="question"]').textContent();
  // ... repondre correctement

  // Verify feedback
  await expect(page.locator('[data-testid="feedback"]')).toBeVisible();
});
```

---

## API Design

### Conventions REST

| Methode | Usage        | Exemple                   |
| ------- | ------------ | ------------------------- |
| GET     | Lecture      | `GET /api/badges/:userId` |
| POST    | Creation     | `POST /api/scores`        |
| PUT     | Remplacement | `PUT /api/user/:id`       |
| PATCH   | Modification | `PATCH /api/user/:id`     |
| DELETE  | Suppression  | `DELETE /api/session`     |

### Format reponse

```typescript
// Succes
{
  "success": true,
  "data": { ... }
}

// Erreur
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

### Codes HTTP

| Code | Usage             |
| ---- | ----------------- |
| 200  | Succes lecture    |
| 201  | Succes creation   |
| 400  | Erreur validation |
| 401  | Non authentifie   |
| 403  | Non autorise      |
| 404  | Non trouve        |
| 500  | Erreur serveur    |

---

## Schema donnees Redis

### Prefixe application

Toutes les cles utilisent le prefixe `tm:` (tables-magiques) pour isolation.

### Structure cles

```
tm:user:{username}              -> Hash { id, passwordHash, createdAt }
tm:user:id:{id}                 -> String (username lookup)
tm:session:{token}              -> Hash { userId, expiresAt } [TTL: 24h]
tm:scores:{userId}:practice     -> List [score1, score2, ...]
tm:scores:{userId}:challenge    -> List [score1, score2, ...]
tm:badges:{userId}:practice     -> Set [badge1, badge2, ...]
tm:badges:{userId}:challenge    -> Set [badge1, badge2, ...]
```

### Types donnees

```typescript
// Score
{
  table: number,
  correct: number,
  total: number,
  timestamp: string  // ISO 8601
}

// Badge (dans Set, juste l'ID)
"first" | "streak5" | "streak10" | ...
```

---

## Workflow developpement TDD

1. **Ecrire le test** (RED)

```bash
# Creer test
touch tests/unit/game/scoring.test.ts
# Ecrire test qui echoue
```

2. **Implementer** (GREEN)

```bash
# Ecrire code minimal pour passer test
touch lib/game/scoring.ts
```

3. **Refactoriser** (REFACTOR)

```bash
# Ameliorer code sans casser tests
npm test
```

4. **Commit**

```bash
git add .
git commit -m "feat: implement scoring logic"
# Hooks pre-commit valident automatiquement
```
