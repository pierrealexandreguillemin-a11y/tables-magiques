# EFFETS & ANIMATIONS - TABLES MAGIQUES

> **Document**: Specifications techniques des effets visuels et animations
> **Inspirations**: Khan Academy Kids, Duolingo Kids, DragonBox, Funexpected Math
> **Standards**: WCAG 2.1 AA, ISO 9241-210 (Child-Centred Design)
> **Cible**: Enfant 9 ans, theme princesse/licorne
> **Date**: 2025-12-25

---

## TABLE DES MATIERES

1. [PHILOSOPHIE DESIGN](#1-philosophie-design)
2. [PALETTE EFFETS](#2-palette-effets)
3. [EFFETS PAR CONTEXTE](#3-effets-par-contexte)
4. [COMPOSANTS ANIMES](#4-composants-animes)
5. [CELEBRATIONS & RECOMPENSES](#5-celebrations--recompenses)
6. [FEEDBACK JEU](#6-feedback-jeu)
7. [TRANSITIONS](#7-transitions)
8. [ACCESSIBILITE](#8-accessibilite)
9. [PERFORMANCE](#9-performance)

---

## 1. PHILOSOPHIE DESIGN

### Principes Directeurs

```
TABLES MAGIQUES - DESIGN ENFANT

"Chaque bonne reponse est une victoire a celebrer"

 ENCOURAGEANT: Feedback positif immediat, jamais punitif
 MAGIQUE: Effets feerie (etoiles, paillettes, licornes)
 REACTIF: Feedback < 100ms (attention enfant)
 ACCESSIBLE: Touch targets 48px min, animations douces
 PERFORMANT: 60fps sur tablette, pas de freeze
```

### Inspirations Recherchees

| App                   | Element a reprendre                          |
| --------------------- | -------------------------------------------- |
| **Khan Academy Kids** | Celebrations avec personnages, sons positifs |
| **Duolingo Kids**     | Boutons larges, feedback visuel clair        |
| **DragonBox**         | Animations fluides, recompenses progressives |
| **Funexpected Math**  | Effets magiques, theme fantaisie             |

---

## 2. PALETTE EFFETS

### Design Tokens

```css
:root {
  /* Couleurs Princesse */
  --princess-pink: #ff69b4; /* Hot Pink */
  --princess-purple: #ba55d3; /* Medium Orchid */
  --princess-gold: #ffd700; /* Or */
  --unicorn-rainbow: linear-gradient(
    90deg,
    #ff69b4,
    #ba55d3,
    #87ceeb,
    #98fb98,
    #ffd700
  );

  /* Glows Feerie */
  --glow-star: 0 0 20px rgba(255, 215, 0, 0.6);
  --glow-magic: 0 0 30px rgba(255, 105, 180, 0.4);
  --glow-success: 0 0 25px rgba(50, 205, 50, 0.5);

  /* Timing adapte enfant */
  --timing-instant: 100ms; /* Feedback immediat */
  --timing-fast: 200ms; /* Micro-interactions */
  --timing-normal: 400ms; /* Transitions */
  --timing-celebration: 800ms; /* Animations victoire */

  /* Easing joyeux */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. EFFETS PAR CONTEXTE

### 3.1 Page Login

| Zone                | Effet                               | Priorite |
| ------------------- | ----------------------------------- | -------- |
| Background          | Aurora blobs roses/violets (subtil) | P1       |
| Logo                | Pulse doux avec glow                | P2       |
| Input focus         | Border gradient + glow pink         | P1       |
| Bouton login        | Scale on tap + ripple               | P1       |
| Transition vers jeu | Fade + scale out                    | P1       |

### 3.2 Menu Principal

| Zone          | Effet                            | Priorite |
| ------------- | -------------------------------- | -------- |
| Boutons modes | Hover glow + scale 1.05          | P0       |
| Icones        | Bounce subtle on appear          | P1       |
| Background    | Etoiles flottantes (tres subtil) | P2       |
| Navigation    | Slide transition entre pages     | P1       |

### 3.3 Mode Practice

| Zone             | Effet                         | Priorite |
| ---------------- | ----------------------------- | -------- |
| Question appear  | Fade in + scale spring        | P0       |
| NumberPad keys   | Tap feedback (scale + ripple) | P0       |
| Bonne reponse    | Confetti + etoiles + son      | P0       |
| Mauvaise reponse | Shake doux + encouragement    | P0       |
| Score counter    | Number animation increment    | P1       |
| Streak indicator | Flammes progressives          | P1       |
| Badge unlock     | Modal celebration             | P0       |

### 3.4 Mode Challenge

| Zone                | Effet                          | Priorite |
| ------------------- | ------------------------------ | -------- |
| Countdown start     | 3-2-1 scale animation          | P0       |
| Timer               | Pulse quand < 30s, rouge < 10s | P0       |
| Question transition | Slide rapide                   | P0       |
| Reponse correcte    | Flash vert + "+1" float        | P0       |
| Reponse incorrecte  | Flash rouge rapide             | P0       |
| Fin temps           | Explosion finale + resultats   | P0       |

### 3.5 Collection Badges

| Zone            | Effet                     | Priorite |
| --------------- | ------------------------- | -------- |
| Badge grid      | Stagger reveal on load    | P1       |
| Badge unlocked  | Glow + rotation 3D subtle | P1       |
| Badge locked    | Grayscale + lock icon     | P1       |
| Badge hover/tap | Scale + sparkles          | P1       |
| New badge       | Bounce + notification dot | P0       |

---

## 4. COMPOSANTS ANIMES

### 4.1 NumberPad (Clavier Tactile)

```
EFFET: Touches avec feedback tactile visuel

+---+---+---+
| 1 | 2 | 3 |  <- Chaque touche:
+---+---+---+     - Scale 0.95 on press
| 4 | 5 | 6 |     - Ripple effect pink
+---+---+---+     - Glow momentane
| 7 | 8 | 9 |
+---+---+---+
    | 0 |
    +---+

Touch target: 64px minimum (enfant)
```

**Implementation:**

```tsx
// components/game/NumberPad.tsx
import { motion } from 'framer-motion';

export function NumberKey({ digit, onPress }: Props) {
  return (
    <motion.button
      className="w-16 h-16 rounded-2xl bg-white/10
                 text-3xl font-bold text-white
                 border-2 border-pink-300/30"
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,105,180,0.2)' }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => onPress(digit)}
    >
      {digit}
    </motion.button>
  );
}
```

### 4.2 QuestionDisplay

```
EFFET: Question qui apparait avec magie

    7 x 8 = ?

  Apparition: Scale from 0.5 + fade + blur
  Spring physics pour effet "pop"
  Glow subtil autour des chiffres
```

**Implementation:**

```tsx
// components/game/QuestionDisplay.tsx
import { motion, AnimatePresence } from 'framer-motion';

export function QuestionDisplay({ a, b, questionId }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionId}
        initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.2, filter: 'blur(5px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-5xl font-bold text-white text-center"
      >
        <span className="text-pink-300">{a}</span>
        <span className="mx-4">×</span>
        <span className="text-purple-300">{b}</span>
        <span className="mx-4">=</span>
        <span className="text-yellow-300">?</span>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 4.3 Timer (Mode Challenge)

```
EFFET: Timer avec urgence progressive

  NORMAL (> 30s):   [████████████] 2:45
                    Vert, pulse subtil

  WARNING (< 30s):  [████████░░░░] 0:28
                    Orange, pulse accelere

  DANGER (< 10s):   [███░░░░░░░░░] 0:08
                    Rouge, shake + pulse rapide
```

**Implementation:**

```tsx
// components/game/Timer.tsx
export function Timer({ seconds, total }: Props) {
  const percentage = (seconds / total) * 100;
  const isWarning = seconds <= 30;
  const isDanger = seconds <= 10;

  return (
    <motion.div
      animate={
        isDanger
          ? {
              x: [0, -2, 2, -2, 0],
              scale: [1, 1.02, 1],
            }
          : {}
      }
      transition={{ duration: 0.3, repeat: isDanger ? Infinity : 0 }}
      className={cn(
        'text-2xl font-mono font-bold',
        isDanger && 'text-red-400',
        isWarning && !isDanger && 'text-orange-400',
        !isWarning && 'text-green-400'
      )}
    >
      <motion.span
        animate={{ opacity: isDanger ? [1, 0.5, 1] : 1 }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {formatTime(seconds)}
      </motion.span>
    </motion.div>
  );
}
```

### 4.4 Badge Component

```
EFFET: Badge avec etat (locked/unlocked/new)

  LOCKED:     [  ]     Gris, icone cadenas, opacity 50%

  UNLOCKED:   [ ]     Couleur, glow subtil, hover scale

  NEW:        [!]     Bounce, particules, notification

  Animation unlock: Scale 0->1.2->1 + rotation + confetti
```

---

## 5. CELEBRATIONS & RECOMPENSES

### 5.1 Bonne Reponse - Celebration

```
EFFET: Explosion de joie pour chaque bonne reponse

     *  *    *  *
   *     *  *     *
  *   BRAVO!   *
   *     *  *     *
     *  *    *  *

  1. Flash vert sur l'ecran (100ms)
  2. Checkmark anime (path draw)
  3. Confetti burst (50-100 particules)
  4. "+1" qui flotte vers le haut
  5. Score increment anime

  Son: Ding positif
```

**Implementation:**

```tsx
// components/animations/CorrectAnswer.tsx
import confetti from 'canvas-confetti';

export function celebrateCorrect() {
  // Couleurs princesse
  const colors = ['#ff69b4', '#ba55d3', '#ffd700', '#87ceeb'];

  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors,
    shapes: ['star', 'circle'],
    scalar: 1.2,
  });
}

export function CorrectFeedback() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.3, 1], opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Checkmark */}
      <motion.svg viewBox="0 0 50 50" className="w-24 h-24 text-green-400">
        <motion.path
          d="M14 27 L22 35 L37 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  );
}
```

### 5.2 Mauvaise Reponse - Encouragement

```
EFFET: Feedback doux, jamais punitif

  1. Shake horizontal leger (3 oscillations)
  2. Border rouge momentane
  3. Message encourageant: "Essaie encore!"
  4. Reset input avec fade

  PAS de: Son negatif fort, animation aggressive, message decourageant
```

**Implementation:**

```tsx
// components/animations/WrongAnswer.tsx
export function WrongFeedback({ onRetry }: Props) {
  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, -8, 8, -8, 8, 0] }}
      transition={{ duration: 0.4 }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-pink-300 text-xl"
      >
        Presque! Essaie encore
      </motion.p>
    </motion.div>
  );
}
```

### 5.3 Badge Unlock - Grande Celebration

```
EFFET: Deblocage de badge = moment magique

  1. Overlay sombre (focus attention)
  2. Badge apparait au centre (scale 0 -> 1.5 -> 1)
  3. Explosion de confetti/etoiles
  4. Halo lumineux pulse autour du badge
  5. Texte "Nouveau Badge!" avec gradient
  6. Nom du badge en dessous
  7. Bouton "Super!" pour fermer

  Duree totale: 3-4 secondes
  Son: Fanfare joyeuse
```

**Implementation:**

```tsx
// components/animations/BadgeUnlock.tsx
export function BadgeUnlockModal({ badge, onClose }: Props) {
  useEffect(() => {
    // Confetti special badges
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff69b4', '#ffd700'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ba55d3', '#87ceeb'],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center"
      >
        {/* Badge Icon */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(255,105,180,0.5)',
              '0 0 40px rgba(255,105,180,0.8)',
              '0 0 20px rgba(255,105,180,0.5)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          {badge.icon}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400
                     bg-clip-text text-transparent"
        >
          Nouveau Badge!
        </motion.h2>

        {/* Badge name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-white mt-2"
        >
          {badge.name}
        </motion.p>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500
                     rounded-full text-white font-bold text-xl"
        >
          Super!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
```

### 5.4 Streak Flames (Serie de bonnes reponses)

```
EFFET: Flammes qui grandissent avec la serie

  Streak 1-2:   (petite flamme orange)
  Streak 3-4:   (flamme moyenne)
  Streak 5-9:   (grande flamme rouge)
  Streak 10+:   (flamme arc-en-ciel + particules)
```

### 5.5 Feux d'Artifice (Fin de session parfaite)

```
EFFET: Celebration maximale pour 100% de bonnes reponses

  Multiple bursts de confetti
  Etoiles tombantes
  Message "PARFAIT!" avec gradient anime
  Badge special "Super Championne"
```

---

## 6. FEEDBACK JEU

### 6.1 Score Increment

```tsx
// Animated counter for score
import { useSpring, animated } from '@react-spring/web';

export function AnimatedScore({ value }: { value: number }) {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration: 500 },
  });

  return (
    <animated.span className="text-4xl font-bold text-yellow-400">
      {number.to((n) => Math.floor(n))}
    </animated.span>
  );
}
```

### 6.2 Progress Bar

```
EFFET: Barre de progression avec couleur dynamique

  [████████████░░░░░░░░]  60%

  - Fill anime de gauche a droite
  - Gradient pink -> purple
  - Glow subtil sur le bord
  - Pourcentage qui suit
```

### 6.3 Loading States

```tsx
// Skeleton adapte enfant (plus colore)
export function GameSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 bg-pink-200/20 rounded-2xl" />
      <div className="h-32 bg-purple-200/20 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-16 bg-pink-200/20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

---

## 7. TRANSITIONS

### 7.1 Navigation entre Pages

```
Transition: Fade + Slide

  Menu -> Practice:  Slide left + fade
  Menu -> Challenge: Slide left + fade
  Game -> Results:   Fade through
  Results -> Menu:   Slide right + fade

  Duree: 300ms
  Easing: spring
```

**Implementation:**

```tsx
// components/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export function PageTransition({ children, key }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 7.2 Modal Transitions

```
Ouverture modal:
  1. Overlay fade in (200ms)
  2. Modal scale from 0.8 + fade (300ms)

Fermeture modal:
  1. Modal scale to 0.9 + fade out (200ms)
  2. Overlay fade out (200ms)
```

---

## 8. ACCESSIBILITE

### 8.1 Reduced Motion

```tsx
// hooks/useReducedMotion.ts
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

// Utilisation obligatoire
function AnimatedComponent({ children }: Props) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div>{children}</div>; // Version statique
  }

  return <motion.div {...animationProps}>{children}</motion.div>;
}
```

### 8.2 Touch Targets

```css
/* Taille minimum pour enfants */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
}

/* Pour les boutons principaux du jeu */
.game-button {
  min-width: 64px;
  min-height: 64px;
}
```

### 8.3 Focus Indicators

```css
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px #0d1117,
    0 0 0 5px #ff69b4;
}
```

---

## 9. PERFORMANCE

### 9.1 Lazy Loading

```tsx
// Confetti charge uniquement quand necessaire
const Confetti = lazy(() => import('./Confetti'));

function GameContainer() {
  const [showCelebration, setShowCelebration] = useState(false);

  return (
    <>
      <Game onCorrect={() => setShowCelebration(true)} />
      <Suspense fallback={null}>{showCelebration && <Confetti />}</Suspense>
    </>
  );
}
```

### 9.2 Animation Performance Checklist

- [ ] Utiliser `transform` et `opacity` uniquement
- [ ] Eviter `width`, `height`, `top`, `left` animes
- [ ] `will-change` seulement quand necessaire
- [ ] Tester sur tablette/mobile low-end
- [ ] Limiter particules confetti (< 100)
- [ ] Desactiver animations si battery saver

### 9.3 Bundle Strategy

```
Core (charge immediatement):
 framer-motion (tree-shaken)  ~18kB gzip

Lazy (charge a la demande):
 canvas-confetti              ~5kB gzip
 @react-spring/web           ~10kB gzip (counters)
 gsap (optionnel)            ~25kB gzip
```

---

## ANNEXE: CHEATSHEET ANIMATIONS TABLES MAGIQUES

### Framer Motion - Patterns frequents

```tsx
// 1. Feedback bouton
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
/>

// 2. Apparition element
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// 3. Shake erreur
animate={{ x: [0, -10, 10, -10, 10, 0] }}
transition={{ duration: 0.4 }}

// 4. Pulse continu
animate={{ scale: [1, 1.05, 1] }}
transition={{ duration: 1, repeat: Infinity }}

// 5. Path draw (checkmark)
initial={{ pathLength: 0 }}
animate={{ pathLength: 1 }}
transition={{ duration: 0.5 }}
```

### Couleurs Celebration

```typescript
const CELEBRATION_COLORS = {
  confetti: ['#ff69b4', '#ba55d3', '#ffd700', '#87ceeb', '#98fb98'],
  success: '#32cd32',
  warning: '#ffa500',
  streak: ['#ff6b35', '#ff4500', '#ff0000', 'rainbow'],
};
```

---

> **Document**: EFFECTS_SPECIFICATIONS.md
> **Version**: 1.0.0
> **Adapte de**: Miami Chess Effects pour contexte jeu enfant
