# Phase 9 - Enrichissement P2 : Effets & Animations

> **ISO/IEC 25010** - Utilisabilité, Accessibilité enfants
> **Status**: COMPLETE
> **Dernière MAJ**: 2025-12-27
> **Progression**: 100%

---

## Vue d'ensemble

```
+===========================================================================+
| PHASE 9 - ENRICHISSEMENT PARTIE 2                                          |
+===========================================================================+
|                                                                           |
| [x] 9.1-9.3  Sons (useSound, SoundToggle)                    COMPLETE     |
| [x] 9.4      Badge Icons (emojis + Lottie licorne)           COMPLETE     |
| [x] 9.5      Skeleton Loaders                                COMPLETE     |
| [x] 9.6      TextReveal animation                            COMPLETE     |
| [x] 9.7      ScrollReveal animation                          COMPLETE     |
| [x] 9.8      AnimatedCheckbox (Settings toggles)             COMPLETE     |
| [x] 9.9      RippleEffect boutons                            COMPLETE     |
| [x] 9.10a    Settings types ISO/IEC                          COMPLETE     |
| [x] 9.10b    Settings page + hooks + tests                   COMPLETE     |
| [x] 9.11     Tour guidé (onboarding) + tests                 COMPLETE     |
|                                                                           |
+===========================================================================+
```

---

## Documentation officielle consultée

| Technologie        | Documentation                                                                                 | Version |
| ------------------ | --------------------------------------------------------------------------------------------- | ------- |
| Framer Motion      | https://www.framer.com/motion/                                                                | 12.x    |
| Lottie React       | https://lottiereact.com/                                                                      | 2.4.x   |
| Radix UI           | https://www.radix-ui.com/primitives                                                           | 1.x     |
| WCAG 2.1           | https://www.w3.org/WAI/WCAG21/quickref/                                                       | AA      |
| COPPA              | https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa | 2024    |
| React Joyride      | https://react-joyride.com/                                                                    | 2.x     |
| Next.js App Router | https://nextjs.org/docs/app                                                                   | 15.x    |

---

## Architecture SRP - Conformité

```
+-- types/                    # SOURCE UNIQUE DE VÉRITÉ
|   +-- effects.ts            # SkeletonProps, TextRevealProps, etc.
|   +-- settings.ts           # UserSettings, SettingsCategory
|   +-- onboarding.ts         # TourStep, TourState
|
+-- components/effects/       # UI PURE (pas de logique métier)
|   +-- Skeleton.tsx          # Consomme SkeletonProps
|   +-- TextReveal.tsx        # Consomme TextRevealProps
|   +-- ScrollReveal.tsx      # Consomme ScrollRevealProps
|   +-- AnimatedCheckbox.tsx  # Consomme AnimatedCheckboxProps
|   +-- RippleEffect.tsx      # Consomme RippleEffectProps
|
+-- hooks/                    # LOGIQUE RÉUTILISABLE
|   +-- useRipple.ts          # Gestion ripples (état local)
|   +-- useReducedMotion.ts   # Détection prefers-reduced-motion
|
+-- features/settings/        # FEATURE COMPLÈTE SRP
|   +-- hooks/useSettings.ts  # Logique métier settings
|   +-- components/           # UI settings
|   +-- index.ts              # Export public
|
+-- features/onboarding/      # FEATURE COMPLÈTE SRP
|   +-- hooks/useOnboarding.ts
|   +-- hooks/useFirstVisit.ts
|   +-- components/
|   +-- index.ts
|
+-- app/settings/page.tsx     # ORCHESTRATEUR MINIMAL
+-- app/page.tsx              # Intègre OnboardingTour
```

---

## 9.5 - Skeleton Loaders [COMPLETE]

### Usage précis

| Où            | Quand                            | Composant parent                |
| ------------- | -------------------------------- | ------------------------------- |
| `BadgeCard`   | Pendant fetch API `/api/badges`  | `BadgeCollection`               |
| `ProfilePage` | Pendant fetch API `/api/profile` | `ProfilePage`                   |
| `ScoreBoard`  | Pendant calcul scores            | `PracticePage`, `ChallengePage` |

### Déclencheurs

```typescript
// Dans BadgeCollection.tsx
const { data, isLoading } = useBadges();
if (isLoading) return <BadgeGridSkeleton count={6} />;

// Dans ProfilePage.tsx
const { data, isLoading } = useProfile();
if (isLoading) return <ProfileSkeleton />;
```

### Fichiers créés

- [x] `types/effects.ts` - `SkeletonProps`, `SkeletonVariant`
- [x] `components/effects/Skeleton.tsx` - Composant + presets
- [x] `tests/unit/components/effects/Skeleton.test.tsx`

### Tests TDD requis

```typescript
describe('Skeleton', () => {
  // Unit tests
  it('renders text variant with correct height');
  it('renders circle variant with aspect-square');
  it('renders multiple lines for text variant');
  it('respects animate=false prop');
  it('adds grayscale when reduced-motion enabled');

  // Accessibility
  it('has role="status" and aria-label');
  it('includes sr-only loading text');
});

describe('BadgeSkeleton', () => {
  it('renders circle + text skeleton layout');
});

describe('ProfileSkeleton', () => {
  it('renders avatar + stats + badges skeleton');
});
```

---

## 9.6 - TextReveal Animation [COMPLETE]

### Usage précis

| Où                 | Quand         | Texte révélé     |
| ------------------ | ------------- | ---------------- |
| `PracticePage`     | Mount initial | "Mode Pratique"  |
| `ChallengePage`    | Mount initial | "Mode Challenge" |
| `BadgeUnlockModal` | Badge unlock  | Nom du badge     |
| `OnboardingTour`   | Chaque étape  | Titre étape      |

### Déclencheurs

```typescript
// Dans PracticePage.tsx
<TextReveal variant="slide" delay={0.2}>
  Mode Pratique
</TextReveal>

// Dans BadgeUnlockModal.tsx
<TextReveal variant="fade" duration={0.8}>
  {badge.name}
</TextReveal>
```

### Fichiers créés

- [x] `types/effects.ts` - `TextRevealProps`, `TextRevealVariant`
- [x] `components/effects/TextReveal.tsx` - TextReveal + WordReveal
- [x] `tests/unit/components/effects/TextReveal.test.tsx`

### Tests TDD requis

```typescript
describe('TextReveal', () => {
  it('renders text immediately when shouldAnimate=false');
  it('splits text into characters for animation');
  it('applies correct variant animation (fade/slide/typewriter/blur)');
  it('calls onComplete after animation');
  it('respects delay prop');
});

describe('WordReveal', () => {
  it('splits text into words instead of characters');
  it('applies stagger delay between words');
});
```

---

## 9.7 - ScrollReveal Animation [COMPLETE]

### Usage précis

| Où             | Quand                | Éléments révélés  |
| -------------- | -------------------- | ----------------- |
| `ProfilePage`  | Scroll vers badges   | `BadgeCard` items |
| `SettingsPage` | Scroll vers sections | `SettingsSection` |
| `HomePage`     | Scroll (future)      | Feature cards     |

### Déclencheurs

```typescript
// Dans BadgeCollection.tsx
<ScrollRevealList variant="fade-up" staggerDelay={0.1}>
  {badges.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
</ScrollRevealList>

// Dans SettingsPage.tsx
<ScrollReveal variant="fade-up" threshold={0.3}>
  <SettingsSection title="Audio" />
</ScrollReveal>
```

### Fichiers créés

- [x] `types/effects.ts` - `ScrollRevealProps`, `ScrollRevealVariant`
- [x] `components/effects/ScrollReveal.tsx` - ScrollReveal + ScrollRevealList
- [ ] `tests/unit/components/effects/ScrollReveal.test.tsx`

### Tests TDD requis

```typescript
describe('ScrollReveal', () => {
  it('renders children immediately when shouldAnimate=false');
  it('starts hidden until intersection');
  it('animates when threshold reached');
  it('triggers only once when triggerOnce=true');
  it('applies correct variant animation');
});

describe('ScrollRevealList', () => {
  it('staggers children animations');
  it('applies itemClassName to each child');
});
```

---

## 9.8 - AnimatedCheckbox [COMPLETE]

### Usage précis

| Où             | Quand                | Setting contrôlé               |
| -------------- | -------------------- | ------------------------------ |
| `SettingsPage` | Toggle sons          | `audio.soundEnabled`           |
| `SettingsPage` | Toggle musique       | `audio.musicEnabled`           |
| `SettingsPage` | Toggle animations    | `accessibility.reducedMotion`  |
| `SettingsPage` | Toggle contraste     | `accessibility.highContrast`   |
| `SettingsPage` | Toggle notifications | `notifications.dailyReminders` |

### Déclencheurs

```typescript
// Dans SettingsPage.tsx
<AnimatedCheckbox
  checked={settings.audio.soundEnabled}
  onChange={(checked) => updateSetting('audio.soundEnabled', checked)}
  variant="switch"
  label="Sons activés"
  description="Jouer les sons d'interface"
/>
```

### Fichiers créés

- [x] `types/effects.ts` - `AnimatedCheckboxProps`, `AnimatedCheckboxVariant`
- [x] `components/effects/AnimatedCheckbox.tsx`
- [ ] `tests/unit/components/effects/AnimatedCheckbox.test.tsx`

### Tests TDD requis

```typescript
describe('AnimatedCheckbox', () => {
  // Functional
  it('calls onChange with toggled value on click');
  it('does not call onChange when disabled');
  it('shows loading spinner when loading=true');

  // Variants
  it('renders switch variant with thumb animation');
  it('renders checkbox variant with checkmark SVG');

  // Sizes
  it('applies correct dimensions for sm/md/lg sizes');

  // Accessibility
  it('has role="switch" or role="checkbox"');
  it('has aria-checked matching checked state');
  it('is focusable and keyboard accessible');
  it('announces label to screen readers');
});
```

---

## 9.9 - RippleEffect [COMPLETE]

### Usage précis

| Où              | Quand         | Élément              |
| --------------- | ------------- | -------------------- |
| `MagicButton`   | Click bouton  | Tous les MagicButton |
| `NumberPad`     | Click chiffre | Boutons 0-9, C, OK   |
| `PracticePage`  | Click table   | Boutons "Table 1-10" |
| `ChallengePage` | Click start   | Bouton "Commencer"   |

### Déclencheurs

```typescript
// Intégration dans MagicButton.tsx
<RippleEffect color="rgba(255,255,255,0.4)" duration={600}>
  <button className={buttonClasses} onClick={onClick}>
    {children}
  </button>
</RippleEffect>

// Ou via hook dans NumberPad.tsx
const { ripples, addRipple } = useRipple(600);
<button onClick={addRipple}>...</button>
```

### Fichiers créés

- [x] `types/effects.ts` - `RippleEffectProps`, `RipplePosition`, `UseRippleResult`
- [x] `hooks/useRipple.ts`
- [x] `components/effects/RippleEffect.tsx`
- [x] `app/globals.css` - Animation `@keyframes ripple`
- [ ] `tests/unit/components/effects/RippleEffect.test.tsx`
- [ ] `tests/unit/hooks/useRipple.test.ts`

### Tests TDD requis

```typescript
describe('useRipple', () => {
  it('adds ripple with correct x,y coordinates on click');
  it('generates unique id for each ripple');
  it('removes ripple after duration');
  it('clears all ripples on clearRipples()');
});

describe('RippleEffect', () => {
  it('renders children without modification');
  it('adds ripple element on click');
  it('positions ripple at click coordinates');
  it('does not add ripple when disabled=true');
  it('respects reduced motion preference');
});
```

---

## 9.10 - Settings Complets [COMPLETE]

### 9.10a - Types [COMPLETE]

- [x] `types/settings.ts` créé avec toutes les interfaces

### 9.10b - Feature Settings [COMPLETE]

### Usage précis

| Où                  | Quand         | Action                                       |
| ------------------- | ------------- | -------------------------------------------- |
| Header (icône gear) | Click         | Navigation vers `/settings`                  |
| `SettingsPage`      | Mount         | Charge settings depuis localStorage          |
| `SettingsPage`      | Toggle/change | Persiste dans localStorage + optionnel Redis |
| Partout             | Mount app     | Applique settings (theme, sons, etc.)        |

### Architecture feature/

```
features/settings/
├── api/
│   └── settings.ts           # syncSettings(), fetchSettings()
├── hooks/
│   └── useSettings.ts        # Logique complète
├── components/
│   ├── SettingsPage.tsx      # Layout avec sections
│   ├── SettingsSection.tsx   # Groupe de settings
│   ├── SettingsToggle.tsx    # Wrapper AnimatedCheckbox + label
│   ├── SettingsSlider.tsx    # Slider avec valeur
│   ├── SettingsSelect.tsx    # Select avec options
│   └── SettingsInfo.tsx      # Readonly info (version, etc.)
└── index.ts

app/settings/page.tsx         # Route orchestratrice minimale
```

### Fichiers créés

- [x] `features/settings/hooks/useSettings.ts`
- [x] `features/settings/components/SettingsPage.tsx`
- [x] `features/settings/components/SettingsSection.tsx`
- [x] `features/settings/components/SettingsToggle.tsx`
- [x] `features/settings/components/SettingsSlider.tsx`
- [x] `features/settings/components/SettingsSelect.tsx`
- [x] `features/settings/index.ts`
- [x] `app/settings/page.tsx`
- [x] `tests/unit/features/settings/hooks/useSettings.test.ts`
- [x] `tests/unit/features/settings/components/SettingsPage.test.tsx`
- [x] `tests/integration/settings.test.tsx`
- [x] `tests/e2e/settings.spec.ts`

### Tests TDD requis

```typescript
// Unit - useSettings
describe('useSettings', () => {
  it('loads settings from localStorage on mount');
  it('returns DEFAULT_SETTINGS if localStorage empty');
  it('persists changes to localStorage');
  it('validates settings schema version');
  it('migrates old settings format');
});

// Unit - SettingsPage
describe('SettingsPage', () => {
  it('renders all settings categories');
  it('shows current setting values');
  it('updates settings on toggle change');
  it('shows loading state during save');
});

// Integration
describe('Settings Integration', () => {
  it('persists theme change across page reload');
  it('applies sound settings to useSound hook');
  it('applies reduced motion to animations');
});

// E2E
describe('Settings E2E', () => {
  it('navigates to /settings from header');
  it('toggles dark mode and verifies UI change');
  it('changes sound settings and verifies audio behavior');
  it('exports user data as JSON');
});
```

---

## 9.11 - Tour Guidé Onboarding [PENDING]

### Usage précis

| Où                    | Quand                               | Action                  |
| --------------------- | ----------------------------------- | ----------------------- |
| `HomePage`            | Première visite (localStorage vide) | Auto-start tour         |
| Header (bouton `?`)   | Click                               | Start tour manuellement |
| `SettingsPage` > Aide | Click "Revoir le guide"             | Reset + start tour      |

### Déclencheurs

```typescript
// Dans app/page.tsx (HomePage)
const { isFirstVisit } = useFirstVisit();
const { start, state } = useOnboarding();

useEffect(() => {
  if (isFirstVisit && !state.isCompleted) {
    start();
  }
}, [isFirstVisit, state.isCompleted, start]);

// Dans Header.tsx
<button data-tour="help-button" onClick={start}>
  <HelpCircle />
</button>
```

### Architecture feature/

```
features/onboarding/
├── hooks/
│   ├── useOnboarding.ts      # État tour + navigation
│   └── useFirstVisit.ts      # Détection première visite
├── components/
│   ├── OnboardingTour.tsx    # Wrapper principal (Portal)
│   ├── TourStep.tsx          # Étape avec tooltip
│   ├── TourHighlight.tsx     # Overlay + spotlight
│   ├── TourTooltip.tsx       # Bulle avec contenu
│   └── TourProgress.tsx      # Dots de progression
└── index.ts

types/onboarding.ts           # Déjà créé
```

### Data attributes requis sur HomePage

```tsx
// Dans app/page.tsx
<div data-tour="logo">Logo</div>
<Link data-tour="practice-button" href="/practice">Pratique</Link>
<Link data-tour="challenge-button" href="/challenge">Challenge</Link>
<Link data-tour="profile-button" href="/profile">Profil</Link>
<button data-tour="settings-button">Settings</button>
<button data-tour="help-button">?</button>
```

### Fichiers créés

- [x] `features/onboarding/hooks/useFirstVisit.ts`
- [x] `features/onboarding/hooks/useOnboarding.ts`
- [x] `features/onboarding/components/OnboardingTour.tsx`
- [x] `features/onboarding/components/TourHighlight.tsx`
- [x] `features/onboarding/components/TourTooltip.tsx`
- [x] `features/onboarding/components/TourProgress.tsx`
- [x] `features/onboarding/index.ts`
- [x] `components/ui/HelpButton.tsx` (bouton `?` header)
- [x] `features/home/components/HomePage.tsx` - data-tour attributes ajoutés
- [x] `tests/unit/features/onboarding/hooks/useFirstVisit.test.ts`
- [x] `tests/unit/features/onboarding/hooks/useOnboarding.test.ts`
- [x] `tests/unit/features/onboarding/components/OnboardingTour.test.tsx`
- [x] `tests/integration/onboarding.test.tsx`
- [x] `tests/e2e/onboarding.spec.ts`

### Tests TDD requis

```typescript
// Unit - useFirstVisit
describe('useFirstVisit', () => {
  it('returns isFirstVisit=true when localStorage empty');
  it('returns isFirstVisit=false after markAsVisited()');
  it('persists visited state across hook instances');
  it('returns hasTourCompleted correctly');
});

// Unit - useOnboarding
describe('useOnboarding', () => {
  it('starts with isActive=false');
  it('sets isActive=true on start()');
  it('increments currentStep on next()');
  it('decrements currentStep on prev()');
  it('sets isCompleted=true on complete()');
  it('resets state on reset()');
  it('returns correct currentStep object');
});

// Unit - OnboardingTour
describe('OnboardingTour', () => {
  it('renders nothing when state.isActive=false');
  it('renders highlight + tooltip when active');
  it('positions tooltip according to step.placement');
  it('highlights correct element by target selector');
});

// Integration
describe('Onboarding Integration', () => {
  it('auto-starts on first visit');
  it('does not auto-start if tour completed');
  it('navigates through all steps');
  it('closes on skip button');
  it('persists completion state');
});

// E2E
describe('Onboarding E2E', () => {
  it('shows tour on first visit');
  it('highlights correct elements in sequence');
  it('allows navigation prev/next');
  it('can be skipped');
  it('can be replayed from ? button');
  it('is accessible via keyboard');
});
```

---

## Intégrations requises après implémentation

### 9.5 Skeleton - Intégrations

- [ ] `features/badges/components/BadgeCollection.tsx` - utiliser `BadgeGridSkeleton`
- [ ] `app/profile/page.tsx` - utiliser `ProfileSkeleton`

### 9.6 TextReveal - Intégrations

- [ ] `features/game/components/PracticePage.tsx` - titre "Mode Pratique"
- [ ] `features/game/components/ChallengePage.tsx` - titre "Mode Challenge"

### 9.7 ScrollReveal - Intégrations

- [ ] `features/badges/components/BadgeCollection.tsx` - wrap badges
- [ ] `features/settings/components/SettingsPage.tsx` - wrap sections

### 9.9 RippleEffect - Intégrations

- [ ] `components/effects/MagicButton.tsx` - wrap button content
- [ ] `features/game/components/NumberPad.tsx` - wrap number buttons

### 9.10 Settings - Intégrations

- [ ] `components/layout/Header.tsx` - ajouter lien Settings
- [ ] `app/providers.tsx` - wrap SettingsProvider si nécessaire
- [ ] `hooks/useSound.ts` - lire depuis settings
- [ ] `hooks/useReducedMotion.ts` - lire depuis settings

### 9.11 Onboarding - Intégrations

- [ ] `app/page.tsx` - ajouter data-tour attributes + OnboardingTour
- [ ] `components/layout/Header.tsx` - ajouter HelpButton

---

## Tests - Pyramide ISO 29119

### Principe fondamental

```
+===========================================================================+
| TESTS CONTRE PRODUCTION - VERCEL + UPSTASH REDIS                          |
+===========================================================================+
|                                                                           |
| MSW = Mock TRANSPORT uniquement (réseau)                                  |
| DONNÉES = RÉELLES (fixtures production)                                   |
| IMPORTS = Seuls éléments mockés (lottie-web, gsap, canvas)               |
|                                                                           |
| ❌ INTERDIT: Mock des données, fabrication de réponses                    |
| ✅ REQUIS: Fixtures réelles, comportements production                     |
|                                                                           |
+===========================================================================+
```

### Pattern de test obligatoire

```typescript
// ✅ BON - Import fixtures production
import { EARNED_BADGES_FIXTURE } from '@/tests/fixtures';
import { render, screen } from '@testing-library/react';

describe('BadgeCard', () => {
  it('renders badge from production fixture', () => {
    const badge = EARNED_BADGES_FIXTURE[0]; // DONNÉE RÉELLE
    render(<BadgeCard badge={badge} earned={true} />);
    expect(screen.getByText(badge.name)).toBeInTheDocument();
  });
});

// ❌ INTERDIT - Données inventées
const fakeBadge = { id: 'test', name: 'Test Badge' }; // JAMAIS
```

### Mocks autorisés (imports uniquement)

| Import                 | Raison                     | Fichier          |
| ---------------------- | -------------------------- | ---------------- |
| `lottie-web`           | Canvas API non dispo jsdom | `tests/setup.ts` |
| `gsap`                 | Animation engine           | `tests/setup.ts` |
| `@gsap/react`          | Hook React GSAP            | `tests/setup.ts` |
| `window.matchMedia`    | Media queries              | `tests/setup.ts` |
| `IntersectionObserver` | Scroll detection           | `tests/setup.ts` |
| `ResizeObserver`       | Resize detection           | `tests/setup.ts` |

### Nouveaux tests à créer

```
tests/
├── unit/
│   ├── components/effects/
│   │   ├── Skeleton.test.tsx           # NEW
│   │   ├── TextReveal.test.tsx         # NEW
│   │   ├── ScrollReveal.test.tsx       # NEW
│   │   ├── AnimatedCheckbox.test.tsx   # NEW
│   │   └── RippleEffect.test.tsx       # NEW
│   ├── hooks/
│   │   └── useRipple.test.ts           # NEW
│   └── features/
│       ├── settings/
│       │   ├── hooks/useSettings.test.ts        # NEW
│       │   └── components/SettingsPage.test.tsx # NEW
│       └── onboarding/
│           ├── hooks/useFirstVisit.test.ts      # NEW
│           ├── hooks/useOnboarding.test.ts      # NEW
│           └── components/OnboardingTour.test.tsx # NEW
│
├── integration/
│   ├── settings.test.tsx               # NEW
│   └── onboarding.test.tsx             # NEW
│
└── e2e/
    ├── settings.spec.ts                # NEW
    └── onboarding.spec.ts              # NEW
```

### Coverage cible

| Catégorie   | Actuel | Cible | Nouveaux tests |
| ----------- | ------ | ----- | -------------- |
| Unit        | 162    | 185+  | +23            |
| Integration | 48     | 54+   | +6             |
| E2E         | 50     | 58+   | +8             |

---

## Checklist finale Phase 9

### Composants

- [x] Skeleton + presets
- [x] TextReveal + WordReveal
- [x] ScrollReveal + ScrollRevealList
- [x] AnimatedCheckbox (switch + checkbox)
- [x] RippleEffect + useRipple

### Types (SRP)

- [x] `types/effects.ts` - tous les props
- [x] `types/settings.ts` - UserSettings complet
- [x] `types/onboarding.ts` - TourStep, TourState

### Features

- [x] `features/settings/` - hooks + components + index
- [x] `features/onboarding/` - hooks + components + index

### Routes

- [x] `app/settings/page.tsx`

### Tests

- [x] Unit tests Settings + effects (coverage >= 80%)
- [x] Integration tests Settings
- [x] E2E tests Settings
- [x] Unit tests Onboarding
- [x] Integration tests Onboarding
- [x] E2E tests Onboarding

### Accessibilité

- [x] Reduced motion supporté (tous composants)
- [x] Navigation clavier (Settings)
- [x] Navigation clavier (Onboarding)
- [x] Screen reader announcements (Onboarding)

### Production

- [x] Build production OK
- [ ] E2E contre Vercel
- [ ] Sync Upstash Redis (Settings optionnel)
