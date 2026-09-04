# Exemples de Code - Effets Tables Magiques

> **Complément de**: EFFECTS_COMPONENTS_ANALYSIS.md
> **Usage**: Copy-paste ready components
> **Date**: 2025-12-25

---

## QUICK START - Configuration Initiale

### 1. Design Tokens (tokens.css)

```css
/* src/styles/tokens.css */
:root {
  /* === COULEURS PRINCESSE/LICORNE === */
  --princess-pink: #ffb6d9;
  --princess-pink-light: #ffe5f0;
  --unicorn-purple: #dda0dd;
  --unicorn-purple-light: #f0e5ff;
  --sky-blue: #87ceeb;
  --star-yellow: #ffd700;
  --mint-green: #b4e7ce;
  --pastel-yellow: #fff9c4;

  /* === GLOWS === */
  --glow-princess: 0 0 20px rgba(255, 182, 217, 0.6);
  --glow-unicorn: 0 0 30px rgba(221, 160, 221, 0.5);
  --glow-magic:
    0 0 40px rgba(255, 182, 217, 0.4), 0 0 80px rgba(221, 160, 221, 0.3);
  --glow-star: 0 0 25px rgba(255, 215, 0, 0.7);

  /* === GRADIENTS === */
  --gradient-fairy: linear-gradient(
    135deg,
    #ffb6d9 0%,
    #dda0dd 50%,
    #87ceeb 100%
  );

  --gradient-unicorn: linear-gradient(
    135deg,
    #ffb6d9 0%,
    #ffd4e5 14%,
    #e0bbe4 28%,
    #dda0dd 42%,
    #b4e7ce 57%,
    #87ceeb 71%,
    #fff9c4 100%
  );

  --gradient-princess: linear-gradient(135deg, #ffb6d9 0%, #dda0dd 100%);
  --gradient-success: linear-gradient(135deg, #b4e7ce 0%, #87ceeb 100%);

  /* === TIMING (plus lent pour enfants) === */
  --timing-instant: 100ms;
  --timing-fast: 200ms;
  --timing-normal: 400ms;
  --timing-celebration: 800ms;
  --timing-dramatic: 1200ms;

  /* === EASING === */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === SHADOWS === */
  --shadow-princess: 0 4px 20px rgba(255, 182, 217, 0.3);
  --shadow-unicorn: 0 4px 20px rgba(221, 160, 221, 0.3);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* === BORDERS === */
  --border-magic: 3px solid transparent;
  --border-radius-card: 24px;
  --border-radius-button: 16px;
}

/* Mode sombre (optionnel) */
.dark {
  --princess-pink: #ff69b4;
  --unicorn-purple: #ba55d3;
}

/* Accessibilité - Contraste élevé */
@media (prefers-contrast: high) {
  :root {
    --princess-pink: #ff1493;
    --unicorn-purple: #9932cc;
    --sky-blue: #1e90ff;
  }
}

/* Accessibilité - Réduction mouvement */
@media (prefers-reduced-motion: reduce) {
  :root {
    --timing-instant: 10ms;
    --timing-fast: 10ms;
    --timing-normal: 10ms;
    --timing-celebration: 10ms;
  }
}
```

---

### 2. Animations Globales (animations.css)

```css
/* src/styles/animations.css */

/* === SHIMMER (skeleton loading) === */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 182, 217, 0.1) 0%,
    rgba(255, 182, 217, 0.3) 50%,
    rgba(255, 182, 217, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}

/* === GRADIENT ANIMÉ (texte) === */
@keyframes gradient-x {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

/* === FLOAT (hover subtil) === */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* === GLOW PULSE === */
@keyframes glow-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 10px var(--princess-pink));
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 25px var(--princess-pink));
    opacity: 0.8;
  }
}

.animate-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* === SPARKLE (étoiles scintillantes) === */
@keyframes sparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(180deg);
  }
}

.animate-sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

/* === BOUNCE (rebond doux) === */
@keyframes bounce-soft {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-bounce-soft {
  animation: bounce-soft 1s ease-in-out infinite;
}

/* === SPIN (rotation) === */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* === WIGGLE (secousse douce) === */
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

.animate-wiggle {
  animation: wiggle 0.5s ease-in-out;
}
```

---

### 3. Hook Reduced Motion

```typescript
// src/hooks/useReducedMotion.ts
import { useMediaQuery } from './useMediaQuery';

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

---

## COMPOSANTS PRIORITAIRES (P0)

### 1. FairyBackground.tsx

```typescript
// src/components/effects/FairyBackground.tsx
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function FairyBackground() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    // Version statique si reduced motion
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-purple-50 to-pink-50" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Nuage Rose Princesse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-40 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #FFB6D9 0%, #FFE5F0 100%)',
        }}
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ top: '10%', left: '-5%' }}
      />

      {/* Nuage Violet Licorne */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-35 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, #DDA0DD 0%, #F0E5FF 100%)',
        }}
        animate={{
          x: [0, -100, 70, 0],
          y: [0, 80, -50, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 8,
        }}
        initial={{ top: '50%', right: '0%' }}
      />

      {/* Nuage Bleu Ciel */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, #87CEEB 0%, #E0F7FF 100%)',
        }}
        animate={{
          x: [0, 60, -80, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
        initial={{ bottom: '15%', left: '35%' }}
      />

      {/* Étoiles scintillantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-200 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
```

---

### 2. MagicCard.tsx

```typescript
// src/components/effects/MagicCard.tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children: React.ReactNode;
  variant?: 'princess' | 'unicorn' | 'star';
  glow?: boolean;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const cardVariants = {
  princess: {
    bg: 'bg-pink-50/60',
    border: 'border-pink-200',
    shadow: 'shadow-[0_8px_32px_rgba(255,182,217,0.3)]',
    hoverShadow: '0 12px 48px rgba(255,182,217,0.5)',
  },
  unicorn: {
    bg: 'bg-purple-50/60',
    border: 'border-purple-200',
    shadow: 'shadow-[0_8px_32px_rgba(221,160,221,0.3)]',
    hoverShadow: '0 12px 48px rgba(221,160,221,0.5)',
  },
  star: {
    bg: 'bg-yellow-50/60',
    border: 'border-yellow-200',
    shadow: 'shadow-[0_8px_32px_rgba(255,215,0,0.3)]',
    hoverShadow: '0 12px 48px rgba(255,215,0,0.5)',
  },
};

export function MagicCard({
  children,
  variant = 'princess',
  glow = true,
  hover = true,
  className,
  onClick,
}: MagicCardProps) {
  const config = cardVariants[variant];

  return (
    <motion.div
      className={cn(
        'relative rounded-[24px] p-6',
        config.bg,
        'backdrop-blur-md',
        'border-3',
        config.border,
        glow && config.shadow,
        'transition-shadow duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={
        hover
          ? {
              scale: 1.02,
              boxShadow: config.hoverShadow,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={
        onClick
          ? {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
```

---

### 3. MagicButton.tsx

```typescript
// src/components/effects/MagicButton.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MagicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'princess' | 'unicorn' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const buttonVariants = {
  princess: 'bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400',
  unicorn: 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400',
  success: 'bg-gradient-to-r from-green-400 via-blue-400 to-green-400',
};

const sizeClasses = {
  sm: 'px-6 py-2 text-base',
  md: 'px-8 py-4 text-lg',
  lg: 'px-10 py-5 text-xl',
};

export function MagicButton({
  children,
  onClick,
  variant = 'princess',
  size = 'md',
  disabled = false,
  className,
}: MagicButtonProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (disabled) return;

    setClicked(true);
    setTimeout(() => setClicked(false), 600);
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative rounded-full overflow-hidden',
        buttonVariants[variant],
        sizeClasses[size],
        'text-white font-bold',
        'shadow-lg',
        'transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.05,
              boxShadow: '0 15px 40px rgba(255, 182, 217, 0.4)',
            }
      }
      whileTap={disabled ? undefined : { scale: 0.95 }}
    >
      {/* Effet paillettes au clic */}
      {clicked && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: '-50%', y: '-50%' }}
              animate={{
                scale: [0, 1.5, 0],
                x: `${(Math.random() - 0.5) * 200}%`,
                y: `${(Math.random() - 0.5) * 200}%`,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              {['⭐', '✨', '💫'][Math.floor(Math.random() * 3)]}
            </motion.span>
          ))}
        </div>
      )}

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
```

---

### 4. AnswerIcon.tsx

```typescript
// src/components/effects/AnswerIcon.tsx
import { motion, AnimatePresence } from 'framer-motion';

type AnswerState = 'waiting' | 'checking' | 'correct' | 'incorrect';

interface AnswerIconProps {
  state: AnswerState;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function AnswerIcon({ state, size = 'md' }: AnswerIconProps) {
  const icons = {
    waiting: (
      <motion.div
        className={cn(sizes[size], 'rounded-full border-3 border-pink-300')}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    ),

    checking: (
      <motion.div
        className={cn(sizes[size], 'rounded-full border-3 border-purple-400')}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    ),

    correct: (
      <motion.svg viewBox="0 0 24 24" className={cn(sizes[size], 'text-yellow-400')}>
        {/* Étoile magique */}
        <motion.path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        />
        {/* Glow */}
        <motion.circle
          cx={12}
          cy={12}
          r={12}
          fill="currentColor"
          opacity={0.2}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 0] }}
          transition={{ duration: 0.6 }}
        />
      </motion.svg>
    ),

    incorrect: (
      <motion.div
        className={cn(
          sizes[size],
          'rounded-full flex items-center justify-center',
          'bg-pink-100 text-pink-500'
        )}
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          rotate: [0, -5, 5, -5, 5, 0],
        }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-lg">💭</span>
      </motion.div>
    ),
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {icons[state]}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### 5. MagicCounter.tsx

```typescript
// src/components/effects/MagicCounter.tsx
import { useSpring, animated } from '@react-spring/web';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MagicCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  showParticles?: boolean;
}

export function MagicCounter({
  value,
  suffix = ' étoiles',
  prefix = '',
  showParticles = true,
}: MagicCounterProps) {
  const [prevValue, setPrevValue] = useState(value);
  const isIncreasing = value > prevValue;

  const { number } = useSpring({
    from: { number: prevValue },
    to: { number: value },
    config: { duration: 1500 },
    onRest: () => setPrevValue(value),
  });

  return (
    <div className="relative inline-block">
      {/* Particules quand augmentation */}
      {showParticles && isIncreasing && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={`${value}-${i}`}
              className="absolute text-3xl"
              style={{
                left: `${(i - 2) * 20}px`,
              }}
              initial={{ y: 0, opacity: 1, scale: 0 }}
              animate={{
                y: -40,
                opacity: 0,
                scale: 1.5,
              }}
              transition={{
                delay: i * 0.1,
                duration: 0.8,
                ease: 'easeOut',
              }}
            >
              {['⭐', '✨', '💫', '🌟'][i % 4]}
            </motion.span>
          ))}
        </div>
      )}

      {/* Compteur */}
      <motion.div
        className="text-4xl font-bold"
        animate={
          isIncreasing
            ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 },
              }
            : undefined
        }
      >
        <span className="text-purple-600">
          {prefix}
          <animated.span>
            {number.to((n) => Math.floor(n).toLocaleString('fr-FR'))}
          </animated.span>
        </span>
        <span className="text-2xl text-pink-400 ml-1">{suffix}</span>
      </motion.div>
    </div>
  );
}
```

---

### 6. CrownProgress.tsx

```typescript
// src/components/effects/CrownProgress.tsx
import { motion } from 'framer-motion';

interface CrownProgressProps {
  progress: number; // 0-100
  size?: number;
}

export function CrownProgress({ progress, size = 128 }: CrownProgressProps) {
  const radius = (size - 24) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          {/* Gradient couronne */}
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB6D9" />
            <stop offset="50%" stopColor="#DDA0DD" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>

          {/* Filtre glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 182, 217, 0.2)"
          strokeWidth={12}
        />

        {/* Progression avec glow */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#crownGradient)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#glow)"
        />
      </svg>

      {/* Contenu centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Couronne emoji */}
        <motion.span
          className="text-5xl mb-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          👑
        </motion.span>

        {/* Pourcentage */}
        <motion.span
          className="text-2xl font-bold text-purple-600"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}
```

---

## USAGE EXAMPLES

### Exemple Page Exercice

```typescript
// src/pages/ExercisePage.tsx
import { useState } from 'react';
import { FairyBackground } from '@/components/effects/FairyBackground';
import { MagicCard } from '@/components/effects/MagicCard';
import { MagicButton } from '@/components/effects/MagicButton';
import { AnswerIcon } from '@/components/effects/AnswerIcon';
import { MagicCounter } from '@/components/effects/MagicCounter';
import { CrownProgress } from '@/components/effects/CrownProgress';

export function ExercisePage() {
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [answerState, setAnswerState] = useState<'waiting' | 'correct' | 'incorrect'>('waiting');

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setAnswerState('correct');
      setScore(prev => prev + 10);
      setProgress(prev => Math.min(prev + 10, 100));
    } else {
      setAnswerState('incorrect');
    }

    setTimeout(() => setAnswerState('waiting'), 1000);
  };

  return (
    <div className="min-h-screen relative">
      {/* Fond magique */}
      <FairyBackground />

      {/* Contenu */}
      <div className="relative z-10 container mx-auto p-6">
        {/* Header avec score et progression */}
        <div className="flex justify-between items-center mb-8">
          <MagicCounter value={score} />
          <CrownProgress progress={progress} />
        </div>

        {/* Question */}
        <MagicCard variant="princess" className="mb-6">
          <h2 className="text-3xl font-bold text-center text-purple-600 mb-4">
            Combien font 7 × 8 ?
          </h2>

          <div className="flex items-center justify-center gap-4">
            <input
              type="number"
              className="text-4xl text-center w-32 p-4 rounded-2xl border-4 border-pink-200"
            />
            <AnswerIcon state={answerState} size="lg" />
          </div>
        </MagicCard>

        {/* Boutons réponse (exemple) */}
        <div className="flex gap-4 justify-center">
          <MagicButton onClick={() => handleAnswer(false)}>54</MagicButton>
          <MagicButton variant="success" onClick={() => handleAnswer(true)}>
            56
          </MagicButton>
          <MagicButton onClick={() => handleAnswer(false)}>64</MagicButton>
        </div>
      </div>
    </div>
  );
}
```

---

## PROCHAINES ETAPES

1. **Copier les tokens.css et animations.css** dans votre projet
2. **Installer les dépendances**:
   ```bash
   npm install framer-motion @react-spring/web canvas-confetti
   ```
3. **Créer les composants** dans l'ordre P0 → P1 → P2
4. **Tester avec enfants** 9 ans pour ajuster timing/intensité

---

> **Document**: EFFECTS_CODE_EXAMPLES.md
> **Status**: Ready to use
> **Testé**: Non - À valider avec utilisateurs cibles
