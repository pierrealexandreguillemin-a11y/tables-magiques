# Roadmap - Tables Magiques

> **Mise à jour**: 2025-12-26
> **Version actuelle**: 0.1.0
> **Tests**: 614 | **E2E**: 77 | **Coverage**: TBD

---

## P0 - Priorité Haute

| ID   | Tâche                  | Description                                                     | Effort | Statut |
| ---- | ---------------------- | --------------------------------------------------------------- | ------ | ------ |
| P0-1 | **PWA**                | Service worker + manifest (offline, install)                    | M      | [ ]    |
| P0-2 | **Dark Mode**          | Toggle header + persistance localStorage + prefers-color-scheme | S      | [ ]    |
| P0-3 | **Migrate game hooks** | `features/game/hooks/useGame.ts` avec React Query               | M      | [ ]    |

---

## P1 - Fonctionnalités

| ID   | Tâche           | Description                                                    | Effort | Statut |
| ---- | --------------- | -------------------------------------------------------------- | ------ | ------ |
| P1-1 | **Page Profil** | `/profile` - stats utilisateur, collection badges, progression | M      | [ ]    |
| P1-2 | **Sons**        | Feedback audio (correct/incorrect), toggle mute                | S      | [ ]    |
| P1-3 | **Historique**  | Sessions passées + graphique progression                       | M      | [ ]    |
| P1-4 | **Badge Icons** | Recherche bibliothèques open-source pour remplacer emojis      | S      | [ ]    |

### YAGNI (Non planifié)

- ~~Leaderboard~~ - Users cloisonnés, pas de valeur ajoutée

---

## P2 - Qualité

| ID   | Tâche               | Description                                      | Effort | Statut |
| ---- | ------------------- | ------------------------------------------------ | ------ | ------ |
| P2-1 | **E2E CI/CD**       | Activer Playwright sur Vercel (Upstash Redis)    | S      | [ ]    |
| P2-2 | **Coverage 90%+**   | Analyse couverture + complétion zones manquantes | M      | [ ]    |
| P2-3 | **Audit a11y**      | WCAG 2.1 AA complet (axe-core, lighthouse)       | M      | [ ]    |
| P2-4 | **Bundle analysis** | Optimisation taille, lazy loading, tree shaking  | S      | [ ]    |

---

## P3 - Architecture

| ID   | Tâche              | Description                                    | Effort | Statut |
| ---- | ------------------ | ---------------------------------------------- | ------ | ------ |
| P3-1 | **Migrate hooks/** | Déplacer `useAuth.ts` → `features/auth/hooks/` | S      | [ ]    |
| P3-2 | **API game**       | `app/api/game/` endpoints + handlers MSW       | M      | [ ]    |
| P3-3 | **Storybook**      | Documentation composants visuels interactifs   | L      | [ ]    |

---

## Légende

| Effort     | Durée estimée |
| ---------- | ------------- |
| S (Small)  | < 2 heures    |
| M (Medium) | 2-8 heures    |
| L (Large)  | > 8 heures    |

| Statut | Signification |
| ------ | ------------- |
| [ ]    | À faire       |
| [~]    | En cours      |
| [x]    | Terminé       |
| [-]    | Annulé        |

---

## Stack Technique

- **Frontend**: Next.js 16, React 19, TypeScript 5.8
- **State**: React Query (TanStack Query v5)
- **Styling**: Tailwind CSS 4, Radix UI
- **Animation**: GSAP, Framer Motion, Lottie
- **Tests**: Vitest, Testing Library, Playwright, MSW
- **Backend**: Vercel Serverless, Upstash Redis
- **CI/CD**: GitHub Actions, Vercel

---

## Changelog

### 2025-12-26

- Création roadmap initiale
- 5 violations ISO/IEC 25010 corrigées
- React Query intégré (auth, badges)
- 614 tests unitaires/intégration
