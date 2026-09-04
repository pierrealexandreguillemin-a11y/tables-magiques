# Checklist Implémentation Effets - Tables Magiques

> **Imprimez cette page** et cochez au fur et à mesure
> **Durée totale estimée**: 4-5 semaines

---

## PHASE 0 - SETUP (1-2 jours)

### Configuration Environnement

- [ ] `npm install framer-motion @react-spring/web canvas-confetti`
- [ ] `npm install -D @types/canvas-confetti`
- [ ] Créer dossier `src/components/effects/`
- [ ] Créer dossier `src/hooks/`
- [ ] Créer dossier `src/styles/`

### Fichiers CSS de base

- [ ] Créer `src/styles/tokens.css`
- [ ] Copier variables CSS (couleurs princesse/licorne)
- [ ] Créer `src/styles/animations.css`
- [ ] Copier keyframes (shimmer, sparkle, etc.)
- [ ] Importer dans `App.tsx` ou `main.tsx`

### Configuration Tailwind (si utilisé)

- [ ] Étendre `tailwind.config.js` avec couleurs custom
- [ ] Ajouter shadows princesse/unicorn
- [ ] Tester compilation CSS

### Hooks Accessibilité

- [ ] Créer `src/hooks/useMediaQuery.ts`
- [ ] Créer `src/hooks/useReducedMotion.ts`
- [ ] Tester hook reduced motion

### Page de Test

- [ ] Créer `src/pages/TestEffects.tsx`
- [ ] Tester gradient fairy
- [ ] Tester animation bounce-soft
- [ ] Valider setup ✅

**Checkpoint Phase 0**: Gradient visible + animation fonctionne

---

## PHASE 1 - MVP JOUABLE (2 semaines)

### Semaine 1 - Composants Visuels

#### Lundi - FairyBackground

- [ ] Créer `src/components/effects/FairyBackground.tsx`
- [ ] Implémenter 3 nuages colorés (rose, violet, bleu)
- [ ] Ajouter 20 étoiles scintillantes
- [ ] Intégrer dans layout principal
- [ ] Tester FPS > 30
- [ ] Tester avec reduced motion (fallback statique)

**Temps estimé**: 3-4h

---

#### Mardi - MagicCard

- [ ] Créer `src/components/effects/MagicCard.tsx`
- [ ] Implémenter variant `princess` (rose)
- [ ] Implémenter variant `unicorn` (violet)
- [ ] Implémenter variant `star` (jaune)
- [ ] Ajouter hover animation (scale 1.02)
- [ ] Ajouter tap animation (scale 0.98)
- [ ] Tester 3 variants côte à côte

**Temps estimé**: 2-3h

---

#### Mercredi - MagicButton

- [ ] Créer `src/components/effects/MagicButton.tsx`
- [ ] Implémenter gradient background
- [ ] Ajouter effet paillettes au clic (8 particules)
- [ ] Gérer état `disabled`
- [ ] Gérer état `loading` (spinner)
- [ ] Tester sur mobile/tablette (touch)
- [ ] Ajuster taille touch target (min 44x44px)

**Temps estimé**: 3-4h

---

#### Jeudi - AnswerIcon

- [ ] Créer `src/components/effects/AnswerIcon.tsx`
- [ ] État `waiting`: cercle pulsant
- [ ] État `checking`: spinner rotation
- [ ] État `correct`: étoile avec scale + rotate
- [ ] État `incorrect`: bulle pensée avec shake
- [ ] Transitions AnimatePresence
- [ ] Tester changements rapides d'état

**Temps estimé**: 2-3h

---

#### Vendredi - MagicCounter

- [ ] Créer `src/components/effects/MagicCounter.tsx`
- [ ] Intégrer react-spring pour animation nombre
- [ ] Ajouter particules étoiles quand augmentation
- [ ] Gérer suffix (étoiles, points, etc.)
- [ ] Tester incrémentation +1, +5, +10
- [ ] Scale bounce quand augmente

**Temps estimé**: 3h

---

### Semaine 2 - Feedback & Intégration

#### Lundi - CrownProgress

- [ ] Créer `src/components/effects/CrownProgress.tsx`
- [ ] SVG circle avec strokeDasharray
- [ ] Gradient rose → violet → or
- [ ] Filtre glow SVG
- [ ] Emoji couronne 👑 au centre
- [ ] Pourcentage animé
- [ ] Tester 0%, 50%, 100%

**Temps estimé**: 3-4h

---

#### Mardi - MagicLoader

- [ ] Créer `src/components/effects/MagicLoader.tsx`
- [ ] Licorne 🦄 avec pulse + rotate
- [ ] 5 emojis qui dansent (étoiles, etc.)
- [ ] Texte "Préparation des tables magiques..."
- [ ] Fond gradient rose → violet
- [ ] Intégrer dans `App.tsx` (loading initial)

**Temps estimé**: 2h

---

#### Mercredi - MagicConfetti

- [ ] Créer `src/components/effects/MagicConfetti.tsx`
- [ ] Fonction `fireMagicConfetti()`
- [ ] Couleurs princesse (rose, violet, bleu, or)
- [ ] Limiter à 30 particules (performance)
- [ ] Tester sur mobile
- [ ] Créer presets (small, medium, large)

**Temps estimé**: 3h

---

#### Jeudi - Input Magique

- [ ] Créer composant input wrapper
- [ ] Bordure magique au focus (glow violet)
- [ ] Scale 1.05 au focus
- [ ] Validation visuelle (vert/rose)
- [ ] Test accessibilité clavier
- [ ] Label flottant (optionnel)

**Temps estimé**: 2h

---

#### Vendredi - Intégration & Tests

- [ ] Créer page exercice complète
- [ ] Assembler tous composants P0
- [ ] Flow: Loader → Exercice → Validation → Confetti
- [ ] Tester sur tablette iPad/Android
- [ ] Mesurer FPS (> 30)
- [ ] Ajuster timings si trop lent/rapide
- [ ] Corriger bugs découverts
- [ ] Commit "Phase 1 complete"

**Temps estimé**: Full day

**Checkpoint Phase 1**: Jeu jouable de bout en bout avec effets P0

---

## PHASE 2 - MOTIVATION & POLISH (1 semaine)

### Toast Notifications

- [ ] Créer `src/stores/useToastStore.ts` (Zustand)
- [ ] Créer `src/components/effects/Toast/ToastContainer.tsx`
- [ ] Type `success` (vert)
- [ ] Type `star` (jaune)
- [ ] Type `crown` (violet)
- [ ] Type `info` (bleu)
- [ ] Stack empilable (max 3)
- [ ] Auto-dismiss après 3s
- [ ] Progress bar
- [ ] Tester 5 toasts simultanés

**Temps estimé**: 4h

---

### GentleShake & Messages Encourageants

- [ ] Wrapper shake pour erreurs
- [ ] Amplitude réduite (3px max)
- [ ] Durée courte (300ms)
- [ ] Message rose pastel "💭 Presque !"
- [ ] JAMAIS de rouge vif
- [ ] Liste 10 messages encourageants
- [ ] Rotation aléatoire messages

**Temps estimé**: 3h

---

### GradientText Titres

- [ ] Créer composant ou classe CSS
- [ ] Gradient fairy (rose → violet → bleu)
- [ ] Gradient unicorn (rainbow 7 couleurs)
- [ ] Animation slide 3s infinite
- [ ] Appliquer aux titres niveaux
- [ ] Tester lisibilité (contraste OK)

**Temps estimé**: 2h

---

### Toggle Switch Paramètres

- [ ] Créer `AnimatedToggle.tsx`
- [ ] Knob avec spring physics
- [ ] Glow quand activé
- [ ] Toggle son 🔇/🔊
- [ ] Toggle difficulté 🐣/👑
- [ ] Intégrer dans page paramètres

**Temps estimé**: 2h

---

### Système Sons (optionnel)

- [ ] Hook `useSound.ts`
- [ ] Fichier MP3 "magic-ding.mp3" (<500ms)
- [ ] Fichier MP3 "soft-oops.mp3" (<500ms)
- [ ] Fichier MP3 "level-up.mp3" (~1s)
- [ ] Volume par défaut 50%
- [ ] Son OFF par défaut (important !)
- [ ] Toggle dans paramètres

**Temps estimé**: 4h

---

### Tests & Ajustements

- [ ] Tester flow complet 10 fois
- [ ] Noter frustrations
- [ ] Ajuster timings animations
- [ ] Vérifier messages toujours positifs
- [ ] Lighthouse Accessibility > 90

**Temps estimé**: 3h

**Checkpoint Phase 2**: Jeu motivant avec feedback positif constant

---

## PHASE 3 - ENRICHISSEMENT (1 semaine)

### Composants Additionnels

- [ ] StaggerList (animations listes)
- [ ] Skeleton Loaders (chargement)
- [ ] TextReveal (intros niveaux)
- [ ] ScrollReveal (résultats)
- [ ] AnimatedCheckbox (QCM mode)
- [ ] RippleEffect (boutons secondaires)
- [ ] Elevation Shadows système
- [ ] Gradient Borders (cartes bonus)

**Temps estimé**: 2-3 jours (pick & choose selon priorités)

---

## PHASE 4 - OPTIMISATION (3-4 jours)

### Performance

- [ ] Bundle analyze (< 150kb effects)
- [ ] Lazy load confetti
- [ ] Lazy load composants lourds
- [ ] GPU acceleration vérifié (transform)
- [ ] FPS test sur tablette bas de gamme
- [ ] Lighthouse Performance > 90
- [ ] Memory leaks check (Chrome DevTools)

---

### Accessibilité

- [ ] Reduced Motion 100% respecté
- [ ] Focus indicators visibles partout
- [ ] Contraste AAA (7:1) vérifié
- [ ] Navigation clavier complète
- [ ] Screen reader annonce score
- [ ] Lighthouse Accessibility > 95
- [ ] Test NVDA (Windows) ou VoiceOver (Mac)

---

### Tests Utilisateurs Enfants

- [ ] Recruter 3-5 enfants 9 ans
- [ ] Préparer protocole test (15 min/enfant)
- [ ] Observer sans intervenir
- [ ] Noter frustrations/joies
- [ ] Questionnaire post-test (5 questions)
- [ ] Analyser résultats
- [ ] Prioriser ajustements

**Questions clés**:

1. C'était trop rapide ou trop lent ?
2. Les couleurs te plaisent ?
3. Tu as compris comment jouer ?
4. C'était difficile ou facile ?
5. Tu as envie de rejouer ?

---

### Ajustements Finaux

- [ ] Implémenter top 3 feedbacks enfants
- [ ] Ajuster timings si nécessaire
- [ ] Corriger bugs découverts
- [ ] Polish derniers détails visuels
- [ ] Commit "Ready for production"

---

## CHECKLIST QUALITE FINALE

### Performance ✅

- [ ] FPS moyen > 30 (mobile/tablette)
- [ ] Time to Interactive < 3s
- [ ] Bundle effects < 150kb gzippé
- [ ] Bundle total < 500kb gzippé
- [ ] Aucun memory leak (test 30 min jeu)
- [ ] Lighthouse Performance > 90

---

### Accessibilité ✅

- [ ] Lighthouse Accessibility > 95
- [ ] Navigation clavier complète
- [ ] Reduced motion respecté
- [ ] High contrast mode supporté
- [ ] Screen reader friendly
- [ ] Focus visible partout
- [ ] Pas de piège clavier

---

### UX Enfants ✅

- [ ] Animations < 400ms (sauf célébrations)
- [ ] Feedback < 100ms
- [ ] Pas de rouge vif pour erreurs
- [ ] Messages 100% positifs/encourageants
- [ ] Touch targets > 44x44px
- [ ] Police > 16px partout
- [ ] Boutons clairement identifiés
- [ ] Pas de scroll horizontal
- [ ] Sauvegarde auto progression

---

### Technique ✅

- [ ] Tests unitaires composants critiques
- [ ] Documentation composants
- [ ] Pas de console.errors
- [ ] Compatible Chrome/Firefox/Safari
- [ ] Responsive tablette + desktop
- [ ] Code TypeScript sans any
- [ ] Props validées (PropTypes ou TS)

---

### Contenu ✅

- [ ] Tous textes en français correct
- [ ] Messages adaptés âge 9 ans
- [ ] Vocabulaire simple
- [ ] Emojis appropriés (pas trop)
- [ ] Pas de jargon technique
- [ ] Instructions claires (<10 mots)

---

## METRIQUES CIBLES

### Performance

- **FPS**: > 30 constant
- **TTI**: < 3s
- **Bundle**: < 150kb effects

### Accessibilité

- **Lighthouse**: > 95
- **Contraste**: AAA (7:1)
- **Clavier**: 100% navigable

### Engagement

- **Session moyenne**: > 10 min
- **Retention J+7**: > 40%
- **Taux complétion niveau**: > 70%

---

## POST-LANCEMENT

### Semaine 1

- [ ] Monitorer analytics (temps session, retention)
- [ ] Collecter feedbacks parents/enseignants
- [ ] Corriger bugs critiques (hotfix)

### Mois 1

- [ ] Analyser métriques engagement
- [ ] A/B test variantes couleurs
- [ ] Itérer sur top 3 frustrations

### Mois 3

- [ ] Ajouter nouveaux effets P3
- [ ] Thèmes saisonniers (Noël, etc.)
- [ ] Modes de jeu additionnels

---

## NOTES

**Date début Phase 1**: **\*\***\_\_\_**\*\***

**Date fin Phase 1**: **\*\***\_\_\_**\*\***

**Date tests enfants**: **\*\***\_\_\_**\*\***

**Date release**: **\*\***\_\_\_**\*\***

---

**Bugs découverts**:

1. ***
2. ***
3. ***

---

**Idées améliorations**:

1. ***
2. ***
3. ***

---

**Feedbacks enfants**:

1. ***
2. ***
3. ***

---

> **Checklist version**: 1.0
> **Créée le**: 2025-12-25
> **À imprimer**: Oui
> **Format**: A4 ou Lettre
