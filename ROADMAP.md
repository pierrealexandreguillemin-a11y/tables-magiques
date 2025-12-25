# ROADMAP - Tables Magiques

Plan de developpement structure selon ISO/IEC 25010.

## Statut actuel

- [x] Phase 0 : Deploiement initial
- [ ] Phase 1 : Authentification
- [ ] Phase 2 : Mode Practice
- [ ] Phase 3 : Mode Challenge
- [ ] Phase 4 : Badges
- [ ] Phase 5 : Dark Mode
- [ ] Phase 6 : PWA Complete
- [ ] Phase 7 : Tests E2E

---

## Phase 0 : Deploiement (COMPLETE)

- [x] Setup Next.js 16 + TypeScript
- [x] Config shadcn/ui
- [x] Install GSAP + Framer Motion
- [x] Setup Upstash Redis
- [x] Deploy Vercel
- [x] GitHub integration
- [x] Hooks Husky ISO
- [x] Landing page animee

---

## Phase 1 : Authentification

### Objectif

Modal de login simple (4 caracteres minimum).

### Tasks

```
[ ] 1.1 - API /api/auth/login
    - POST: username + password
    - Hash bcrypt
    - Session Redis (24h TTL)

[ ] 1.2 - API /api/auth/logout
    - DELETE session Redis

[ ] 1.3 - API /api/auth/register
    - Validation 4 chars min
    - Username unique

[ ] 1.4 - Middleware auth
    - Verification session
    - Redirect si non auth

[ ] 1.5 - Modal Login (shadcn Dialog)
    - Form username/password
    - Validation client
    - Messages erreur

[ ] 1.6 - Hook useAuth
    - State user
    - Login/logout functions
    - isAuthenticated
```

### Tests TDD

```
tests/unit/auth/password.test.ts
tests/integration/api/auth.test.ts
tests/e2e/login.spec.ts
```

---

## Phase 2 : Mode Practice

### Objectif

Jeu de pratique des tables sans limite de temps.

### Tasks

```
[ ] 2.1 - Logique questions (lib/game/questions.ts)
    - generateQuestion(table)
    - generateRandomQuestion()
    - shuffleAnswers()

[ ] 2.2 - Logique scoring (lib/game/scoring.ts)
    - calculateScore(correct, total)
    - updateStreak()
    - checkPerfect()

[ ] 2.3 - Page /practice
    - Selection table (1-10 + Toutes)
    - Boutons animees GSAP

[ ] 2.4 - Composant QuestionDisplay
    - Affichage question
    - Animation entree/sortie

[ ] 2.5 - Composant NumberPad
    - Clavier 0-9
    - Bouton Effacer
    - Bouton Retour
    - Bouton Verifier

[ ] 2.6 - Composant ScoreBoard
    - Score courant
    - Serie en cours
    - Animation GSAP counter

[ ] 2.7 - API /api/scores
    - POST: sauvegarder score
    - GET: recuperer historique

[ ] 2.8 - Feedback reponses
    - Correct: feux d'artifice GSAP
    - Incorrect: shake animation
    - Messages encourageants
```

### Tests TDD

```
tests/unit/game/questions.test.ts
tests/unit/game/scoring.test.ts
tests/integration/api/scores.test.ts
tests/e2e/practice-mode.spec.ts
```

---

## Phase 3 : Mode Challenge

### Objectif

Mode chronometre : 3 minutes, 5 secondes par question.

### Tasks

```
[ ] 3.1 - Timer global (3 min)
    - Countdown display
    - Animation pulse GSAP quand < 30s
    - Game over quand temps ecoule

[ ] 3.2 - Timer par question (5 sec)
    - Auto-skip si temps ecoule
    - Barre de progression visuelle
    - Animation urgence

[ ] 3.3 - Page /challenge
    - Ecran demarrage
    - Ecran jeu avec timers
    - Ecran resultats

[ ] 3.4 - Logique challenge (lib/game/challenge.ts)
    - startChallenge()
    - endChallenge()
    - calculateChallengeScore()

[ ] 3.5 - API /api/scores/challenge
    - POST: sauvegarder score challenge
    - Donnees: score, temps restant
```

### Tests TDD

```
tests/unit/game/challenge.test.ts
tests/integration/api/challenge.test.ts
tests/e2e/challenge-mode.spec.ts
```

---

## Phase 4 : Systeme de Badges

### Objectif

8 badges Practice + 5 badges Challenge avec persistance.

### Tasks

```
[ ] 4.1 - Config badges (config/badges.ts)
    - Definitions badges Practice
    - Definitions badges Challenge
    - Conditions de deblocage

[ ] 4.2 - Logique badges (lib/game/badges.ts)
    - checkBadgeUnlock()
    - getBadgeInfo()
    - getUserBadges()

[ ] 4.3 - API /api/badges
    - GET: badges utilisateur
    - POST: debloquer badge

[ ] 4.4 - Composant BadgeCollection
    - Affichage grille badges
    - Badges gagnes vs non gagnes
    - Animation GSAP deblocage

[ ] 4.5 - Modal BadgeInfo
    - Au toucher: afficher comment gagne
    - Animation pop-in

[ ] 4.6 - Notification nouveau badge
    - Animation celebratoire
    - Feux d'artifice
    - Son optionnel
```

### Tests TDD

```
tests/unit/game/badges.test.ts
tests/integration/api/badges.test.ts
tests/e2e/badges.spec.ts
```

---

## Phase 5 : Dark Mode

### Objectif

Theme sombre avec toggle.

### Tasks

```
[ ] 5.1 - Config Tailwind dark mode
    - class strategy
    - Variables CSS

[ ] 5.2 - Hook useTheme
    - Toggle light/dark
    - Persistance localStorage
    - System preference detection

[ ] 5.3 - Composant ThemeToggle
    - Bouton soleil/lune
    - Animation transition

[ ] 5.4 - Adaptation couleurs
    - Gradient dark mode
    - Arcs-en-ciel adaptes
    - Contraste WCAG AA
```

### Tests TDD

```
tests/unit/hooks/useTheme.test.ts
tests/e2e/dark-mode.spec.ts
```

---

## Phase 6 : PWA Complete

### Objectif

App installable avec support offline.

### Tasks

```
[ ] 6.1 - manifest.json
    - Icons toutes tailles
    - Theme colors
    - Display standalone

[ ] 6.2 - Service Worker
    - Cache static assets
    - Offline fallback
    - Background sync

[ ] 6.3 - Install prompt
    - Detection installable
    - Bouton "Installer l'app"

[ ] 6.4 - Icons PWA
    - SVG licorne custom
    - PNG toutes tailles
    - Splash screens
```

### Tests

```
Lighthouse PWA audit > 90
```

---

## Phase 7 : Tests E2E Complets

### Objectif

Couverture E2E des parcours critiques.

### Tasks

```
[ ] 7.1 - Setup Playwright
    - Config multi-browser
    - Mobile viewport

[ ] 7.2 - Tests parcours
    - Login complet
    - Practice session complete
    - Challenge session complete
    - Badge unlock flow
    - Dark mode toggle

[ ] 7.3 - Tests accessibilite
    - Navigation clavier
    - Screen reader
    - Contraste couleurs
```

---

## Pyramide de Tests (ISO/IEC 29119)

```
        /\
       /  \
      / E2E \           10%
     /______\
    /        \
   / INTEGR.  \         30%
  /____________\
 /              \
/   UNIT TESTS   \      60%
\________________/
```

---

## Definition of Done

Chaque feature est complete quand :

- [ ] Tests unitaires passent (60%)
- [ ] Tests integration passent (30%)
- [ ] Tests E2E passent (10%)
- [ ] TypeScript 0 erreur
- [ ] ESLint 0 erreur
- [ ] Review code
- [ ] Deploye en production
- [ ] Documente
