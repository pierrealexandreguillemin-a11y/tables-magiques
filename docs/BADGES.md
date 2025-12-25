# Systeme de Badges - Tables Magiques

Documentation complete du systeme de recompenses.

## Vue d'ensemble

| Type      | Nombre | Persistance                          |
| --------- | ------ | ------------------------------------ |
| Practice  | 8      | Redis (tm:badges:{userId}:practice)  |
| Challenge | 5      | Redis (tm:badges:{userId}:challenge) |

Les badges sont separes par mode : un badge Practice ne peut etre gagne qu'en mode Practice.

---

## Badges Mode Practice

### 1. Premiere Etoile

| Propriete | Valeur                        |
| --------- | ----------------------------- |
| ID        | `first`                       |
| Emoji     | ⭐                            |
| Nom       | Premiere Etoile               |
| Condition | Premiere reponse correcte     |
| Message   | "Ta premiere bonne reponse !" |

### 2. Licorne Magique

| Propriete | Valeur                       |
| --------- | ---------------------------- |
| ID        | `streak5`                    |
| Emoji     | 🦄                           |
| Nom       | Licorne Magique              |
| Condition | 5 bonnes reponses (cumulees) |
| Message   | "5 bonnes reponses !"        |

### 3. Princesse des Maths

| Propriete | Valeur                        |
| --------- | ----------------------------- |
| ID        | `streak10`                    |
| Emoji     | 👑                            |
| Nom       | Princesse des Maths           |
| Condition | 10 bonnes reponses (cumulees) |
| Message   | "10 bonnes reponses !"        |

### 4. Arc-en-ciel Parfait

| Propriete | Valeur                 |
| --------- | ---------------------- |
| ID        | `perfect5`             |
| Emoji     | 🌈                     |
| Nom       | Arc-en-ciel Parfait    |
| Condition | 5/5 sans aucune erreur |
| Message   | "5 sur 5 parfait !"    |

### 5. Etoile Brillante

| Propriete | Valeur                        |
| --------- | ----------------------------- |
| ID        | `streak20`                    |
| Emoji     | ✨                            |
| Nom       | Etoile Brillante              |
| Condition | 20 bonnes reponses (cumulees) |
| Message   | "20 bonnes reponses !"        |

### 6. Fee des Calculs

| Propriete | Valeur                |
| --------- | --------------------- |
| ID        | `perfect10`           |
| Emoji     | 🧚                    |
| Nom       | Fee des Calculs       |
| Condition | 10/10 parfait         |
| Message   | "10 sur 10 parfait !" |

### 7. Reine Magique

| Propriete | Valeur                        |
| --------- | ----------------------------- |
| ID        | `streak30`                    |
| Emoji     | 👸                            |
| Nom       | Reine Magique                 |
| Condition | 30 bonnes reponses (cumulees) |
| Message   | "30 bonnes reponses !"        |

### 8. Super Championne

| Propriete | Valeur                        |
| --------- | ----------------------------- |
| ID        | `streak50`                    |
| Emoji     | 🏆                            |
| Nom       | Super Championne              |
| Condition | 50 bonnes reponses (cumulees) |
| Message   | "50 bonnes reponses !"        |

---

## Badges Mode Challenge

### 1. Eclair Rapide

| Propriete | Valeur                  |
| --------- | ----------------------- |
| ID        | `challenge5`            |
| Emoji     | ⚡                      |
| Nom       | Eclair Rapide           |
| Condition | 5 reponses en challenge |
| Message   | "5 reponses rapides !"  |

### 2. Ninja des Maths

| Propriete | Valeur                       |
| --------- | ---------------------------- |
| ID        | `challenge10`                |
| Emoji     | 🥷                           |
| Nom       | Ninja des Maths              |
| Condition | 10 reponses en challenge     |
| Message   | "10 reponses en 3 minutes !" |

### 3. Fusee Magique

| Propriete | Valeur                       |
| --------- | ---------------------------- |
| ID        | `challenge15`                |
| Emoji     | 🚀                           |
| Nom       | Fusee Magique                |
| Condition | 15 reponses en challenge     |
| Message   | "15 reponses en 3 minutes !" |

### 4. Reine de la Vitesse

| Propriete | Valeur                       |
| --------- | ---------------------------- |
| ID        | `challenge20`                |
| Emoji     | ⚡👑                         |
| Nom       | Reine de la Vitesse          |
| Condition | 20 reponses en challenge     |
| Message   | "20 reponses en 3 minutes !" |

### 5. Perfection Chronometree

| Propriete | Valeur                   |
| --------- | ------------------------ |
| ID        | `challengePerfect`       |
| Emoji     | 💎                       |
| Nom       | Perfection Chronometree  |
| Condition | Challenge parfait (100%) |
| Message   | "Challenge parfait !"    |

---

## Implementation technique

### Structure Redis

```
tm:badges:{userId}:practice  -> Set['first', 'streak5', 'streak10', ...]
tm:badges:{userId}:challenge -> Set['challenge5', 'challenge10', ...]
```

### API Endpoints

```
GET  /api/badges/:userId
     -> { practice: [...], challenge: [...] }

POST /api/badges/:userId
     -> { badgeId: string, type: 'practice' | 'challenge' }
```

### Types TypeScript

```typescript
// types/badge.ts

export type BadgeType = 'practice' | 'challenge';

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  condition: string;
  message: string;
  type: BadgeType;
}

export interface UserBadges {
  practice: string[]; // Badge IDs
  challenge: string[]; // Badge IDs
}
```

### Logique de verification

```typescript
// lib/game/badges.ts

export function checkBadgeUnlock(
  stats: GameStats,
  earnedBadges: string[],
  mode: BadgeType
): string | null {
  // Retourne le badge ID si nouveau badge debloque
  // Retourne null si aucun nouveau badge
}
```

---

## UI/UX Badges

### Affichage collection

- Grille de badges en haut de l'ecran
- Badges gagnes : couleur pleine + brillance
- Badges non gagnes : grise + opacite reduite

### Animation deblocage

1. Notification centrale apparait
2. Badge fait rotation 360°
3. Effet de brillance pulse
4. Feux d'artifice autour
5. Message de felicitation

### Info au toucher

Quand l'utilisateur touche un badge gagne :

- Modal avec emoji grand format
- Nom du badge
- Explication comment gagne
- Indication mode (Practice ou Challenge)

---

## Configuration

```typescript
// config/badges.ts

export const PRACTICE_BADGES: Badge[] = [
  { id: 'first', emoji: '⭐', name: 'Premiere Etoile', ... },
  { id: 'streak5', emoji: '🦄', name: 'Licorne Magique', ... },
  // ...
];

export const CHALLENGE_BADGES: Badge[] = [
  { id: 'challenge5', emoji: '⚡', name: 'Eclair Rapide', ... },
  // ...
];

export const ALL_BADGES = {
  practice: PRACTICE_BADGES,
  challenge: CHALLENGE_BADGES,
};
```
