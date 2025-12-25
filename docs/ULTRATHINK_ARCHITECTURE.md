# ULTRATHINK ARCHITECTURE - Tables Magiques

> **Document**: Architecture unifiee complete de l'application
> **Standards**: ISO/IEC 25010 (Qualite), ISO/IEC 29119 (Tests), ISO/IEC 5055 (Code)
> **Cible**: Enfant 9 ans, theme princesse/licorne, 60fps tablette
> **Date**: 2025-12-25
> **Statut**: SOURCE UNIQUE DE VERITE

---

## VISION GLOBALE

```
+=============================================================================+
|                    TABLES MAGIQUES - VISION 2025                            |
+=============================================================================+
|                                                                             |
|  MISSION: Rendre l'apprentissage des tables de multiplication MAGIQUE      |
|                                                                             |
|  +-----------------------------------------------------------------+       |
|  |  DIFFERENCIATEURS CLES                                          |       |
|  +-----------------------------------------------------------------+       |
|  |  1. Animations GSAP + Lottie de qualite studio (60fps)          |       |
|  |  2. Gamification complete (badges, streaks, niveaux)            |       |
|  |  3. Theme princesse/licorne immersif                            |       |
|  |  4. Feedback positif instantane (<100ms)                        |       |
|  |  5. Accessibilite WCAG 2.1 AA native                            |       |
|  +-----------------------------------------------------------------+       |
|                                                                             |
|  METRIQUES CIBLES:                                                         |
|  +-- Performance: 60fps, <3s LCP, <100ms FID                               |
|  +-- Bundle: <150kB main, lazy load effects                                |
|  +-- Tests: 80%+ coverage, TDD obligatoire                                 |
|  +-- Qualite: 0 erreur TypeScript, 0 warning ESLint                        |
|                                                                             |
+=============================================================================+
```

---

## 1. STACK TECHNIQUE DEFINITIF

### 1.1 Core Stack (Deja Installe)

| Package       | Version | Role                          |
| ------------- | ------- | ----------------------------- |
| Next.js       | 16.1.1  | Framework React SSR/SSG       |
| React         | 19.2.3  | UI Library                    |
| TypeScript    | 5.x     | Typage statique strict        |
| Tailwind CSS  | 4.x     | Utility-first CSS             |
| GSAP          | 3.14.2  | Animations complexes          |
| Framer Motion | 12.x    | Animations React declaratives |
| Upstash Redis | 1.35.x  | Persistance serverless        |

### 1.2 A Installer - Animations & Gamification

```bash
# Lottie pour animations vectorielles
npm install lottie-react

# Icones et illustrations
npm install react-kawaii

# Particules et confetti
npm install @tsparticles/react @tsparticles/slim

# Gamification
npm install react-award

# Validation runtime
npm install zod
```

### 1.3 Stack Final Unifie

```
+=============================================================================+
|                         STACK ANIMATION HIERARCHY                           |
+=============================================================================+
|                                                                             |
|  NIVEAU 1: CSS (Performance maximale - 0 JS)                               |
|  ============================================                               |
|  Usage: Hover, focus, transitions simples, keyframes                        |
|  Fichiers: styles/animations.css, styles/tokens.css                         |
|  Budget: 0kB JS                                                             |
|                                                                             |
|  NIVEAU 2: Framer Motion (Declaratif React)                                |
|  ============================================                               |
|  Usage: AnimatePresence, layout animations, gestures                        |
|  Composants: Toasts, modals, page transitions                               |
|  Budget: ~18kB gzip (tree-shaken)                                          |
|                                                                             |
|  NIVEAU 3: GSAP (Timelines complexes)                                      |
|  ============================================                               |
|  Usage: Sequences, scroll triggers, morphing SVG                            |
|  Composants: Celebrations, counters, progress rings                         |
|  Budget: ~25kB gzip (deja inclus)                                          |
|                                                                             |
|  NIVEAU 4: Lottie (Animations After Effects)                               |
|  ============================================                               |
|  Usage: Licorne mascotte, badges unlock, loading                            |
|  Assets: public/lottie/*.json (lazy loaded)                                 |
|  Budget: ~8kB lib + assets on-demand                                       |
|                                                                             |
|  NIVEAU 5: tsParticles (Effets particules)                                 |
|  ============================================                               |
|  Usage: Confetti victoire, etoiles scintillantes                            |
|  Config: Presets optimises (slim bundle)                                    |
|  Budget: ~15kB gzip (lazy loaded sur celebration)                          |
|                                                                             |
+=============================================================================+
```

---

## 2. ARCHITECTURE FICHIERS ISO/IEC

### 2.1 Structure Centralisee

```
tables-magiques/
|
+-- app/                          # Next.js App Router
|   +-- (auth)/                   # Route group: Auth
|   |   +-- login/page.tsx
|   |   +-- register/page.tsx
|   +-- (game)/                   # Route group: Game
|   |   +-- practice/page.tsx
|   |   +-- challenge/page.tsx
|   |   +-- badges/page.tsx
|   +-- api/                      # API Routes
|   |   +-- auth/
|   |   +-- scores/
|   |   +-- badges/
|   +-- layout.tsx
|   +-- page.tsx
|   +-- globals.css
|
+-- components/                   # Composants UI (CENTRALISE)
|   +-- ui/                       # shadcn/ui base
|   |   +-- button.tsx
|   |   +-- card.tsx
|   |   +-- dialog.tsx
|   +-- effects/                  # Effets visuels (P0-P3)
|   |   +-- FairyBackground.tsx   # P0 - Fond magique
|   |   +-- MagicCard.tsx         # P0 - Cartes exercices
|   |   +-- MagicButton.tsx       # P0 - Boutons validation
|   |   +-- MagicCounter.tsx      # P0 - Score anime
|   |   +-- CrownProgress.tsx     # P0 - Progression niveau
|   |   +-- MagicConfetti.tsx     # P0 - Celebration
|   |   +-- AnswerIcon.tsx        # P0 - Feedback reponse
|   |   +-- MagicLoader.tsx       # P0 - Loading initial
|   |   +-- LottiePlayer.tsx      # Wrapper Lottie
|   |   +-- ParticleEffect.tsx    # Wrapper tsParticles
|   |   +-- index.ts              # Barrel export
|   +-- game/                     # Composants jeu
|   |   +-- NumberPad.tsx
|   |   +-- QuestionDisplay.tsx
|   |   +-- ScoreBoard.tsx
|   |   +-- Timer.tsx
|   |   +-- BadgeCollection.tsx
|   +-- layout/
|       +-- Header.tsx
|       +-- Container.tsx
|
+-- lib/                          # Logique metier (DOMAIN LAYER)
|   +-- animations/               # GSAP effects (EXISTANT)
|   |   +-- gsap-effects.ts       # 12 effets GSAP
|   |   +-- lottie-assets.ts      # Loader lazy Lottie
|   |   +-- particles-presets.ts  # Configs tsParticles
|   +-- game/                     # Logique jeu
|   |   +-- questions.ts          # Generation questions
|   |   +-- scoring.ts            # Calcul scores
|   |   +-- badges.ts             # Logique badges
|   |   +-- streaks.ts            # Gestion series
|   +-- auth/                     # Auth (a implementer TDD)
|   |   +-- password.ts
|   |   +-- session.ts
|   |   +-- index.ts
|   +-- db/
|       +-- upstash.ts            # Client Redis (EXISTANT)
|
+-- types/                        # Types centralises (SOURCE UNIQUE)
|   +-- index.ts                  # Barrel export
|   +-- api.ts                    # ApiResponse, ApiError
|   +-- user.ts                   # User, UserSession
|   +-- game.ts                   # GameState, Question
|   +-- badge.ts                  # Badge, BadgeType
|   +-- effects.ts                # EffectConfig, AnimationState
|
+-- schemas/                      # Validation Zod (CENTRALISE)
|   +-- auth.schema.ts            # Login, Register schemas
|   +-- game.schema.ts            # Score, Answer schemas
|   +-- index.ts                  # Barrel export
|
+-- hooks/                        # React Hooks
|   +-- useReducedMotion.ts       # Accessibilite
|   +-- useGameState.ts
|   +-- useBadges.ts
|   +-- useAuth.ts
|   +-- useGSAP.ts                # Wrapper GSAP React
|
+-- config/                       # Configuration
|   +-- site.ts                   # Metadata app
|   +-- game.ts                   # Constantes jeu
|   +-- badges.ts                 # Definition badges
|   +-- effects.ts                # Tokens animations
|
+-- styles/                       # CSS Global
|   +-- tokens.css                # Design tokens
|   +-- animations.css            # Keyframes CSS
|   +-- focus.css                 # Accessibilite focus
|
+-- tests/                        # Tests ISO 29119
|   +-- fixtures/                 # Donnees REELLES
|   |   +-- users.ts
|   |   +-- games.ts
|   |   +-- badges.ts
|   +-- unit/                     # 60% - Vitest
|   |   +-- lib/
|   |   +-- hooks/
|   +-- integration/              # 30% - Vitest + MSW
|   |   +-- api/
|   +-- e2e/                      # 10% - Playwright
|       +-- practice.spec.ts
|       +-- challenge.spec.ts
|
+-- public/
|   +-- lottie/                   # Animations Lottie
|   |   +-- unicorn-happy.json
|   |   +-- unicorn-celebrate.json
|   |   +-- badge-unlock.json
|   |   +-- stars-sparkle.json
|   +-- sounds/                   # Sons (optionnel)
|   +-- icons/
|   +-- manifest.json
|   +-- sw.js
|
+-- docs/                         # Documentation (EXISTANTE)
    +-- ULTRATHINK_ARCHITECTURE.md  # CE DOCUMENT
    +-- EFFECTS_*.md                # Documentation effets
```

---

## 3. PYRAMIDE DE TESTS ISO 29119

### 3.1 Workflow TDD Obligatoire

```
+=============================================================================+
|                    TDD WORKFLOW - AUCUNE EXCEPTION                          |
+=============================================================================+
|                                                                             |
|  ETAPE 1: RED (Test qui echoue)                                            |
|  ==============================                                             |
|  1. Creer fichier test: tests/unit/lib/game/scoring.test.ts                |
|  2. Ecrire tests avec fixtures REELLES                                      |
|  3. Executer: npm test -- scoring                                           |
|  4. VERIFIER que le test ECHOUE (pas de code encore)                        |
|                                                                             |
|  ETAPE 2: GREEN (Code minimum)                                             |
|  ==============================                                             |
|  1. Creer fichier: lib/game/scoring.ts                                      |
|  2. Ecrire code MINIMUM pour passer le test                                 |
|  3. Executer: npm test -- scoring                                           |
|  4. VERIFIER que le test PASSE                                              |
|                                                                             |
|  ETAPE 3: REFACTOR (Ameliorer)                                             |
|  ==============================                                             |
|  1. Refactoriser sans casser les tests                                      |
|  2. Ajouter types TypeScript stricts                                        |
|  3. Executer: npm test && npm run typecheck                                 |
|  4. VERIFIER 0 erreur                                                       |
|                                                                             |
|  VIOLATION = REVERT IMMEDIAT                                               |
|                                                                             |
+=============================================================================+
```

### 3.2 Structure Fixtures

```typescript
// tests/fixtures/games.ts
// DONNEES REELLES - PAS de mock invente

export const GAME_FIXTURES = {
  // Question valide - cas nominal
  VALID_QUESTION: {
    id: 'q_001',
    a: 7,
    b: 8,
    answer: 56,
    table: 7,
  },

  // Session complete - 10 questions
  COMPLETE_SESSION: {
    userId: 'usr_abc123',
    questions: 10,
    correct: 8,
    duration: 120, // secondes
    table: 5,
  },

  // Score parfait - 100%
  PERFECT_SCORE: {
    correct: 10,
    total: 10,
    percentage: 100,
    streak: 10,
  },
} as const;

// Type inference automatique
export type GameFixture = typeof GAME_FIXTURES;
```

### 3.3 Pattern Test Composant Effect

```typescript
// tests/unit/components/effects/MagicButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MagicButton } from '@/components/effects/MagicButton';

describe('MagicButton', () => {
  // P0 - Comportement critique
  describe('P0 - Interaction', () => {
    it('appelle onClick au clic', async () => {
      const handleClick = vi.fn();
      render(<MagicButton onClick={handleClick}>Verifier</MagicButton>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('affiche effet paillettes apres clic', async () => {
      render(<MagicButton>Verifier</MagicButton>);

      fireEvent.click(screen.getByRole('button'));

      // Particules visibles pendant 600ms
      expect(screen.getAllByTestId('sparkle-particle')).toHaveLength(8);
    });

    it('desactive animations si prefers-reduced-motion', () => {
      // Mock matchMedia
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: true, // reduced motion active
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      render(<MagicButton>Verifier</MagicButton>);

      fireEvent.click(screen.getByRole('button'));

      // Pas de particules en mode reduced motion
      expect(screen.queryByTestId('sparkle-particle')).toBeNull();
    });
  });

  // Accessibilite
  describe('Accessibilite', () => {
    it('a un touch target >= 48px', () => {
      render(<MagicButton>OK</MagicButton>);
      const button = screen.getByRole('button');

      const styles = window.getComputedStyle(button);
      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(48);
      expect(minWidth).toBeGreaterThanOrEqual(48);
    });
  });
});
```

---

## 4. ARCHITECTURE TYPES ISO/IEC 5055

### 4.1 Principe: Modele = Source Unique

```
+=============================================================================+
|                    FLUX TYPES - RESPONSABILITE UNIQUE                       |
+=============================================================================+
|                                                                             |
|  types/*.ts (DEFINIT)                                                      |
|       |                                                                     |
|       v                                                                     |
|  lib/*.ts (CONSOMME)  <--+                                                 |
|       |                   |                                                 |
|       v                   |                                                 |
|  components/*.tsx --------+                                                 |
|       |                   |                                                 |
|       v                   |                                                 |
|  app/**/*.tsx ------------+                                                 |
|                                                                             |
|  INTERDIT:                                                                 |
|  - Definir type dans component                                             |
|  - Definir type dans lib (sauf type interne)                               |
|  - Dupliquer type                                                          |
|  - Utiliser `as Type` (utiliser type guards)                               |
|                                                                             |
+=============================================================================+
```

### 4.2 Types Effects

```typescript
// types/effects.ts
// SOURCE UNIQUE pour tous les types d'animation

/**
 * Configuration effet visuel
 * ISO/IEC 25010 - Maintenabilite
 */
export interface EffectConfig {
  /** Duree en ms (100-800ms pour enfants) */
  duration: number;
  /** Fonction easing CSS ou spring */
  easing: 'bounce' | 'spring' | 'smooth' | 'elastic';
  /** Delai avant demarrage */
  delay?: number;
  /** Nombre repetitions (-1 = infini) */
  repeat?: number;
}

/**
 * Etat animation pour composants
 */
export type AnimationState =
  | 'idle'
  | 'entering'
  | 'active'
  | 'exiting'
  | 'disabled';

/**
 * Variantes theme princesse
 */
export type ThemeVariant = 'princess' | 'unicorn' | 'star' | 'rainbow';

/**
 * Configuration particules
 */
export interface ParticleConfig {
  count: number;
  colors: string[];
  spread: number;
  gravity: number;
  duration: number;
}

/**
 * Presets confetti predefinies
 */
export const CONFETTI_PRESETS = {
  small: { count: 20, spread: 50, duration: 800 },
  medium: { count: 40, spread: 100, duration: 1200 },
  large: { count: 80, spread: 150, duration: 1500 },
} as const;

/**
 * Tokens timing adaptes enfants
 * (plus lent que adultes pour perception)
 */
export const TIMING = {
  instant: 100, // Feedback immediat
  fast: 200, // Micro-interactions
  normal: 400, // Transitions standard
  celebration: 800, // Animations victoire
  dramatic: 1200, // Effets "wow"
} as const;
```

### 4.3 Types Gamification

```typescript
// types/badge.ts
// Systeme de badges complet

export type BadgeCategory = 'practice' | 'challenge' | 'special';

export type BadgeRarity =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'diamond'
  | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Nom icone ou chemin Lottie
  category: BadgeCategory;
  rarity: BadgeRarity;
  condition: BadgeCondition;
  unlockedAt?: string; // ISO 8601
}

export type BadgeCondition =
  | { type: 'streak'; value: number }
  | { type: 'perfect_table'; table: number }
  | { type: 'total_correct'; value: number }
  | { type: 'speed'; questionsPerMinute: number }
  | { type: 'all_tables' }
  | { type: 'challenge_score'; minScore: number };

export interface UserBadgeProgress {
  badgeId: string;
  current: number;
  target: number;
  percentage: number;
}

// Config badges centralisee
export const BADGE_DEFINITIONS: readonly Badge[] = [
  // Practice - Bronze
  {
    id: 'first_star',
    name: 'Premiere Etoile',
    description: 'Reponds correctement a ta premiere question',
    icon: 'star',
    category: 'practice',
    rarity: 'bronze',
    condition: { type: 'total_correct', value: 1 },
  },
  // ... autres badges
] as const;
```

---

## 5. COMPOSANTS EFFECTS - IMPLEMENTATION

### 5.1 Hierarchie P0 (12 composants critiques)

```
+=============================================================================+
|                    P0 - MVP JOUABLE (Sprint 1-2)                           |
+=============================================================================+
|                                                                             |
|  COMPOSANT              | ANIMATION STACK      | PRIORITE  | COMPLEXITE    |
|  -----------------------|----------------------|-----------|---------------|
|  1. FairyBackground     | CSS + Framer Motion  | CRITIQUE  | Moyenne       |
|  2. MagicCard           | Framer Motion        | CRITIQUE  | Faible        |
|  3. MagicButton         | Framer + GSAP        | CRITIQUE  | Moyenne       |
|  4. AnswerIcon          | Framer Motion        | CRITIQUE  | Faible        |
|  5. MagicCounter        | GSAP                 | HAUTE     | Moyenne       |
|  6. CrownProgress       | SVG + GSAP           | HAUTE     | Moyenne       |
|  7. MagicLoader         | Lottie               | HAUTE     | Faible        |
|  8. MagicConfetti       | tsParticles          | HAUTE     | Faible        |
|  9. InputFocus          | CSS                  | MOYENNE   | Faible        |
|  10. ValidationFeedback | Framer Motion        | MOYENNE   | Faible        |
|  11. FocusIndicators    | CSS                  | A11Y      | Faible        |
|  12. ReducedMotion      | Hook                 | A11Y      | Faible        |
|                                                                             |
+=============================================================================+
```

### 5.2 Template Composant Effect

```typescript
// components/effects/MagicButton.tsx
/**
 * MagicButton - Bouton avec effet paillettes
 *
 * @priority P0 - Critique gameplay
 * @animation GSAP + Framer Motion
 * @a11y Touch target 48px, reduced motion support
 *
 * ISO/IEC 25010: Utilisabilite, Performance
 */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TIMING, type ThemeVariant } from '@/types/effects';
import { cn } from '@/lib/utils';

export interface MagicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ThemeVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const SPARKLE_COUNT = 8;

export function MagicButton({
  children,
  onClick,
  variant = 'princess',
  disabled = false,
  loading = false,
  className,
}: MagicButtonProps) {
  const [showSparkles, setShowSparkles] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleClick = useCallback(() => {
    if (disabled || loading) return;

    if (!reducedMotion) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), TIMING.celebration);
    }

    onClick?.();
  }, [disabled, loading, reducedMotion, onClick]);

  const variantStyles = {
    princess: 'from-pink-400 via-pink-500 to-purple-500',
    unicorn: 'from-purple-400 via-pink-400 to-blue-400',
    star: 'from-yellow-400 via-orange-400 to-pink-400',
    rainbow: 'from-red-400 via-yellow-400 to-blue-400',
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        // Base
        'relative px-8 py-4 rounded-2xl overflow-hidden',
        'font-bold text-lg text-white',
        // Gradient
        'bg-gradient-to-r',
        variantStyles[variant],
        // Touch target (A11Y)
        'min-h-[48px] min-w-[48px]',
        // Shadow
        'shadow-lg shadow-pink-500/25',
        // States
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className,
      )}
      whileHover={!reducedMotion ? { scale: 1.05 } : undefined}
      whileTap={!reducedMotion ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Sparkle particles */}
      <AnimatePresence>
        {showSparkles && !reducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
              <motion.span
                key={i}
                data-testid="sparkle-particle"
                className="absolute w-2 h-2 bg-yellow-200 rounded-full"
                initial={{
                  left: '50%',
                  top: '50%',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: TIMING.celebration / 1000 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Loading spinner */}
      {loading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.span>
      )}

      {/* Content */}
      <span className={cn('relative z-10', loading && 'opacity-0')}>
        {children}
      </span>
    </motion.button>
  );
}
```

---

## 6. GAMIFICATION COMPLETE

### 6.1 Systeme de Progression

```
+=============================================================================+
|                    SYSTEME GAMIFICATION                                     |
+=============================================================================+
|                                                                             |
|  NIVEAU 1: FEEDBACK IMMEDIAT (chaque question)                             |
|  =============================================                              |
|  +-- Bonne reponse: Confetti + son + "+1 etoile" animation                 |
|  +-- Mauvaise reponse: Shake doux + encouragement + correction             |
|  +-- Reponse rapide: Bonus "+2" avec effet special                         |
|                                                                             |
|  NIVEAU 2: SERIES (streaks)                                                |
|  =============================================                              |
|  +-- 3 bonnes reponses: "En feu!" + flamme animee                          |
|  +-- 5 bonnes reponses: "Super serie!" + effet rainbow                     |
|  +-- 10 bonnes reponses: "LEGENDAIRE!" + explosion confetti                |
|                                                                             |
|  NIVEAU 3: PROGRESSION SESSION                                             |
|  =============================================                              |
|  +-- Progress ring: Remplissage anime vers 100%                            |
|  +-- Couronne qui se complete piece par piece                              |
|  +-- Milestone: 25%, 50%, 75%, 100% avec celebrations                      |
|                                                                             |
|  NIVEAU 4: BADGES (13 badges total)                                        |
|  =============================================                              |
|  +-- Practice (8): Premiere etoile, Table maitrisee, etc.                  |
|  +-- Challenge (5): Champion du temps, Perfectionniste, etc.               |
|  +-- Animation unlock: Lottie badge + confetti + son                       |
|                                                                             |
|  NIVEAU 5: NIVEAUX UTILISATEUR                                             |
|  =============================================                              |
|  +-- XP par bonne reponse (10 XP) + bonus streak                           |
|  +-- Niveaux: Apprenti -> Ecuyer -> Chevalier -> Prince/Princesse          |
|  +-- Titre affiche avec couronne appropriee                                |
|                                                                             |
+=============================================================================+
```

### 6.2 Assets Lottie Requis

```
public/lottie/
|
+-- mascot/
|   +-- unicorn-idle.json        # Mascotte au repos (loop)
|   +-- unicorn-happy.json       # Bonne reponse
|   +-- unicorn-encourage.json   # Mauvaise reponse (encourageant)
|   +-- unicorn-celebrate.json   # Badge unlock
|
+-- feedback/
|   +-- star-burst.json          # Etoile qui explose
|   +-- heart-pop.json           # Coeur qui apparait
|   +-- sparkles.json            # Paillettes magiques
|
+-- badges/
|   +-- badge-unlock.json        # Animation deblocage
|   +-- badge-shine.json         # Effet brillance
|
+-- progress/
|   +-- crown-piece.json         # Piece de couronne
|   +-- level-up.json            # Montee de niveau
|
+-- loading/
    +-- magic-wand.json          # Chargement initial
```

---

## 7. PERFORMANCE BUDGET

### 7.1 Metriques Cibles

```
+=============================================================================+
|                    PERFORMANCE BUDGET                                       |
+=============================================================================+
|                                                                             |
|  METRIQUE               | CIBLE        | CRITIQUE     | MESURE             |
|  -----------------------|--------------|--------------|---------------------|
|  LCP (Largest Paint)    | < 2.5s       | < 4s         | Lighthouse          |
|  FID (First Input)      | < 100ms      | < 300ms      | Lighthouse          |
|  CLS (Layout Shift)     | < 0.1        | < 0.25       | Lighthouse          |
|  TTI (Time to Interactive) | < 3.5s    | < 7s         | Lighthouse          |
|  FPS Animations         | 60fps        | 30fps        | DevTools            |
|  Bundle Main            | < 100kB      | < 150kB      | next build          |
|  Bundle Total           | < 300kB      | < 500kB      | next build          |
|                                                                             |
+=============================================================================+
```

### 7.2 Strategies Optimisation

```typescript
// lib/animations/lottie-assets.ts
/**
 * Lazy loading Lottie avec preload strategique
 * ISO/IEC 25010 - Performance
 */
import dynamic from 'next/dynamic';

// Lazy load le player Lottie
export const LottiePlayer = dynamic(
  () => import('lottie-react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-pink-200 rounded-full w-16 h-16" />
  }
);

// Preload assets critiques
export async function preloadCriticalLottie() {
  const criticalAssets = [
    '/lottie/mascot/unicorn-idle.json',
    '/lottie/feedback/star-burst.json',
  ];

  await Promise.all(
    criticalAssets.map(url =>
      fetch(url, { priority: 'high' as RequestPriority })
    )
  );
}

// Loader lazy pour assets non-critiques
export function useLottieAsset(path: string) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Load seulement quand visible (Intersection Observer)
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetch(`/lottie/${path}`)
          .then(r => r.json())
          .then(setData);
        observer.disconnect();
      }
    });

    // ... setup observer
  }, [path]);

  return data;
}
```

---

## 8. ACCESSIBILITE WCAG 2.1 AA

### 8.1 Checklist Obligatoire

```
+=============================================================================+
|                    ACCESSIBILITE - NON NEGOCIABLE                          |
+=============================================================================+
|                                                                             |
|  ANIMATIONS                                                                |
|  ==========                                                                |
|  [x] Hook useReducedMotion() dans TOUS les composants animes              |
|  [x] Animations < 5 secondes (pas de loop infini visible)                 |
|  [x] Pas de flash > 3 fois/seconde                                        |
|  [x] Animations n'empechent pas l'interaction                             |
|                                                                             |
|  TOUCH TARGETS                                                             |
|  =============                                                             |
|  [x] Minimum 48x48px (44x44px WCAG + marge enfant)                        |
|  [x] Espacement 8px minimum entre elements cliquables                     |
|  [x] Zone de frappe etendue pour petits doigts                            |
|                                                                             |
|  FOCUS                                                                     |
|  =====                                                                     |
|  [x] Focus visible sur TOUS les elements interactifs                      |
|  [x] Focus ring rose/violet (theme)                                       |
|  [x] Navigation clavier complete (Tab, Enter, Escape)                     |
|                                                                             |
|  CONTRASTE                                                                 |
|  =========                                                                 |
|  [x] Ratio >= 4.5:1 pour texte normal                                     |
|  [x] Ratio >= 3:1 pour texte large (>= 18pt)                              |
|  [x] Ratio >= 3:1 pour elements graphiques                                |
|                                                                             |
|  SCREEN READER                                                             |
|  =============                                                             |
|  [x] aria-live="polite" pour score et feedback                            |
|  [x] aria-label sur tous les boutons icones                               |
|  [x] role="status" pour messages dynamiques                               |
|                                                                             |
+=============================================================================+
```

### 8.2 Hook Reduced Motion

```typescript
// hooks/useReducedMotion.ts
/**
 * Detecte preference utilisateur pour mouvement reduit
 * WCAG 2.1 - 2.3.3 Animation from Interactions
 */
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}
```

---

## 9. ROADMAP IMPLEMENTATION

### 9.1 Sprint 1 (Semaine 1-2): Fondation

```
OBJECTIF: Infrastructure + 6 composants P0

[ ] Setup styles/tokens.css + styles/animations.css
[ ] Setup types/effects.ts + types/badge.ts
[ ] Setup hooks/useReducedMotion.ts

[ ] TDD: FairyBackground
    [ ] RED: tests/unit/components/effects/FairyBackground.test.tsx
    [ ] GREEN: components/effects/FairyBackground.tsx
    [ ] REFACTOR: Optimisation performance

[ ] TDD: MagicCard
[ ] TDD: MagicButton
[ ] TDD: AnswerIcon
[ ] TDD: InputFocus (CSS)
[ ] TDD: FocusIndicators (CSS)
```

### 9.2 Sprint 2 (Semaine 3-4): Gamification

```
OBJECTIF: Feedback + progression + 6 composants P0 restants

[ ] TDD: MagicCounter
[ ] TDD: CrownProgress
[ ] TDD: MagicConfetti
[ ] TDD: MagicLoader (Lottie)
[ ] TDD: ValidationFeedback
[ ] TDD: ReducedMotion wrapper

[ ] Integration Lottie assets
[ ] Integration tsParticles
[ ] Setup systeme badges
```

### 9.3 Sprint 3 (Semaine 5-6): Game Logic

```
OBJECTIF: Logique jeu complete TDD

[ ] TDD: lib/game/questions.ts
[ ] TDD: lib/game/scoring.ts
[ ] TDD: lib/game/badges.ts
[ ] TDD: lib/game/streaks.ts

[ ] Integration composants game/
[ ] Page /practice complete
[ ] Page /challenge complete
```

### 9.4 Sprint 4 (Semaine 7-8): Auth + Polish

```
OBJECTIF: Auth TDD + P1 components

[ ] TDD: lib/auth/password.ts
[ ] TDD: lib/auth/session.ts
[ ] TDD: API routes auth

[ ] Composants P1 (15)
[ ] Tests E2E Playwright
[ ] Performance audit
[ ] Deploy production
```

---

## 10. DEFINITION OF DONE

### Chaque composant/feature est COMPLETE quand:

```
+=============================================================================+
|                    DEFINITION OF DONE                                       |
+=============================================================================+
|                                                                             |
|  TESTS (ISO 29119)                                                         |
|  =================                                                         |
|  [x] Tests unitaires ecrits AVANT le code (TDD)                            |
|  [x] Fixtures REELLES (pas de mock donnees)                                |
|  [x] Coverage >= 80%                                                       |
|  [x] Tous les tests passent                                                |
|                                                                             |
|  TYPES (ISO/IEC 5055)                                                      |
|  ====================                                                      |
|  [x] 0 erreur TypeScript                                                   |
|  [x] Types definis dans types/ (pas inline)                                |
|  [x] Pas de `as Type` (utiliser type guards)                               |
|  [x] Props interface documentee                                            |
|                                                                             |
|  CODE QUALITY                                                              |
|  ============                                                              |
|  [x] 0 warning ESLint                                                      |
|  [x] Prettier formate                                                      |
|  [x] Pas de TODO/FIXME                                                     |
|  [x] JSDoc sur exports publics                                             |
|                                                                             |
|  ACCESSIBILITE                                                             |
|  =============                                                              |
|  [x] useReducedMotion si anime                                             |
|  [x] Touch target >= 48px                                                  |
|  [x] Focus visible                                                         |
|  [x] aria-* appropries                                                     |
|                                                                             |
|  PERFORMANCE                                                               |
|  ===========                                                               |
|  [x] 60fps animations                                                      |
|  [x] Lazy load si > 5kB                                                    |
|  [x] Pas de re-render inutile                                              |
|                                                                             |
+=============================================================================+
```

---

## ANNEXES

### A. Commandes Utiles

```bash
# Developpement
npm run dev              # Serveur dev
npm run typecheck        # Verifier types
npm run lint             # ESLint
npm run format           # Prettier

# Tests
npm test                 # Vitest watch
npm run test:run         # Vitest CI
npm run test:coverage    # Coverage
npm run test:e2e         # Playwright

# Build
npm run build            # Production build
npm run start            # Serveur production

# Qualite
npm run quality:circular     # Dependances circulaires
npm run quality:duplication  # Code duplique
```

### B. Sources Documentation

- [EFFECTS_VISUAL_MAP.md](./EFFECTS_VISUAL_MAP.md) - Architecture 42 composants
- [EFFECTS_SPECIFICATIONS.md](./EFFECTS_SPECIFICATIONS.md) - Specs techniques
- [KIDS_ANIMATION_BEST_PRACTICES.md](./KIDS_ANIMATION_BEST_PRACTICES.md) - Guidelines UX
- [EFFECTS_CODE_EXAMPLES.md](./EFFECTS_CODE_EXAMPLES.md) - Code pret a copier
- [ICON_LIBRARIES_RESEARCH.md](./ICON_LIBRARIES_RESEARCH.md) - Bibliotheques recommandees

### C. References Externes

- [lottie-react](https://www.npmjs.com/package/lottie-react) - Animations Lottie
- [tsParticles](https://confetti.js.org/) - Confetti et particules
- [react-kawaii](https://react-kawaii.vercel.app/) - Illustrations mignonnes
- [LottieFiles](https://lottiefiles.com/free-animations/unicorn) - Assets gratuits

---

> **Document**: ULTRATHINK_ARCHITECTURE.md
> **Version**: 1.0.0
> **Auteur**: Claude
> **Date**: 2025-12-25
> **Statut**: APPROUVE - PRET POUR IMPLEMENTATION TDD
