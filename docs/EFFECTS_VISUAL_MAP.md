# Carte Visuelle - Architecture Effets

> Vue d'ensemble graphique de tous les composants et leur relation

---

## ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TABLES MAGIQUES - EFFETS                        │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      APP LAYOUT                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  FairyBackground (P0)                                       │  │ │
│  │  │  ┌───────┐ ┌───────┐ ┌───────┐                             │  │ │
│  │  │  │ Nuage │ │ Nuage │ │ Nuage │ + 20 étoiles ✨             │  │ │
│  │  │  │ Rose  │ │Violet │ │ Bleu  │                             │  │ │
│  │  │  └───────┘ └───────┘ └───────┘                             │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  HEADER                                                      │  │ │
│  │  │  ┌──────────────┐              ┌──────────────┐            │  │ │
│  │  │  │MagicCounter  │              │CrownProgress │            │  │ │
│  │  │  │   125 ⭐     │              │   75% 👑     │            │  │ │
│  │  │  └──────────────┘              └──────────────┘            │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  MAIN CONTENT - MagicCard (P0)                              │  │ │
│  │  │  ┌────────────────────────────────────────────────────────┐ │  │ │
│  │  │  │  🦄 Table du 7 - Niveau Licorne                        │ │  │ │
│  │  │  │                                                         │ │  │ │
│  │  │  │  Combien font 7 × 8 ?                                  │ │  │ │
│  │  │  │                                                         │ │  │ │
│  │  │  │  ┌────────┐  ┌──────────┐                             │ │  │ │
│  │  │  │  │  [56]  │  │AnswerIcon│ ⭐                           │ │  │ │
│  │  │  │  └────────┘  └──────────┘                             │ │  │ │
│  │  │  │                                                         │ │  │ │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │ │  │ │
│  │  │  │  │MagicBtn  │ │MagicBtn  │ │MagicBtn  │              │ │  │ │
│  │  │  │  │   54     │ │   56 ✓   │ │   64     │              │ │  │ │
│  │  │  │  └──────────┘ └──────────┘ └──────────┘              │ │  │ │
│  │  │  └────────────────────────────────────────────────────────┘ │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  TOAST NOTIFICATIONS (P1)                  ┌──────────────┐ │  │ │
│  │  │                                            │ 🌟 Super !   │ │  │ │
│  │  │                                            │ Champion !   │ │  │ │
│  │  │                                            └──────────────┘ │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  CONFETTI OVERLAY (P0 - célébrations)                       │  │ │
│  │  │  *  ✨  💫  🌟  ⭐  ✨  *  💫  🌟                          │  │ │
│  │  │    ✨  *  🌟  💫  ⭐  *  ✨  🌟  💫                        │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## COMPOSANTS PAR PRIORITE

### PRIORITE P0 - CRITIQUE GAMEPLAY (12 composants)

```
┌─────────────────────────────────────────────────────────────┐
│ P0 - MVP JOUABLE (2 semaines)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. FairyBackground          🎨 Ambiance magique            │
│     │                                                       │
│     ├─ 3 nuages animés (rose, violet, bleu)               │
│     ├─ 20 étoiles scintillantes                           │
│     └─ Fallback statique (reduced motion)                 │
│                                                             │
│  2. MagicCard                💎 Cartes exercices            │
│     │                                                       │
│     ├─ Variant princess (rose)                            │
│     ├─ Variant unicorn (violet)                           │
│     ├─ Variant star (jaune)                               │
│     ├─ Hover animation (scale 1.02)                       │
│     └─ Glass effect (backdrop-blur)                       │
│                                                             │
│  3. MagicButton              🔘 Validation réponse          │
│     │                                                       │
│     ├─ Gradient animé                                     │
│     ├─ Effet paillettes au clic (8 particules)           │
│     ├─ États: idle, hover, loading, disabled             │
│     └─ Touch-friendly (44x44px min)                       │
│                                                             │
│  4. AnswerIcon               ✅ Feedback réponse            │
│     │                                                       │
│     ├─ État waiting (cercle pulsant)                      │
│     ├─ État checking (spinner)                            │
│     ├─ État correct (étoile ⭐)                            │
│     ├─ État incorrect (bulle 💭)                          │
│     └─ Transitions AnimatePresence                        │
│                                                             │
│  5. MagicCounter             🔢 Score animé                 │
│     │                                                       │
│     ├─ Animation nombre (react-spring)                    │
│     ├─ Particules étoiles quand augmente                  │
│     ├─ Scale bounce +10%                                  │
│     └─ Suffix customizable (" étoiles")                   │
│                                                             │
│  6. CrownProgress            👑 Progression niveau          │
│     │                                                       │
│     ├─ SVG circle animé                                   │
│     ├─ Gradient rose → violet → or                        │
│     ├─ Glow effect (SVG filter)                           │
│     └─ Emoji 👑 + pourcentage                             │
│                                                             │
│  7. MagicLoader              ⏳ Chargement initial          │
│     │                                                       │
│     ├─ Licorne 🦄 animée (pulse + rotate)                 │
│     ├─ 5 emojis qui dansent                               │
│     └─ Texte "Préparation..."                             │
│                                                             │
│  8. MagicConfetti            🎉 Célébration succès          │
│     │                                                       │
│     ├─ 30 particules (performance)                        │
│     ├─ Couleurs princesse                                 │
│     └─ Presets (small, medium, large)                     │
│                                                             │
│  9. Input Focus States       📝 Saisie réponse              │
│     │                                                       │
│     ├─ Bordure magique (glow violet)                      │
│     ├─ Scale 1.05 au focus                                │
│     └─ Validation visuelle                                │
│                                                             │
│  10. Reduced Motion          ♿ Accessibilité                │
│      │                                                      │
│      ├─ Hook useReducedMotion                             │
│      ├─ Désactive animations complexes                    │
│      └─ Fallbacks statiques                               │
│                                                             │
│  11. Focus Indicators        ⌨️  Navigation clavier          │
│      │                                                      │
│      ├─ Focus visible partout                             │
│      └─ Ring rose/violet                                  │
│                                                             │
│  12. Validation Feedback     ✔️ Feedback inline             │
│      │                                                      │
│      ├─ Checkmark vert (correct)                          │
│      └─ Message doux (incorrect)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### PRIORITE P1 - RECOMPENSES/MOTIVATION (15 composants)

```
┌─────────────────────────────────────────────────────────────┐
│ P1 - MOTIVATION (1 semaine)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Toast Notifications      💬 Encouragements              │
│     ├─ Type success (🌟 Super !)                           │
│     ├─ Type star (✨ Continue !)                           │
│     ├─ Type crown (👑 Niveau up !)                         │
│     └─ Stack max 3, auto-dismiss 3s                        │
│                                                             │
│  2. Inline Spinner           ⏱️  Attente validation          │
│  3. GentleShake              😌 Erreur douce                 │
│  4. GradientText             🌈 Titres niveaux               │
│  5. AnimatedToggle           🔘 Paramètres (son, etc.)       │
│  6. Elevation System         📦 Profondeur cartes            │
│  7. Dynamic Shadows          💫 Hover profondeur             │
│  8. Screen Reader            👂 Annonces score               │
│  9. High Contrast            🔆 Mode contraste élevé         │
│  10. Text Shimmer            ✨ Badges spéciaux              │
│  11. Stagger List            📋 Animations listes            │
│  12. Sound System            🔊 Sons magiques                │
│  13. Ripple Effect           〰️ Boutons secondaires          │
│  14. Gradient Borders        🌟 Cartes bonus                 │
│  15. Direction Tabs          ➡️ Navigation niveaux           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### PRIORITE P2 - POLISH UX (10 composants)

```
┌─────────────────────────────────────────────────────────────┐
│ P2 - POLISH (1 semaine)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Skeleton Loaders         ⏳ Chargement données           │
│  2. Card Skeleton            🃏 Placeholder cartes           │
│  3. TextReveal               📖 Intros niveaux               │
│  4. ScrollReveal             📜 Résultats progressive        │
│  5. AnimatedCheckbox         ☑️ Mode QCM                     │
│  6. Noise Overlay            🎨 Texture grain                │
│  7. Glowing Dividers         ─ Séparateurs glow             │
│  8. Drag & Drop              🤏 Mode création (avancé)       │
│  9. Bundle Optimization      📦 Performance                  │
│  10. CSS Custom Properties   🎨 Thème unifié                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### PRIORITE P3 - BONUS (5 composants)

```
┌─────────────────────────────────────────────────────────────┐
│ P3 - BONUS (optionnel)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Parallax Layers          🏔️  (si scroll long)            │
│  2. Sticky Header Transform  📌 (si nécessaire)              │
│  3. Scroll Progress          📊 (si scroll long)             │
│  4. Typewriter Effect        ⌨️  (trop lent pour enfants)    │
│  5. Mesh Gradient            🌀 (alternative Aurora)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPOSANTS EXCLUS (16 composants)

```
┌─────────────────────────────────────────────────────────────┐
│ ❌ EXCLUS (non applicable jeu enfant)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Cursor Spotlight         → Tablettes tactiles           │
│  2. Magnetic Buttons         → Trop subtil enfants          │
│  3. Shared Element Transition → Trop complexe navigation    │
│  4. Parallax (si pas scroll) → Jeu 1 écran par exercice    │
│  5. Sticky Header            → Pas nécessaire               │
│  6. Scroll Progress          → Pas de scroll long           │
│  7. Typewriter Effect        → Trop lent/frustrant          │
│  8. Mesh Gradient            → Doublon Aurora               │
│  9. Animated Grid            → Pas féerique                 │
│  10. Vignette Effect         → Réduit lisibilité            │
│  11. Liquid Buttons (keep simple) → Complexe               │
│  12. Morphing Complex        → Trop subtil                  │
│  13. Full Page Transitions   → Keep simple fade            │
│  14. Advanced Parallax       → No scroll                    │
│  15. Complex SVG Filters     → Performance                  │
│  16. 3D Transforms           → Keep 2D simple               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## FLUX UTILISATEUR AVEC EFFETS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PARCOURS JOUEUR                                 │
└─────────────────────────────────────────────────────────────────────────┘

1. CHARGEMENT APP
   │
   ├─► MagicLoader (licorne 🦄 + étoiles dansantes)
   │   Durée: 1-3s
   │
   └─► Fade out → Page accueil

2. PAGE ACCUEIL
   │
   ├─► FairyBackground (nuages + étoiles)
   ├─► MagicCard (sélection table)
   │   ├─ Table du 2 (facile)
   │   ├─ Table du 5 (moyen)
   │   └─ Table du 7 (difficile)
   │
   └─► Click → Niveau sélectionné

3. PAGE EXERCICE
   │
   ├─► Header
   │   ├─ MagicCounter (score actuel: 0 ⭐)
   │   └─ CrownProgress (0% 👑)
   │
   ├─► MagicCard principale
   │   ├─ Question: "7 × 8 = ?"
   │   ├─ Input (focus → glow violet)
   │   └─ AnswerIcon (waiting...)
   │
   └─► MagicButtons (choix multiples)
       ├─ 54
       ├─ 56 ← Correct
       └─ 64

4. VALIDATION REPONSE
   │
   ├─► Si CORRECT:
   │   ├─ AnswerIcon → ⭐ (animation scale + rotate)
   │   ├─ MagicCounter +10 (particules étoiles ✨)
   │   ├─ CrownProgress +10% (couronne se remplit)
   │   ├─ Toast "🌟 Super !"
   │   └─ Confetti si série 5+ 🎉
   │
   └─► Si INCORRECT:
       ├─ AnswerIcon → 💭 (shake doux)
       ├─ GentleShake du MagicCard
       └─ Message "💭 Presque ! Essaie encore"
           (JAMAIS de rouge vif)

5. FIN NIVEAU (10 questions)
   │
   ├─► CrownProgress → 100%
   ├─► MagicConfetti (celebration large 🎉)
   ├─► Modal résultats
   │   ├─ Badge niveau (👑 Princesse du 7)
   │   ├─ Score final (85 ⭐)
   │   └─ MagicButton "Niveau suivant"
   │
   └─► ScrollReveal (trophées obtenus)

6. PAGE RESULTATS
   │
   ├─► StaggerList (historique)
   │   ├─ Table du 2: 100% ✅
   │   ├─ Table du 5: 80% ⭐
   │   └─ Table du 7: 85% 👑
   │
   └─► GradientBorder (meilleur score)
```

---

## DEPENDANCES ENTRE COMPOSANTS

```
useReducedMotion (hook)
    │
    ├─► FairyBackground
    ├─► MagicCard
    ├─► MagicButton
    ├─► AnswerIcon
    ├─► MagicCounter
    ├─► CrownProgress
    ├─► MagicConfetti
    ├─► Toasts
    └─► Toutes animations

tokens.css (variables)
    │
    ├─► Tous composants (couleurs)
    ├─► animations.css (keyframes)
    └─► Tailwind config

Framer Motion (lib)
    │
    ├─► 80% composants animés
    └─► AnimatePresence (transitions)

@react-spring/web (lib)
    │
    └─► MagicCounter (animation nombre)

canvas-confetti (lib)
    │
    └─► MagicConfetti (célébrations)
```

---

## PERFORMANCE BUDGET

```
┌─────────────────────────────────────────────────────────────┐
│ BUDGET PERFORMANCE                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Bundle Size                                             │
│     ├─ Effects components: < 150kb gzippé                  │
│     ├─ Framer Motion: ~60kb                                │
│     ├─ React Spring: ~30kb                                 │
│     ├─ Confetti: ~8kb                                      │
│     └─ Total effects: < 250kb                              │
│                                                             │
│  ⚡ Runtime Performance                                     │
│     ├─ FPS: > 30 constant (tablette)                       │
│     ├─ TTI: < 3s                                            │
│     ├─ Animations simultanées: < 4                         │
│     └─ Memory: < 100MB après 30 min                        │
│                                                             │
│  🎨 Visual Performance                                      │
│     ├─ Particules confetti: max 30                         │
│     ├─ Étoiles background: max 20                          │
│     ├─ Animations: GPU only (transform/opacity)            │
│     └─ Blur: static only (no animated blur)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ARBORESCENCE FICHIERS

```
tables-magiques/
├─ src/
│  ├─ components/
│  │  ├─ effects/
│  │  │  ├─ FairyBackground.tsx          ⭐ P0
│  │  │  ├─ MagicCard.tsx                ⭐ P0
│  │  │  ├─ MagicButton.tsx              ⭐ P0
│  │  │  ├─ AnswerIcon.tsx               ⭐ P0
│  │  │  ├─ MagicCounter.tsx             ⭐ P0
│  │  │  ├─ CrownProgress.tsx            ⭐ P0
│  │  │  ├─ MagicLoader.tsx              ⭐ P0
│  │  │  ├─ MagicConfetti.tsx            ⭐ P0
│  │  │  ├─ GentleShake.tsx              💎 P1
│  │  │  ├─ Toast/
│  │  │  │  ├─ ToastContainer.tsx        💎 P1
│  │  │  │  └─ useToast.ts               💎 P1
│  │  │  ├─ GradientText.tsx             💎 P1
│  │  │  ├─ AnimatedToggle.tsx           💎 P1
│  │  │  ├─ StaggerList.tsx              🎨 P2
│  │  │  ├─ TextReveal.tsx               🎨 P2
│  │  │  ├─ Skeleton.tsx                 🎨 P2
│  │  │  └─ ...
│  │  └─ ui/
│  │     ├─ Input.tsx                    (avec focus states)
│  │     └─ Button.tsx
│  ├─ hooks/
│  │  ├─ useReducedMotion.ts             ⭐ P0
│  │  ├─ useMediaQuery.ts                ⭐ P0
│  │  ├─ useAnnouncer.ts                 💎 P1
│  │  └─ useSound.ts                     💎 P1 (optionnel)
│  ├─ stores/
│  │  └─ useToastStore.ts                💎 P1
│  ├─ styles/
│  │  ├─ tokens.css                      ⭐ P0
│  │  ├─ animations.css                  ⭐ P0
│  │  ├─ focus.css                       💎 P1
│  │  └─ high-contrast.css               💎 P1
│  └─ pages/
│     ├─ ExercisePage.tsx
│     ├─ ResultsPage.tsx
│     └─ TestEffects.tsx                 (développement)
├─ public/
│  └─ sounds/                            💎 P1 (optionnel)
│     ├─ magic-ding.mp3
│     ├─ soft-oops.mp3
│     └─ level-up.mp3
└─ docs/
   ├─ EFFECTS_COMPONENTS_ANALYSIS.md     📖 Principal
   ├─ EFFECTS_CODE_EXAMPLES.md           💻 Pratique
   ├─ EFFECTS_ACTION_PLAN.md             📋 Roadmap
   ├─ EFFECTS_CHECKLIST.md               ✅ À imprimer
   ├─ EFFECTS_VISUAL_MAP.md              🗺️  (ce fichier)
   └─ README_EFFECTS.md                  📚 Guide
```

---

## LEGENDE

```
⭐ P0 = Critique gameplay (MVP)
💎 P1 = Récompenses/motivation
🎨 P2 = Polish UX
🎁 P3 = Bonus optionnel
❌ = Exclu (non applicable)

🦄 = Thème licorne
👑 = Thème princesse
⭐ = Récompense/succès
💭 = Encouragement
```

---

## TIMELINE VISUELLE

```
PHASE 0: SETUP (1-2 jours)
│
├──┤ Jour 1: Install + Config
│  └─ npm install, tokens.css, animations.css
│
└──┤ Jour 2: Hooks + Test
   └─ useReducedMotion, page test

═══════════════════════════════════════════════════════════════

PHASE 1: MVP (2 semaines)
│
├──┤ Semaine 1: Composants Visuels
│  ├─ Lundi:    FairyBackground
│  ├─ Mardi:    MagicCard
│  ├─ Mercredi: MagicButton
│  ├─ Jeudi:    AnswerIcon
│  └─ Vendredi: MagicCounter
│
└──┤ Semaine 2: Feedback & Intégration
   ├─ Lundi:    CrownProgress
   ├─ Mardi:    MagicLoader
   ├─ Mercredi: MagicConfetti
   ├─ Jeudi:    Input Focus
   └─ Vendredi: Tests & Intégration ✅

═══════════════════════════════════════════════════════════════

PHASE 2: POLISH (1 semaine)
│
├──┤ Jour 1-2: Toasts + Shake
├──┤ Jour 3:   GradientText
├──┤ Jour 4:   Toggle + Sounds
└──┤ Jour 5:   Tests & Ajustements

═══════════════════════════════════════════════════════════════

PHASE 3: ENRICHISSEMENT (1 semaine)
│
└──┤ Composants P2 (pick & choose)

═══════════════════════════════════════════════════════════════

PHASE 4: OPTIMISATION (3-4 jours)
│
├──┤ Performance
├──┤ Accessibilité
├──┤ Tests enfants
└──┤ Ajustements ✅ RELEASE
```

---

> **Carte visuelle créée le**: 2025-12-25
> **Format**: ASCII Art pour compatibilité maximale
> **À consulter**: Au début de chaque phase
