# Features - Tables Magiques

Documentation detaillee des fonctionnalites.

## Vue d'ensemble

| Mode      | Description        | Timer | Badges |
| --------- | ------------------ | ----- | ------ |
| Practice  | Entrainement libre | Non   | 8      |
| Challenge | Contre la montre   | Oui   | 5      |

---

## Mode Practice

### Selection de table

L'utilisateur peut choisir :

- Tables individuelles : 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Toutes les tables : melange aleatoire

### Deroulement

1. Selection de la table
2. Question affichee (ex: "7 x 8 = ?")
3. Saisie reponse via clavier tactile
4. Verification avec bouton "Verifier"
5. Feedback immediat :
   - Correct : feux d'artifice + message positif
   - Incorrect : shake + correction affichee
6. Question suivante automatique

### Clavier tactile

```
+-------+-------+-------+
|   1   |   2   |   3   |
+-------+-------+-------+
|   4   |   5   |   6   |
+-------+-------+-------+
|   7   |   8   |   9   |
+-------+-------+-------+
|Effacer|   0   |Retour |
+-------+-------+-------+
|     VERIFIER          |
+-----------------------+
```

- **Effacer** : Vide completement la reponse
- **Retour** : Supprime le dernier chiffre
- **Verifier** : Valide la reponse

### Scoring Practice

- Score = bonnes reponses / total
- Serie : bonnes reponses consecutives
- Parfait : 100% sur une session

---

## Mode Challenge

### Regles

- **Duree totale** : 3 minutes
- **Temps par question** : 5 secondes
- **Auto-skip** : Si temps ecoule, passe a la suivante (compte comme erreur)
- **Tables** : Toutes les tables melangees

### Timer global

```
+---------------------------+
|     02:45                 |  <- Minutes:Secondes
|     [================    ]|  <- Barre progression
+---------------------------+
```

- Affichage gros format
- Barre de progression
- Pulse rouge quand < 30 secondes
- Game over quand 00:00

### Timer par question

```
+---------------------------+
|  [=====     ]  3s         |
+---------------------------+
```

- 5 secondes par question
- Barre de progression decroissante
- Animation urgence derniere seconde
- Skip automatique a 0

### Scoring Challenge

- Nombre de bonnes reponses en 3 minutes
- Temps restant non utilise (bonus)
- Perfectionnement : challenge sans erreur

---

## Interface utilisateur

### Elements visuels

1. **Arcs-en-ciel animes**
   - Coins superieur gauche et inferieur droit
   - Animation rotation lente
   - Opacite reduite (decoratif)

2. **Gradient background**
   - Animation continue
   - Couleurs : rose, violet, bleu, turquoise
   - Transition fluide 15 secondes

3. **Particules flottantes**
   - 20-30 particules blanches
   - Mouvement aleatoire doux
   - Scintillement

4. **Licorne mascotte**
   - Animation flottante
   - Reaction au hover
   - Celebration sur victoire

### Animations GSAP

| Element       | Animation            | Declencheur      |
| ------------- | -------------------- | ---------------- |
| Titre         | Elastic drop         | Page load        |
| Boutons       | Scale + glow         | Hover            |
| Score         | Counter up           | Mise a jour      |
| Badges        | Pop + rotation       | Deblocage        |
| Feux artifice | Explosion particules | Bonne reponse    |
| Shake         | Vibration            | Mauvaise reponse |

### Feedback utilisateur

**Bonne reponse :**

- Feux d'artifice (30 particules)
- Message : "Bravo !", "Super !", "Magnifique !"
- Couleur verte
- Son optionnel

**Mauvaise reponse :**

- Shake animation
- Message : "Presque !", "Essaie encore !"
- Affichage correction
- Couleur douce (pas de rouge agressif)

---

## Accessibilite

### Fonts

- Police principale : OpenDyslexic
- Alternative : system-ui
- Tailles adaptatives (responsive)

### Contrastes

- WCAG 2.1 AA minimum
- Couleurs testees sur fond gradient
- Mode dark avec contrastes adaptes

### Navigation

- Clavier tactile optimise grands doigts
- Zones de clic larges (min 44x44px)
- Focus visible
- Tab navigation complete

---

## Dark Mode

### Activation

- Toggle dans header
- Persistance localStorage
- Detection preference systeme

### Adaptations

| Element    | Light                | Dark                        |
| ---------- | -------------------- | --------------------------- |
| Background | Gradient rose/violet | Gradient bleu/violet sombre |
| Texte      | Blanc                | Blanc                       |
| Boutons    | Blanc/rose           | Gris fonce/violet           |
| Badges     | Fond clair           | Fond sombre                 |

---

## PWA

### Installation

1. Ouvrir app dans navigateur
2. Menu > "Ajouter a l'ecran d'accueil"
3. L'app s'installe avec icone licorne

### Offline

- Cache des assets statiques
- Derniers scores disponibles
- Message si hors ligne

### Manifest

```json
{
  "name": "Tables Magiques",
  "short_name": "Tables",
  "theme_color": "#ff69b4",
  "background_color": "#ba55d3",
  "display": "standalone"
}
```
