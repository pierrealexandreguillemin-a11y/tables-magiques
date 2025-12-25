# Recherche Bibliotheques Animation - Tables Magiques

> **Date**: 2025-12-25
> **Objectif**: Identifier les meilleures bibliotheques pour effets/animations jeu enfant

---

## 1. BIBLIOTHEQUES CONFETTI/CELEBRATION

### Recommandation: `canvas-confetti` + `react-canvas-confetti`

| Bibliotheque              | NPM                                                           | Taille | Best For                   |
| ------------------------- | ------------------------------------------------------------- | ------ | -------------------------- |
| **canvas-confetti**       | [npm](https://www.npmjs.com/package/canvas-confetti)          | ~5kB   | Vanilla JS, lazy loading   |
| **react-canvas-confetti** | [npm](https://www.npmjs.com/package/react-canvas-confetti)    | +3kB   | Wrapper React avec presets |
| react-confetti            | [npm](https://www.npmjs.com/package/react-confetti)           | ~18kB  | Confetti continu (rain)    |
| react-confetti-explosion  | [npm](https://www.npmjs.com/package/react-confetti-explosion) | ~8kB   | CSS-only, leger            |
| react-confetti-boom       | [npm](https://www.npmjs.com/package/react-confetti-boom)      | ~6kB   | 2 modes (boom/fall)        |

**Choix pour Tables Magiques**: `canvas-confetti` (lazy loaded)

- Tres leger (~5kB)
- Presets disponibles
- Couleurs personnalisables (princesse)
- Formes: star, circle, square

```typescript
// Usage recommande
const confetti = await import('canvas-confetti');
confetti.default({
  particleCount: 80,
  spread: 60,
  colors: ['#ff69b4', '#ba55d3', '#ffd700'],
  shapes: ['star', 'circle'],
});
```

**Sources**:

- [CodiLime - React Confetti Guide](https://codilime.com/blog/react-confetti/)
- [ReactLibs - Confetti Carnival](https://reactlibs.dev/articles/confetti-carnival-react-confetti/)

---

## 2. ANIMATIONS LOTTIE

### Sources Gratuites

| Source          | Type        | Quantite      | License             |
| --------------- | ----------- | ------------- | ------------------- |
| **LottieFiles** | Marketplace | 100k+         | Varies (check each) |
| **IconScout**   | Library     | 5000+ sparkle | Varies              |

### Animations Pertinentes Trouvees

**Licornes**:

- [Unicorn Animation](https://lottiefiles.com/6261-unicorn) - Free, cute unicorn
- [Unicorn by Kulikkov](https://lottiefiles.com/29785-unicorn) - Free, animated

**Etoiles/Sparkles**:

- [Sparkle Star](https://iconscout.com/lottie-animations/sparkle-star) - 2,731 animations
- [Sparkles](https://iconscout.com/lottie-animations/sparkles) - 2,473 animations
- [Stars](https://iconscout.com/lottie-animations/stars) - 5,012 animations

**Implementation React**:

```bash
npm install lottie-react
```

```typescript
import Lottie from 'lottie-react';
import unicornAnimation from './unicorn.json';

function UnicornCelebration() {
  return <Lottie animationData={unicornAnimation} loop={false} />;
}
```

**Sources**:

- [LottieFiles - Unicorn](https://lottiefiles.com/6261-unicorn)
- [IconScout - Sparkle Star](https://iconscout.com/lottie-animations/sparkle-star)

---

## 3. ICONES KAWAII/CUTE (ENFANTS)

### Recommandation: `react-kawaii`

**NPM**: [react-kawaii](https://www.npmjs.com/package/react-kawaii)
**GitHub**: [elizabetdev/react-kawaii](https://github.com/elizabetdev/react-kawaii)
**Demo**: [react-kawaii.vercel.app](https://react-kawaii.vercel.app/)

**Features**:

- Illustrations SVG mignonnes
- Moods: sad, shocked, happy, blissful, lovestruck
- Couleurs personnalisables
- Tailles ajustables

**Composants disponibles**:

- Planet
- IceCream
- CreditCard
- Cat
- Ghost
- Browser
- Backpack
- etc.

```typescript
import { Planet, IceCream, Cat } from 'react-kawaii';

// Utilisation pour feedback positif
<Planet size={120} mood="blissful" color="#ff69b4" />

// Pour badge deblocage
<IceCream size={80} mood="happy" color="#ffd700" />
```

**Limitation**: Pas d'icones princesse/licorne specifiques.
**Solution**: Combiner avec Lottie pour licornes + react-kawaii pour feedback.

**Sources**:

- [React Kawaii NPM](https://www.npmjs.com/package/react-kawaii)
- [CodeSandbox Examples](https://codesandbox.io/examples/package/react-kawaii)

---

## 4. ICONES GAME/ACHIEVEMENTS

### react-icons avec Game Icons (gi)

**NPM**: [react-icons](https://www.npmjs.com/package/react-icons)
**Collection**: Game Icons (prefix `gi`)

```bash
npm install react-icons
```

```typescript
import {
  GiTrophyCup,
  GiCrown,
  GiStarsStack,
  GiMedal,
  GiAchievement,
  GiDiamondTrophy,
  GiLaurelCrown
} from 'react-icons/gi';

// Utilisation avec couleurs princesse
<GiCrown color="#ffd700" size={48} />
<GiTrophyCup color="#ff69b4" size={48} />
```

**Icones Pertinentes (Game Icons)**:

- `GiTrophyCup` - Trophee
- `GiCrown` - Couronne
- `GiMedal` - Medaille
- `GiStarsStack` - Etoiles empilees
- `GiAchievement` - Badge achievement
- `GiDiamondTrophy` - Trophee diamant
- `GiLaurelCrown` - Couronne laurier
- `GiSuperstar` - Super star
- `GiStarMedal` - Medaille etoile

### Alternative: Lucide Icons

**NPM**: [lucide-react](https://www.npmjs.com/package/lucide-react)

```typescript
import { Trophy, Crown, Star, Award, Medal } from 'lucide-react';

<Trophy className="text-pink-500" size={48} />
```

**Sources**:

- [React Icons](https://react-icons.github.io/react-icons/)
- [Game-icons.net](https://game-icons.net/)
- [Lucide Icons Trophy](https://lucide.dev/icons/trophy)

---

## 5. RECOMMENDATION STACK FINAL

### Bundle Animation Tables Magiques

```json
{
  "dependencies": {
    "framer-motion": "^11.15.0",
    "react-icons": "^5.5.0",
    "lucide-react": "^0.468.0"
  },
  "optionalDependencies": {
    "canvas-confetti": "^1.9.3",
    "lottie-react": "^2.4.0",
    "react-kawaii": "^0.17.0"
  }
}
```

### Utilisation par Contexte

| Contexte             | Bibliotheque      | Exemple                        |
| -------------------- | ----------------- | ------------------------------ |
| **Bonne reponse**    | canvas-confetti   | Explosion confetti rose        |
| **Badge unlock**     | Lottie + confetti | Animation licorne + particules |
| **Feedback positif** | react-kawaii      | Planet blissful                |
| **Icones badges**    | react-icons (gi)  | GiCrown, GiTrophyCup           |
| **UI generale**      | Lucide            | Star, Trophy, Award            |
| **Animations UI**    | Framer Motion     | Scale, fade, spring            |

### Bundle Impact Total

| Package         | Taille (gzip)      | Charge   |
| --------------- | ------------------ | -------- |
| framer-motion   | ~18kB              | Immediat |
| react-icons     | ~5kB (tree-shaken) | Immediat |
| lucide-react    | ~3kB (tree-shaken) | Immediat |
| canvas-confetti | ~5kB               | Lazy     |
| lottie-react    | ~10kB              | Lazy     |
| react-kawaii    | ~8kB               | Lazy     |

**Total immediat**: ~26kB
**Total avec lazy**: ~49kB

---

## 6. ASSETS PRINCESSE/LICORNE A TELECHARGER

### LottieFiles (Download JSON)

1. [Unicorn Animation](https://lottiefiles.com/6261-unicorn)
2. [Unicorn by Kulikkov](https://lottiefiles.com/29785-unicorn)
3. [Star Sparkle Pack](https://iconscout.com/lottie-animations/sparkle-star)

### SVG Icons Recommandes (Game-icons.net)

1. Crown (couronne)
2. Star medal (medaille etoile)
3. Fairy (fee)
4. Princess (princesse)
5. Magic wand (baguette magique)

### Verification License

- LottieFiles: Verifier license par animation (certaines CC0, autres attribution)
- Game-icons.net: CC BY 3.0 (attribution requise)
- react-kawaii: MIT

---

> **Document**: ANIMATION_LIBRARIES_RESEARCH.md
> **Sources principales**:
>
> - [Canvas Confetti GitHub](https://github.com/ulitcos/react-canvas-confetti)
> - [LottieFiles](https://lottiefiles.com)
> - [React Kawaii](https://react-kawaii.vercel.app/)
> - [React Icons](https://react-icons.github.io/react-icons/)
> - [Game-icons.net](https://game-icons.net/)
