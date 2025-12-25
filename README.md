# Tables Magiques

PWA moderne pour apprendre les tables de multiplication avec un theme princesse/licorne.

## Stack technique

| Composant  | Technologie                    |
| ---------- | ------------------------------ |
| Frontend   | Next.js 16 + TypeScript strict |
| Database   | Upstash Redis                  |
| UI         | shadcn/ui                      |
| Animations | GSAP + Framer Motion           |
| Deploy     | Vercel                         |
| Tests      | Vitest + Playwright            |
| Standards  | ISO/IEC 25010                  |

## Fonctionnalites

- **Mode Practice** : Choix de table (1-10) ou toutes, sans limite de temps
- **Mode Challenge** : 3 minutes, 5 secondes par question
- **Badges** : 8 badges Practice + 5 badges Challenge
- **PWA** : Installable, fonctionne offline
- **Dark mode** : Theme sombre disponible
- **Accessibilite** : Fonts dys-friendly

## URLs

- **Production** : https://tables-magiques-pierrealexandreguillemin-4999s-projects.vercel.app
- **GitHub** : https://github.com/pierrealexandreguillemin-a11y/tables-magiques

## Developpement

```bash
# Installation
npm install

# Dev
npm run dev

# Tests
npm run test          # Unit + Integration
npm run test:e2e      # E2E Playwright

# Build
npm run build
```

## Structure projet (ISO/IEC 25010)

```
tables-magiques/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes authentification
│   ├── (game)/            # Routes jeu
│   └── api/               # API Routes
├── components/            # Composants UI
│   ├── ui/               # shadcn/ui
│   └── game/             # Composants jeu
├── lib/                   # Logique metier
│   ├── db/               # Upstash client
│   ├── game/             # Logique jeu
│   └── auth/             # Authentification
├── hooks/                 # React hooks
├── types/                 # TypeScript types
├── tests/                 # Tests (TDD)
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                  # Documentation
```

## Documentation

- [ROADMAP.md](./ROADMAP.md) - Plan de developpement
- [docs/FEATURES.md](./docs/FEATURES.md) - Fonctionnalites detaillees
- [docs/BADGES.md](./docs/BADGES.md) - Systeme de badges
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture ISO

## Auteur

Projet familial - App educative pour enfants.

## Licence

Prive - Usage familial uniquement.
