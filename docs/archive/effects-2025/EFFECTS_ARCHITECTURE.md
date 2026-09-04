# Architecture Effets & Animations - Tables Magiques

> ISO/IEC 25010 - Performance, Maintenabilité, Expérience Utilisateur
> Dernière mise à jour: 2025-12-26

## Vue d'Ensemble

Architecture multi-couches pour une expérience riche avec animations fluides et performances optimales.

## Stack Animation Complète

| Bibliothèque       | Taille | Usage                                    | Status   |
| ------------------ | ------ | ---------------------------------------- | -------- |
| **Framer Motion**  | ~40KB  | UI transitions, variants, gestures       | ✅ Actif |
| **GSAP**           | ~30KB  | Timelines complexes, compteurs           | ✅ Actif |
| **tsParticles**    | ~45KB  | Particules background féerique           | ✅ Actif |
| **Lottie**         | ~25KB  | Animations vectorielles (succès, erreur) | ✅ Actif |
| **react-kawaii**   | ~20KB  | Illustrations kawaii interactives        | ✅ Actif |
| **CSS Animations** | 0KB    | GPU-optimized continuous effects         | ✅ Actif |

**Total: ~160KB** - Chargement optimisé par lazy-loading

---

## Structure des Dossiers

```
tables-magiques/
├── lib/
│   └── animations/                    # Configuration centralisée
│       ├── index.ts                   # Exports centralisés
│       ├── gsap/
│       │   ├── effects.ts             # Effets GSAP (confetti, fireworks...)
│       │   └── register.ts            # Registration plugins
│       ├── framer/
│       │   ├── variants.ts            # Variants réutilisables
│       │   └── transitions.ts         # Page transitions
│       ├── lottie/
│       │   ├── animations.ts          # Imports animations JSON
│       │   └── presets.ts             # Configs par type
│       └── particles/
│           └── configs.ts             # Configs tsParticles
│
├── components/
│   └── effects/                       # Composants d'effets
│       ├── FairyBackground.tsx        # Particules féeriques
│       ├── MagicCard.tsx              # Carte glassmorphism
│       ├── MagicButton.tsx            # Bouton animé
│       ├── MagicCounter.tsx           # Compteur GSAP
│       ├── MagicLoader.tsx            # Loader animé
│       ├── AnswerIcon.tsx             # Icône réponse
│       ├── CrownProgress.tsx          # Progression couronne
│       ├── GsapCelebration.tsx        # Célébrations GSAP
│       ├── Toast.tsx                  # Notifications
│       ├── GentleShake.tsx            # Shake erreur doux
│       ├── GradientText.tsx           # Texte gradient animé
│       ├── LottieAnimation.tsx        # Wrapper Lottie
│       ├── KawaiiMascot.tsx           # Mascotte kawaii
│       └── index.ts                   # Barrel exports
│
├── hooks/
│   ├── useReducedMotion.ts            # Détection prefers-reduced-motion
│   ├── useGsapEffects.ts              # Hook effets GSAP
│   ├── useToast.ts                    # Gestion toasts
│   └── useAnnouncer.ts                # Annonces screen reader
│
└── styles/
    ├── animations.css                 # Keyframes CSS
    └── tokens.css                     # Variables + High Contrast
```

---

## Couches d'Animation

### Layer 1: CSS (GPU-Optimized) - 0KB JS

**Fichier:** `styles/animations.css`

| Animation      | Usage                 | Performance |
| -------------- | --------------------- | ----------- |
| `shimmer`      | Skeleton loading      | GPU ✓       |
| `glow-pulse`   | Hover effects         | GPU ✓       |
| `float`        | Éléments flottants    | GPU ✓       |
| `sparkle`      | Étoiles scintillantes | GPU ✓       |
| `bounce-soft`  | Rebond doux           | GPU ✓       |
| `shake-gentle` | Erreur douce          | GPU ✓       |
| `gradient-x`   | Texte gradient        | GPU ✓       |

### Layer 2: Framer Motion - UI Interactions

**Usage:** Transitions, variants, gestures, AnimatePresence

```tsx
// Variants réutilisables
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
};
```

### Layer 3: GSAP - Animations Complexes

**Usage:** Timelines, compteurs numériques, séquences

```tsx
// Célébrations
gsapEffects.confettiExplosion(element);
gsapEffects.fireworksDisplay(container);
gsapEffects.starBurst(element);
```

### Layer 4: Lottie - Animations Vectorielles

**Usage:** Succès, erreur, loading, mascotte

| Animation   | Fichier              | Trigger          |
| ----------- | -------------------- | ---------------- |
| Success     | `success-star.json`  | Bonne réponse    |
| Error       | `try-again.json`     | Mauvaise réponse |
| Loading     | `magic-loading.json` | Chargement       |
| Celebration | `confetti.json`      | Victoire         |
| Streak      | `fire-streak.json`   | Série réussie    |

### Layer 5: react-kawaii - Illustrations Interactives

**Usage:** Mascotte, feedback émotionnel

| Composant    | Mood     | Trigger          |
| ------------ | -------- | ---------------- |
| `<Planet />` | happy    | Bonne réponse    |
| `<Planet />` | sad      | Mauvaise réponse |
| `<Cat />`    | blissful | Série parfaite   |
| `<Ghost />`  | excited  | Nouveau badge    |

### Layer 6: tsParticles - Backgrounds

**Usage:** Ambiance féerique, particules

- Étoiles scintillantes
- Paillettes flottantes
- Confetti célébration

---

## Intégration par Page

### HomePage

| Composant  | Animation              | Lib          |
| ---------- | ---------------------- | ------------ |
| Titre      | `GradientText` animate | CSS + FM     |
| Background | `FairyBackground`      | tsParticles  |
| Boutons    | `MagicButton` hover    | FM           |
| Mascotte   | `KawaiiMascot`         | react-kawaii |

### ChallengePage / PracticePage

| Composant        | Animation                         | Lib         |
| ---------------- | --------------------------------- | ----------- |
| Question         | `MagicCard` enter                 | FM          |
| Timer            | `MagicCounter`                    | GSAP        |
| Bonne réponse    | `LottieAnimation` success         | Lottie      |
| Mauvaise réponse | `GentleShake` + `LottieAnimation` | FM + Lottie |
| Toast feedback   | `ToastContainer`                  | FM          |
| Série            | `LottieAnimation` streak          | Lottie      |
| Victoire         | `GsapCelebration` confetti        | GSAP        |
| Screen reader    | `useAnnouncer`                    | -           |

### ProfilePage

| Composant   | Animation           | Lib  |
| ----------- | ------------------- | ---- |
| Nom         | `GradientText`      | CSS  |
| Stats       | `MagicCounter`      | GSAP |
| Badges      | `MagicCard` stagger | FM   |
| Progression | `CrownProgress`     | FM   |

---

## Composants Phase 8

### ToastContainer

- **Intégration:** `app/providers.tsx`
- **Usage:** Feedback utilisateur global
- **WCAG:** aria-live, 6s duration

### GentleShake

- **Intégration:** Wrap `QuestionDisplay` sur erreur
- **Usage:** Feedback erreur non-punitif
- **Message:** Encourageant aléatoire

### GradientText

- **Intégration:** Titres h1/h2 principales pages
- **Variants:** fairy, unicorn, rainbow, gold

### useAnnouncer

- **Intégration:** ChallengePage, PracticePage
- **Usage:** Score, temps, résultats

### LottieAnimation (nouveau)

- **Intégration:** Feedback visuel réponses
- **Animations:** success, error, loading, celebration

### KawaiiMascot (nouveau)

- **Intégration:** HomePage, feedback émotionnel
- **Moods:** happy, sad, blissful, excited

---

## Optimisation Performance

### Lazy Loading Strategy

```tsx
// Composants lourds en dynamic import
const FairyBackground = dynamic(() => import('./FairyBackground'), {
  ssr: false,
});
const GsapCelebration = dynamic(() => import('./GsapCelebration'), {
  ssr: false,
});
const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
});
```

### LazyMotion (Framer Motion)

```tsx
// Réduction bundle: 40KB → 5KB initial
<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```

### Reduced Motion Support

Tous les composants respectent `prefers-reduced-motion`:

- Animations CSS: `animation: none`
- Framer Motion: via `useReducedMotion()`
- GSAP: durée 0ms
- Lottie: image statique

---

## Accessibilité (WCAG 2.2)

| Critère         | Implementation          |
| --------------- | ----------------------- |
| 2.3.3 Animation | `useReducedMotion` hook |
| 2.2.1 Timing    | Toast 6s minimum        |
| 4.1.3 Status    | `aria-live` regions     |
| 1.4.11 Contrast | High contrast mode      |

---

## Fichiers Lottie Requis

Créer/télécharger dans `public/lottie/`:

```
public/lottie/
├── success-star.json      # Étoile qui brille (bonne réponse)
├── try-again.json         # Encouragement (mauvaise réponse)
├── magic-loading.json     # Baguette magique loading
├── confetti.json          # Confetti célébration
├── fire-streak.json       # Flamme série
├── crown.json             # Couronne victoire
└── sparkles.json          # Paillettes ambiance
```

**Source recommandée:** [LottieFiles](https://lottiefiles.com/) - animations gratuites

---

## Prochaines Étapes

1. ✅ Documentation architecture
2. ⏳ Créer composants Lottie + Kawaii
3. ⏳ Intégrer ToastProvider dans layout
4. ⏳ Activer GradientText dans titres
5. ⏳ Activer feedback jeux (Toast, Shake, Lottie)
6. ⏳ Activer useAnnouncer accessibilité
7. ⏳ Tests E2E validation
8. ⏳ Optimisation lazy loading

---

_Document maintenu par l'équipe Tables Magiques_
_ISO/IEC 25010 Compliance_
