# MATRICE DE PRIORISATION DES EFFETS - TABLES MAGIQUES

> **Document**: Strategie complete effets/animations pour jeu educatif enfant
> **Cible**: Enfant 9 ans, theme princesse/licorne
> **Methode**: Analyse EFFECTS_ULTRA_MODERN_SPECIFICATIONS.md + Recherche industrie + Best practices
> **Date**: 2025-12-25
> **Version**: 2.0 (Consolidation complete)

---

## EXECUTIVE SUMMARY

```
TABLES MAGIQUES - STRATEGIE EFFETS & ANIMATIONS

PHILOSOPHIE: "Chaque bonne reponse est une victoire a celebrer"
INSPIRATIONS: Khan Academy Kids + Duolingo + DragonBox + Funexpected
DIFFERENCIATEUR: Celebrations magiques et feedback positif constant

ANALYSE COMPOSANTS:
 Source: EFFECTS_ULTRA_MODERN_SPECIFICATIONS.md (3909 lignes)
 Retenus: 42/58 composants (72% applicables)
 Exclus: 16 composants (trop complexes ou inadaptes enfants)

HIERARCHIE:
 TIER 1 - FONDATION (P0)    | 12 composants | Impact: GAMEPLAY CRITIQUE
 TIER 2 - MOTIVATION (P1)   | 15 composants | Impact: RECOMPENSES
 TIER 3 - POLISH (P2)       | 10 composants | Impact: FINITION UX
 TIER 4 - BONUS (P3)        |  5 composants | Impact: EXTRAS

BUDGET PERFORMANCE:
 Bundle immediat: ~26kB gzip (framer-motion + react-icons)
 Bundle lazy: ~23kB gzip (confetti + lottie + react-spring)
 Total max: ~49kB gzip
 FPS cible: 30fps minimum sur tablette
 Temps reponse: <100ms pour feedback
```

---

## 1. PRINCIPES FONDAMENTAUX - ENFANT 9 ANS

### 1.1 Regles UX Non-Negociables

| Principe                      | Specification                          | Source                    |
| ----------------------------- | -------------------------------------- | ------------------------- |
| **Feedback CHAQUE action**    | Reponse visuelle + audio pour tout tap | Nielsen Norman Group      |
| **Jamais de rouge punitif**   | Rose doux (#FFB6D9) meme pour erreurs  | Khan Academy Kids         |
| **Animations 200-500ms**      | Sauf celebrations (800ms max)          | NN/G Animation Guidelines |
| **Touch targets 64px**        | Doigts enfants moins precis            | WCAG 2.1 AA               |
| **Texte minimum 16px**        | Lisibilite ecran tablette              | Best practices            |
| **Animations interruptibles** | Skip disponible apres 3 vues           | Duolingo pattern          |
| **prefers-reduced-motion**    | Respect obligatoire                    | Accessibilite             |

### 1.2 Timings Animation par Type

| Type              | Duree           | Contexte              |
| ----------------- | --------------- | --------------------- |
| Micro-interaction | 100-200ms       | Tap bouton, hover     |
| Transition UI     | 200-300ms       | Navigation, modals    |
| Feedback reponse  | 300-400ms       | Correct/incorrect     |
| Celebration       | 500-800ms       | Niveau termine, badge |
| Animation idle    | Infini (subtil) | Background, attente   |

### 1.3 Palette Couleurs Princesse

```css
:root {
  /* Couleurs principales */
  --princess-pink: #ffb6d9;
  --unicorn-purple: #dda0dd;
  --sky-blue: #87ceeb;
  --star-gold: #ffd700;
  --mint-green: #b4e7ce;

  /* Glows */
  --glow-princess: 0 0 20px rgba(255, 182, 217, 0.6);
  --glow-unicorn: 0 0 30px rgba(221, 160, 221, 0.5);
  --glow-magic:
    0 0 40px rgba(255, 182, 217, 0.4), 0 0 80px rgba(221, 160, 221, 0.3);

  /* Gradients */
  --gradient-fairy: linear-gradient(
    135deg,
    #ffb6d9 0%,
    #dda0dd 50%,
    #87ceeb 100%
  );
  --gradient-unicorn: linear-gradient(
    135deg,
    #ffb6d9,
    #e0bbe4,
    #dda0dd,
    #b4e7ce,
    #87ceeb,
    #fff9c4
  );

  /* Timings adaptes enfants */
  --timing-instant: 100ms;
  --timing-fast: 200ms;
  --timing-normal: 400ms;
  --timing-celebration: 800ms;
}
```

---

## 2. TIER 1 - FONDATION (P0) - GAMEPLAY CRITIQUE

### 2.1 Liste Composants Critiques

| #   | Composant          | Page(s)             | Description                                  | Effort |
| --- | ------------------ | ------------------- | -------------------------------------------- | ------ |
| 1   | FairyBackground    | Global              | Nuages roses/violets + etoiles scintillantes | Moyen  |
| 2   | MagicCard          | Practice, Challenge | Cartes glassmorphism rose/violet             | Faible |
| 3   | MagicButton        | Tous                | Bouton validation avec paillettes au clic    | Moyen  |
| 4   | AnswerIcon         | Practice, Challenge | Morphing waiting -> star (succes)            | Faible |
| 5   | MagicCounter       | Score display       | Animation compteur avec particules           | Moyen  |
| 6   | CrownProgress      | Progression         | Anneau progression couronne                  | Moyen  |
| 7   | MagicLoader        | Global              | Loader licorne + etoiles dansantes           | Faible |
| 8   | MagicConfetti      | Succes              | Explosion confetti princesse                 | Faible |
| 9   | InputFocus         | Reponse             | Bordure magique au focus                     | Faible |
| 10  | ReducedMotion      | Global              | Hook accessibilite                           | Faible |
| 11  | ValidationFeedback | Reponse             | Feedback instantane correct/incorrect        | Faible |
| 12  | TimerAnimation     | Challenge           | Pulse + couleur selon temps restant          | Moyen  |

### 2.2 Code Reference - Composants P0

```tsx
// components/effects/FairyBackground.tsx
export function FairyBackground() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion)
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-purple-50 to-pink-50" />
    );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Nuage Rose */}
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
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        initial={{ top: '10%', left: '-5%' }}
      />
      {/* Nuage Violet */}
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
      {/* Etoiles scintillantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-200 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
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

```tsx
// components/effects/MagicConfetti.tsx
import confetti from 'canvas-confetti';

export async function fireMagicConfetti() {
  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#FFB6D9', '#DDA0DD', '#87CEEB', '#FFD700'],
    shapes: ['star', 'circle'],
    scalar: 1.5,
  });
}
```

```tsx
// components/effects/MagicLoader.tsx
export function MagicLoader() {
  return (
    <motion.div className="fixed inset-0 bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center z-[9999]">
      <motion.div
        className="text-9xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🦄
      </motion.div>
      <div className="flex gap-3 mt-8">
        {['⭐', '✨', '💫', '🌟', '⭐'].map((emoji, i) => (
          <motion.span
            key={i}
            className="text-4xl"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      <motion.p className="mt-6 text-purple-600 text-xl font-bold">
        Preparation des tables magiques... ✨
      </motion.p>
    </motion.div>
  );
}
```

### 2.3 Dependances NPM Tier 1

```json
{
  "dependencies": {
    "framer-motion": "^11.15.0"
  },
  "optionalDependencies": {
    "canvas-confetti": "^1.9.3"
  }
}
```

**Bundle Impact**: ~23kB gzip

---

## 3. TIER 2 - MOTIVATION (P1) - RECOMPENSES

### 3.1 Liste Composants Motivation

| #   | Composant             | Page(s)             | Description                               | Effort |
| --- | --------------------- | ------------------- | ----------------------------------------- | ------ |
| 1   | BadgeUnlockModal      | Global              | Scale + rotation + confetti prolonge      | Moyen  |
| 2   | BadgeCollectionGrid   | Badges              | Stagger reveal + glow unlocked            | Faible |
| 3   | StreakFlames          | Practice, Challenge | Flammes progressives (1-2, 3-4, 5-9, 10+) | Moyen  |
| 4   | SessionEndCelebration | Results             | Confetti si bon score                     | Faible |
| 5   | PerfectScoreFireworks | Results             | Celebration big 100%                      | Moyen  |
| 6   | FloatAnimation        | Score               | "+1" qui monte et disparait               | Faible |
| 7   | ToastMessages         | Global              | Messages encourageants emojis             | Faible |
| 8   | GentleShake           | Erreur              | Shake doux + "Essaie encore!"             | Faible |
| 9   | GradientText          | Titres              | Texte gradient arc-en-ciel                | Faible |
| 10  | ToggleSwitch          | Settings            | Toggle avec emoji son                     | Faible |
| 11  | ElevationSystem       | Cards               | Ombres colorees rose/violet               | Faible |
| 12  | DynamicShadows        | Hover               | Shadow change au hover                    | Faible |
| 13  | FocusIndicators       | Navigation          | Outline visible accessibilite             | Faible |
| 14  | ScreenReaderAnnounce  | Global              | Annonces score/progression                | Faible |
| 15  | InlineSpinner         | Loading             | Etoile qui tourne                         | Faible |

### 3.2 Code Reference - Badge Unlock

```tsx
// components/effects/BadgeUnlockModal.tsx
export function BadgeUnlockModal({ badge, onClose }: Props) {
  useEffect(() => {
    // Confetti prolonge pour celebration badge
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#FFB6D9', '#DDA0DD', '#FFD700'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 text-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.2, 1], rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          {badge.emoji}
        </motion.div>
        <h2 className="text-2xl font-bold text-purple-600 mb-2">
          Nouveau Badge! 🎉
        </h2>
        <p className="text-pink-500 mb-4">{badge.name}</p>
        <MagicButton onClick={onClose}>Super!</MagicButton>
      </motion.div>
    </motion.div>
  );
}
```

### 3.3 Dependances NPM Tier 2

```json
{
  "optionalDependencies": {
    "@react-spring/web": "^9.7.5",
    "lottie-react": "^2.4.0"
  }
}
```

**Bundle Impact Additionnel**: ~10kB gzip (lazy loaded)

---

## 4. TIER 3 - POLISH (P2) - FINITION UX

### 4.1 Liste Composants Polish

| #   | Composant         | Page(s)  | Description             | Effort |
| --- | ----------------- | -------- | ----------------------- | ------ |
| 1   | PageTransitions   | Global   | Slide direction-aware   | Moyen  |
| 2   | AuroraEnhanced    | Layout   | Blobs subtils ameliores | Faible |
| 3   | MenuHoverEffects  | Menu     | Glow + scale 1.05       | Faible |
| 4   | SkeletonLoaders   | Async    | Shimmer colore rose     | Faible |
| 5   | StaggerList       | Listes   | Apparition progressive  | Faible |
| 6   | TextReveal        | Intro    | Lettres avec etoiles    | Moyen  |
| 7   | CheckboxAnimation | QCM      | Cases -> coeurs/etoiles | Faible |
| 8   | RippleEffect      | Boutons  | Ripple paillettes       | Faible |
| 9   | GradientBorders   | Bonus    | Bordure arc-en-ciel     | Moyen  |
| 10  | ScrollReveal      | Trophees | Apparition au scroll    | Faible |

### 4.2 Code Reference - Page Transitions

```tsx
// components/effects/PageTransition.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants = {
  hidden: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  enter: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        custom={1}
        variants={variants}
        initial="hidden"
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

**Bundle Impact**: ~5kB gzip (CSS + minimal JS)

---

## 5. TIER 4 - BONUS (P3) - EXTRAS

### 5.1 Liste Composants Bonus

| #   | Composant       | Page(s)      | Description                | Effort |
| --- | --------------- | ------------ | -------------------------- | ------ |
| 1   | DragDropSpring  | Mode creatif | Chiffres = gemmes magiques | Eleve  |
| 2   | DirectionTabs   | Navigation   | Tabs cristaux/etoiles      | Moyen  |
| 3   | TextShimmer     | Badges       | Shimmer dore recompenses   | Faible |
| 4   | NoiseOverlay    | Cards        | Texture subtile            | Faible |
| 5   | GlowingDividers | Separateurs  | Lignes brillantes          | Faible |

---

## 6. COMPOSANTS EXCLUS

### 6.1 Liste et Justifications

| Composant                 | Raison Exclusion                    | Alternative          |
| ------------------------- | ----------------------------------- | -------------------- |
| Cursor Spotlight          | Tablettes tactiles = pas de curseur | Particules touch     |
| Magnetic Buttons          | Trop subtil pour enfant 9 ans       | Hover scale standard |
| Shared Element Transition | Complexite navigation excessive     | Fade simple          |
| Parallax Layers           | Pas de scroll long dans exercices   | -                    |
| Sticky Header Transform   | Header fixe suffit                  | Header simple        |
| Scroll Progress           | Pas de contenu long                 | -                    |
| Typewriter Effect         | Trop lent = frustration enfant      | Reveal instantane    |
| Mesh Gradient             | Doublon avec FairyBackground        | FairyBackground      |
| Animated Grid Background  | Esthetique "tech" pas feerique      | Aurora clouds        |
| Spotlight/Vignette        | Reduit lisibilite enfant            | -                    |

---

## 7. STACK TECHNIQUE RECOMMANDE

### 7.1 Dependencies Finales

```json
{
  "dependencies": {
    "framer-motion": "^12.23.26",
    "gsap": "^3.14.2",
    "@gsap/react": "^2.1.2",
    "lucide-react": "^0.562.0"
  },
  "optionalDependencies": {
    "canvas-confetti": "^1.9.3",
    "lottie-react": "^2.4.0",
    "@react-spring/web": "^9.7.5",
    "react-icons": "^5.5.0",
    "react-kawaii": "^0.17.0"
  }
}
```

### 7.2 Quand utiliser GSAP vs Framer Motion

| Cas d'usage                       | Librairie          | Raison                   |
| --------------------------------- | ------------------ | ------------------------ |
| Animations UI (hover, tap, mount) | Framer Motion      | Integration React native |
| Animations complexes/sequencees   | GSAP               | Timeline, ScrollTrigger  |
| Counters animes                   | @react-spring      | Performance nombres      |
| Confetti/particles                | canvas-confetti    | Leger, lazy loaded       |
| Animations SVG path               | GSAP               | DrawSVG, MorphSVG        |
| Scroll-driven animations          | GSAP ScrollTrigger | Performance superieure   |

```tsx
// Exemple GSAP avec React
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

function MagicTitle() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      gsap.from('.letter', {
        y: 100,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: 'back.out(1.7)',
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {'Bravo!'.split('').map((l, i) => (
        <span key={i} className="letter inline-block">
          {l}
        </span>
      ))}
    </div>
  );
}
```

### 7.3 Bundle Strategy

```
STRATEGIE BUNDLE

MAIN BUNDLE (Charge immediatement):
 framer-motion (tree-shaken)      ~18kB gzip
 react-icons (tree-shaken)        ~5kB gzip
 lucide-react (tree-shaken)       ~3kB gzip

LAZY CHUNKS (A la demande):
 canvas-confetti                  ~5kB gzip  -> Premiere bonne reponse
 @react-spring/web                ~10kB gzip -> Ecran score
 lottie-react                     ~10kB gzip -> Badge unlock (optionnel)
 react-kawaii                     ~8kB gzip  -> Feedback (optionnel)

TOTAL IMMEDIAT: ~26kB gzip
TOTAL MAXIMUM:  ~59kB gzip (si tout charge)
TOTAL TYPIQUE:  ~41kB gzip

OK SOUS BUDGET 100kB
```

### 7.3 Architecture Animation

```
HIERARCHIE DECISIONNELLE

NIVEAU 1: CSS Pur (Performance maximale)
 Usage: Hover, focus, transitions simples
 .button { transition: transform 150ms ease; }
 .button:hover { transform: scale(1.05); }

         Si besoin de plus
              ↓

NIVEAU 2: Framer Motion (90% des effets)
 Usage: Entrees/sorties, gestures, layout
 <motion.div animate={{ scale: 1 }} />

         Si besoin counters animes
              ↓

NIVEAU 3: React Spring (Counters uniquement)
 Usage: Animation de nombres fluide
 const { number } = useSpring({ to: { number: score } })

         Si besoin confetti
              ↓

NIVEAU 4: Canvas Confetti (Lazy)
 Usage: Celebrations bonne reponse/niveau
 const confetti = await import('canvas-confetti')
```

---

## 8. BIBLIOTHEQUES ICONES & ASSETS

### 8.1 Icones Recommandees

| Source               | Package        | Usage                                    | License   |
| -------------------- | -------------- | ---------------------------------------- | --------- |
| **react-icons (gi)** | `react-icons`  | GiCrown, GiTrophyCup, GiUnicorn, GiMedal | CC BY 3.0 |
| **Lucide**           | `lucide-react` | Star, Trophy, Award, Crown               | MIT       |
| **react-kawaii**     | `react-kawaii` | Planet, Cat moods (happy, blissful)      | MIT       |

### 8.2 Animations Lottie (Gratuites)

| Source      | Type            | URL                                                  |
| ----------- | --------------- | ---------------------------------------------------- |
| LottieFiles | Unicorn         | https://lottiefiles.com/6261-unicorn                 |
| LottieFiles | Sparkle         | https://lottiefiles.com/free-animations/sparkle      |
| LottieFiles | Confetti        | https://lottiefiles.com/free-animations/confetti     |
| IconScout   | Star animations | https://iconscout.com/lottie-animations/sparkle-star |

### 8.3 Emojis Contextuels

| Contexte      | Emojis   | Usage                   |
| ------------- | -------- | ----------------------- |
| Reussite      | ⭐🌟✨💫 | Feedback positif        |
| Licorne       | 🦄       | Theme principal, loader |
| Princesse     | 👑💎     | Niveaux, badges         |
| Magie         | ✨🪄🔮   | Effets speciaux         |
| Encouragement | 💖💗💕   | Vies, messages          |
| Bonus         | 🌈       | Multiplicateurs         |
| Monde         | 🏰       | Niveaux theme           |
| Aide          | 🧚       | Guide, hints            |

---

## 9. INTEGRATION ROADMAP

### Phase 2 - Practice Mode

```
 FairyBackground (P0)
 MagicCard (P0)
 MagicButton (P0)
 AnswerIcon (P0)
 ValidationFeedback (P0)
 MagicConfetti (P0)
 InputFocus (P0)
 MagicCounter (P0)
 CrownProgress (P0)
 ReducedMotion (P0)
```

### Phase 3 - Challenge Mode

```
 TimerAnimation (P0)
 Countdown 3-2-1
 SessionEndCelebration (P1)
 StreakFlames (P1)
```

### Phase 4 - Badges & Gamification

```
 BadgeUnlockModal (P1)
 BadgeCollectionGrid (P1)
 PerfectScoreFireworks (P1)
 ToastMessages (P1)
```

### Phase 5 - Dark Mode & Polish

```
 PageTransitions (P2)
 AuroraEnhanced (P2)
 SkeletonLoaders (P2)
 DarkModeTransition (P2)
```

### Phase 6 - PWA & Finition

```
 MenuHoverEffects (P2)
 StaggerList (P2)
 ScrollReveal (P2)
```

---

## 10. METRIQUES DE SUCCES

### 10.1 Performance

| Metrique           | Cible       | Methode          |
| ------------------ | ----------- | ---------------- |
| Chargement initial | < 2s        | Lighthouse       |
| FPS animations     | > 30fps     | DevTools         |
| Bundle effects     | < 50kB gzip | Webpack analyzer |
| Temps feedback     | < 100ms     | Performance API  |

### 10.2 Accessibilite

| Metrique                 | Cible         | Methode          |
| ------------------------ | ------------- | ---------------- |
| Lighthouse Accessibility | > 95          | Lighthouse       |
| prefers-reduced-motion   | 100% respecte | Test manuel      |
| Contraste texte          | AAA (7:1)     | Contrast checker |
| Focus visible            | 100% elements | Tab navigation   |

### 10.3 Engagement Enfant

| Metrique                 | Cible                       | Methode     |
| ------------------------ | --------------------------- | ----------- |
| Temps reaction feedback  | < 100ms                     | Chrono      |
| Duree animations         | 200-400ms (500-800ms celeb) | Code review |
| Frequence encouragements | Tous les 3 succes           | Analytics   |

---

## 11. CHECKLIST IMPLEMENTATION

### Pre-Implementation

- [ ] Installer dependencies: `npm install framer-motion react-icons lucide-react`
- [ ] Configurer canvas-confetti lazy: `npm install canvas-confetti`
- [ ] Creer fichier `tokens.css` avec palette princesse
- [ ] Creer hook `useReducedMotion.ts`

### Par Composant

- [ ] Respecter timing < 400ms (sauf celebrations)
- [ ] Implementer version reduced-motion
- [ ] Touch targets >= 64px
- [ ] Tester sur tablette (performance)
- [ ] Ajouter aria-live pour feedback

### Pre-Release

- [ ] Audit Lighthouse > 95 accessibility
- [ ] Test avec enfant 9 ans reel
- [ ] Verifier bundle size < 100kB total
- [ ] Tester animations repetees (100x) sans irritation

---

## 12. FICHIERS A CREER

```
tables-magiques/
├── src/
│   ├── components/
│   │   ├── effects/
│   │   │   ├── FairyBackground.tsx      # P0
│   │   │   ├── MagicCard.tsx            # P0
│   │   │   ├── MagicButton.tsx          # P0
│   │   │   ├── AnswerIcon.tsx           # P0
│   │   │   ├── MagicCounter.tsx         # P0
│   │   │   ├── CrownProgress.tsx        # P0
│   │   │   ├── MagicLoader.tsx          # P0
│   │   │   ├── MagicConfetti.tsx        # P0
│   │   │   ├── TimerAnimation.tsx       # P0
│   │   │   ├── BadgeUnlockModal.tsx     # P1
│   │   │   ├── StreakFlames.tsx         # P1
│   │   │   ├── GentleShake.tsx          # P1
│   │   │   ├── ToastMessages.tsx        # P1
│   │   │   ├── PageTransition.tsx       # P2
│   │   │   └── SkeletonLoader.tsx       # P2
│   │   ├── ui/
│   │   │   ├── Input.tsx                # avec focus magic
│   │   │   └── Button.tsx               # avec animations
│   ├── hooks/
│   │   ├── useReducedMotion.ts          # P0 obligatoire
│   │   ├── useMediaQuery.ts             # P0
│   │   └── useAnnouncer.ts              # P1 a11y
│   ├── styles/
│   │   ├── tokens.css                   # P0 variables
│   │   ├── animations.css               # P0 keyframes
│   │   └── focus.css                    # P1 accessibility
```

---

## DOCUMENTS DE REFERENCE

Ce document consolide:

1. **EFFECTS_ULTRA_MODERN_SPECIFICATIONS.md** (3909 lignes) - Source composants
2. **EFFECTS_COMPONENTS_ANALYSIS.md** - Analyse 42 composants retenus avec code
3. **ICON_LIBRARIES_RESEARCH.md** - Recherche bibliotheques icones/animations
4. **KIDS_ANIMATION_BEST_PRACTICES.md** - Best practices industrie (Khan Academy, Duolingo, DragonBox)
5. **ANIMATION_LIBRARIES_RESEARCH.md** - Recherche confetti, Lottie, react-kawaii

---

> **Document**: EFFECTS_PRIORITIZATION_MATRIX.md
> **Version**: 2.0.0
> **Auteur**: Recherche comprehensive Tables Magiques
> **Date**: 2025-12-25
> **Prochaine etape**: Phase 1 Auth puis Phase 2 Practice avec effets P0
