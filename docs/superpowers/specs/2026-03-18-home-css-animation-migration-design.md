# Home Page CSS Animation Migration — Spec

## Contexte

La home page de Tables Magiques cumule 100+ elements animes simultanement via 4 systemes non coordonnes (Framer Motion, GSAP, tsParticles, CSS). Le principal cout vient de 49 `motion.div` en boucle infinie + 2 GSAP tweens `repeat: -1` qui executent du JS a chaque frame sur le main thread.

tsParticles (etoiles) reste — il tourne deja sur canvas GPU. Le probleme ce sont les 49 `motion.div` Framer Motion et les 2 tweens GSAP qui font le meme travail que CSS `@keyframes` mais en passant par le JS runtime.

## Objectif

Eliminer tous les `motion.div` et GSAP tweens du fond et du contenu de la home page. Migrer vers CSS `@keyframes` avec parametrisation via custom properties. Rendu visuellement identique, zero cout JS par frame pour les animations de fond.

### Metriques cibles

- 0 `motion.div` sur le fond de la home en idle (actuellement 49)
- 0 GSAP tween en boucle infinie sur la home (actuellement 2)
- Suppression du hook `useHomeAnimations.ts`
- Reduction mesurable des `Animation Frame Fired` events en idle sur la home

Note: `ShareDialog.tsx` contient des `motion.span`/`motion.div` avec `repeat: Infinity`, mais le Dialog (Radix UI portal) ne mount que quand l'utilisateur clique "Partager" — ces elements n'existent pas dans le DOM en idle. La metrique "0 motion.div en idle" est donc correcte.

## Perimetre

### Migre (Framer Motion / GSAP → CSS)

| Composant                         | Avant                                                         | Apres                                           | Elements |
| --------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- | -------- |
| 4 clouds `FairyBackground`        | `motion.div` + Framer `animate`                               | `<div>` + CSS `@keyframes cloud-float`          | 4        |
| 30 particules `FloatingParticles` | `motion.div` + Framer `animate`                               | `<div>` + CSS `@keyframes particle-float`       | 30       |
| 15 etoiles `FloatingParticles`    | `motion.div` + Framer `animate`                               | `<div>` + CSS `@keyframes star-twinkle`         | 15       |
| Background gradient               | GSAP `gsap.to(container, { backgroundPosition, repeat: -1 })` | CSS `animation: bg-drift`                       | 1        |
| Unicorn float                     | GSAP `gsap.to(unicorn, { y: -25, rotation: 8, repeat: -1 })`  | CSS `@keyframes unicorn-bob`                    | 1        |
| Unicorn hover                     | Framer `whileHover={{ scale: 1.3, rotate: [...] }}`           | CSS `:hover` + `@keyframes unicorn-wiggle`      | 1        |
| Unicorn tap                       | Framer `whileTap={{ scale: 0.9 }}`                            | CSS `:active { transform: scale(0.9) }`         | 1        |
| Unicorn click bounce              | GSAP `gsap.to(unicorn, { scale: 1.5, yoyo })`                 | CSS `@keyframes unicorn-pop` + toggle classe JS | 1        |
| Paragraphe entree                 | Framer `initial/animate` fade+slide                           | CSS `@keyframes fade-up`                        | 1        |
| Container boutons entree          | Framer `initial/animate` fade+scale                           | CSS `@keyframes fade-scale`                     | 1        |
| Container mascotte entree         | Framer `initial/animate` scale                                | CSS `@keyframes fade-scale`                     | 1        |
| Title entry                       | GSAP timeline `from(title, { opacity, y, scale, elastic })`   | CSS `@keyframes title-enter`                    | 1        |

### Hors perimetre

- **tsParticles** (etoiles FairyBackground) — reste tel quel, deja sur canvas GPU
- **Framer Motion `AnimatePresence`** — reste pour les transitions mount/unmount (pages, modales, feedback). Pas d'equivalent CSS pour les animations de sortie du DOM.
- **Framer Motion dans les composants effects internes** (`PulseGlow`, `GradientBorder`, `MagneticButton`) — hors scope, ils gerent leur propre animation en interne
- **`GradientText`** — utilise CSS animation (`animate-gradient-x`), pas Framer Motion. Aucune migration necessaire.
- **GSAP celebrations** (`GsapCelebration`, `SuccessExplosion`, `useGsapEffects`) — reste, c'est du one-shot, pas des boucles infinies
- **`ShareDialog.tsx`** — contient 3 `motion.span`/`motion.div` avec `repeat: Infinity` (licorne bob, sparkle spin, overlay pulse), mais le Dialog Radix UI est un portal qui ne mount que sur click "Partager". Ces animations ne tournent pas en idle. Migration possible en phase ulterieure.
- **Toutes les pages autres que la home**

## Principes

### DRY

- Un seul `@keyframes` parametrise par CSS custom properties pour N instances
- Exemple: `@keyframes cloud-float` utilise `var(--x1)`, `var(--y1)`, `var(--s1)` etc. — 4 clouds, 1 keyframe
- Les palettes de couleurs restent dans `lib/animations/colors.ts` (source unique)
- Les timings restent dans `styles/tokens.css`
- Les easings utilisent les tokens existants: `var(--ease-spring)` pour l'overshoot elastic (deja defini dans `tokens.css` comme `cubic-bezier(0.34, 1.56, 0.64, 1)`)

### SRP

- `animations.css` — declare les keyframes et classes utilitaires, zero logique
- `FloatingParticles.tsx` — mappe data vers markup avec classes CSS, zero logique d'animation
- `FairyBackground.tsx` — orchestre etoiles (tsParticles) + clouds (CSS), zero Framer Motion
- `HomeContent.tsx` — structure de la page, zero import d'animation lib externe
- `HomePage.tsx` — orchestrateur de layout pur, zero refs d'animation

### Thin Layer

Les composants sont des passeurs de data vers CSS. Pas de hooks d'animation, pas de refs, pas de state d'animation. Le JS genere les `style={{ '--duration': '...', '--delay': '...' }}` et CSS fait le reste. Seule exception: `onClick` pour le bounce licorne (toggle de classe).

## Architecture CSS

### Keyframes a creer dans `styles/animations.css`

```css
/* Fond — boucles infinies */
@keyframes cloud-float      /* transform: translate(x,y) scale(s) oscillation parametrise */
@keyframes particle-float   /* transform: translateY + translateX oscillation, opacity + scale pulse */
@keyframes star-twinkle      /* opacity + scale + rotate pulse */
@keyframes bg-drift          /* backgroundPosition 0%→200% lineaire */
@keyframes unicorn-bob       /* transform: translateY(-25px) rotate(8deg) yoyo */

/* Interactions */
@keyframes unicorn-wiggle    /* transform: rotate() sequence [-10, 10, -10, 0] sur :hover */
@keyframes unicorn-pop       /* transform: scale() 1→1.5→1 sur click */

/* Entrees one-shot */
@keyframes fade-up           /* opacity 0→1, transform: translateY(20px)→translateY(0) */
@keyframes fade-scale        /* opacity 0→1, transform: scale(0.5)→scale(1) */
@keyframes title-enter; /* opacity 0→1, transform: translateY(-100px) scale(0.5) → translateY(0) scale(1) elastic */
```

### Parametrisation via custom properties

Chaque instance recoit ses propres valeurs inline. Les classes definissent des valeurs par defaut pour eviter les cas ou une custom property serait absente (ce qui rendrait le `transform` invalide et le navigateur l'ignorerait silencieusement):

```css
/* Defauts securises */
.cloud {
  --x1: 0px;
  --y1: 0px;
  --s1: 1;
  --x2: 0px;
  --y2: 0px;
  --s2: 1;
  --duration: 20s;
  --delay: 0s;
  animation: cloud-float var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform;
}

.floating-particle {
  --duration: 5s;
  --delay: 0s;
  --amplitude-y: 40px;
  --x-offset: 0px;
  --scale-max: 1.3;
  animation: particle-float var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform, opacity;
}

.floating-star {
  --duration: 2s;
  --delay: 0s;
  animation: star-twinkle var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform, opacity;
}
```

Les valeurs inline sur chaque element surchargent ces defauts:

```html
<div
  class="cloud gpu-accelerated"
  style="
    --duration: 20s;
    --delay: 0s;
    --x1: 100px; --y1: -80px; --s1: 1.2;
    --x2: -80px; --y2: 60px;  --s2: 0.9;
    width: 700px; height: 700px;
    filter: blur(80px);
    ..."
/>
```

```css
@keyframes cloud-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(var(--x1), var(--y1)) scale(var(--s1));
  }
  66% {
    transform: translate(var(--x2), var(--y2)) scale(var(--s2));
  }
}
```

### particle-float avec x-offset

Le hook `useParticles.ts` genere un `xOffset` par particule (entre -15 et +15px). Ce drift horizontal est reproduit dans le keyframe via `--x-offset`:

```css
@keyframes particle-float {
  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(calc(-1 * var(--amplitude-y)))
      translateX(var(--x-offset)) scale(var(--scale-max));
    opacity: 0.9;
  }
}
```

Le composant mappe `p.xOffset` vers `style={{ '--x-offset': '${p.xOffset}px' }}`.

### Reduced motion

Toutes les nouvelles classes sont ajoutees dans le bloc existant `@media (prefers-reduced-motion: reduce)` avec `animation: none`.

### Easings — DRY via tokens

L'elastic GSAP `elastic.out(1, 0.5)` et les springs Framer Motion sont approximes par le token existant `--ease-spring` (`tokens.css` ligne 79):

```css
/* title-enter, unicorn-wiggle: overshoot elastic */
animation-timing-function: var(--ease-spring);

/* hover transitions: meme spring */
transition: transform 0.3s var(--ease-spring);

/* tap/active: pas d'overshoot */
transition: transform 0.1s ease;
```

Pas de `cubic-bezier` en dur dans `animations.css` — tout passe par le token.

### Note sur bg-drift et paint

`@keyframes bg-drift` anime `background-position`, qui n'est **pas** une propriete compositor-only — elle declenche un repaint a chaque frame. C'est le meme comportement que le tween GSAP actuel (pas une regression). Le gain de `bg-drift` vient de la suppression du JS overhead (GSAP calcule la valeur en JS a chaque frame, CSS le fait nativement). Gate 6 est adaptee pour refleter cette realite: le critere "compositor-only" s'applique aux animations `transform`/`opacity` (clouds, particules, etoiles, unicorn, entrees), **pas** a `bg-drift` qui est un repaint connu et accepte sur un seul element.

Alternative future: remplacer le gradient anime par un pseudo-element oversized avec `transform: translateX()` (compositor-safe). Hors scope de cette migration.

## Plan de migration

### Etape 1 — CSS keyframes (`styles/animations.css`)

Ajouter les 10 keyframes et les classes utilitaires associees avec valeurs par defaut. Ajouter les nouvelles classes dans le bloc `prefers-reduced-motion`. Aucun composant modifie a cette etape — les classes ne sont pas encore utilisees.

### Etape 2 — FairyBackground clouds (`components/effects/FairyBackground.tsx`)

Remplacer les 4 `motion.div` clouds par des `<div>` avec classe `.cloud` et custom properties inline. Supprimer l'import `motion` de framer-motion (l'import `Particles` de tsParticles reste). Le tableau `CLOUDS` reste comme source de data, les valeurs `animation.x/y/scale` sont mappees vers les custom properties CSS `--x1/--y1/--s1/--x2/--y2/--s2`. `useReducedMotion` reste pour conditionner les classes CSS et tsParticles — si `!shouldAnimate`, la classe `.cloud` n'est pas appliquee.

### Etape 3 — FloatingParticles (`features/home/components/FloatingParticles.tsx`)

Remplacer les 30 `motion.div` particules par des `<div className="floating-particle">` avec custom properties (`--duration`, `--delay`, `--amplitude-y`, `--x-offset`, `--scale-max`). Chaque particule mappe `p.xOffset` vers `--x-offset`, `p.duration` vers `--duration`, etc. Remplacer les 15 `motion.div` etoiles par des `<div className="floating-star">` avec custom properties. Supprimer l'import `motion`. Le hook `useParticles.ts` reste inchange (genere la data — SRP respecte).

### Etape 4 — Background gradient + Unicorn float (suppression `useHomeAnimations.ts`)

Ajouter classe `.bg-drift` sur le `<main>` dans `HomePage.tsx`. Ajouter classe `.unicorn-bob` sur le div licorne dans `HomeContent.tsx`. Supprimer `useHomeAnimations.ts` entierement. `HomePage.tsx` ne passe plus `containerRef`/`titleRef`/`unicornRef` aux enfants — props simplifiees. Confirmer que `useHomeAnimations` est importe uniquement par `HomePage.tsx` (verifie par grep), puis supprimer le fichier. Aucun barrel export a mettre a jour car le hook n'est pas re-exporte (pas de `features/home/hooks/index.ts`).

### Etape 5 — HomeContent interactions + entrees (`features/home/components/HomeContent.tsx`)

- **Licorne hover**: remplacer `whileHover` par `:hover` + `@keyframes unicorn-wiggle` via CSS
- **Licorne tap**: remplacer `whileTap` par `:active` + `transition: transform 0.1s ease`
- **Licorne click bounce**: remplacer GSAP `handleUnicornClick` par toggle de classe `.unicorn-pop` via `useState` + `onAnimationEnd` pour reset. **Gestion du double-click**: au click, retirer la classe de facon synchrone (`setPopping(false)`) puis la remettre au tick suivant via `requestAnimationFrame(() => setPopping(true))`. Ca force le navigateur a relancer l'animation meme si elle etait en cours. Pas besoin de `contextSafe` GSAP.
- **Paragraphe**: `<p className="animate-fade-up" style={{ animationDelay: '0.8s' }}>`
- **Container boutons**: `<div className="animate-fade-scale" style={{ animationDelay: '1.2s' }}>`
- **Container mascotte**: `<div className="animate-fade-scale" style={{ animationDelay: '1.8s' }}>`
- **Title**: `<h1 className="animate-title-enter" style={{ animationDelay: '0.3s' }}>`
- Supprimer tous les imports Framer Motion de `HomeContent.tsx`
- Note: `GradientText` (importe depuis `@/components/effects`) utilise CSS animation en interne (`animate-gradient-x`), pas Framer Motion. Aucune action necessaire sur ce composant.

### Etape 6 — Cleanup

- Verifier que `useHomeAnimations` n'est plus importe nulle part (grep)
- Verifier que `motion` n'est plus importe dans les fichiers migres
- Confirmer suppression du fichier `useHomeAnimations.ts`
- `madge --circular` zero dependance circulaire
- Verifier que les imports de `@gsap/react` et `gsap` sont supprimes de `HomePage.tsx` et `HomeContent.tsx`

## Fichiers touches

| Fichier                                          | Action                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `styles/animations.css`                          | Ajouter ~80 lignes de keyframes + classes avec defauts                 |
| `components/effects/FairyBackground.tsx`         | Remplacer motion.div clouds par div + CSS                              |
| `features/home/components/FloatingParticles.tsx` | Remplacer motion.div par div + CSS                                     |
| `features/home/components/HomePage.tsx`          | Supprimer refs GSAP, ajouter classe `.bg-drift`, simplifier props      |
| `features/home/components/HomeContent.tsx`       | Supprimer Framer Motion + GSAP, CSS pur + 1 useState pour click bounce |
| `features/home/hooks/useHomeAnimations.ts`       | **Supprime**                                                           |
| `features/home/hooks/useParticles.ts`            | Inchange                                                               |

## Quality Gates

Chaque etape doit passer **toutes** les gates avant de passer a la suivante.

### Gate 1 — Build & Types

- `tsc --noEmit` zero erreur
- `next build` reussit (revele les erreurs SSR, imports circulaires, dynamic imports casses)

### Gate 2 — Tests

- `vitest run` — 941 tests passent, zero regression
- Si un test reference `motion.div` ou `useHomeAnimations` dans un snapshot/mock, il est mis a jour dans la meme etape

### Gate 3 — Lint & Format

- `eslint` zero erreur (imports inutilises supprimes, pas commentes)
- `prettier --check` passe

### Gate 4 — Dead code

- Les imports supprimes ne laissent pas de code mort
- `madge --circular` zero dependance circulaire
- Grep confirme que les fichiers supprimes ne sont plus references

### Gate 5 — Rendu visuel

- Comparaison manuelle avant/apres sur la home (light mode + dark mode)
- Les timings, easings, amplitudes matchent l'original
- `prefers-reduced-motion: reduce` desactive toutes les nouvelles animations CSS

### Gate 6 — Performance (mesure, pas supposition)

- DevTools Performance: enregistrer 5s d'idle sur la home avant et apres
- Compter les `Animation Frame Fired` events — doit baisser significativement
- Verifier que les animations `transform`/`opacity` (clouds, particules, etoiles, unicorn, entrees) tournent sur le compositor thread (pas de paint dans la timeline)
- Note: `bg-drift` (`background-position`) cause un repaint connu sur 1 element — identique au GSAP actuel, pas une regression. Le gain est la suppression du JS overhead.

## Definition of Done

Une etape est **done** quand:

- Gates 1-4 passent (automatisable en CI)
- Gate 5 validee visuellement (light + dark + reduced motion)
- Gate 6 mesuree et documentee (screenshot perf DevTools avant/apres)
- Le code supprime est **supprime** (pas commente, pas renomme, pas dans un `.old`)
- Les fichiers supprimes sont confirmes non-references par grep
- Zero TODO laisse dans le code migre

## Risques

| Risque                                                                                    | Mitigation                                                                                                                                      |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| L'easing CSS via `var(--ease-spring)` ne reproduit pas exactement le spring/elastic GSAP  | Tester cote a cote. Ajuster le token si besoin. L'oeil humain ne distingue pas les differences sous 50ms.                                       |
| Custom property absente dans un inline style → `transform` invalide silencieux            | Toutes les classes definissent des valeurs par defaut (`--x1: 0px; --s1: 1;` etc.). Le fallback produit un element statique, pas un bug visuel. |
| Double-click sur la licorne pendant l'animation pop                                       | `requestAnimationFrame` pour forcer le reset de classe avant re-application. Documente dans l'etape 5.                                          |
| Les custom properties CSS dans les keyframes ne sont pas supportees sur vieux navigateurs | Cible: Chrome 80+, Safari 13.1+, Firefox 78+. La PWA cible deja ces versions.                                                                   |
| Suppression de `useHomeAnimations` casse des tests                                        | Grep confirme que seul `HomePage.tsx` l'importe. Pas de tests unitaires sur ce hook (GSAP hooks sont testes via e2e).                           |
| `bg-drift` cause un repaint par frame                                                     | Identique au GSAP actuel. Pas une regression. Migration future possible vers `transform: translateX` sur pseudo-element (hors scope).           |

## Etape vers Proposition C

Cette migration (Proposition B) est une etape directe vers la Proposition C (suppression complete de GSAP). Apres B:

- GSAP reste uniquement pour les celebrations (confetti, fireworks, shake, score)
- La migration C remplacerait ces celebrations par tsParticles (confetti/fireworks) et CSS (shake)
- Aucun travail de B n'est jete dans C
