---
name: anti-slop-frontend
description: Use when any visual deliverable is about to be produced or reviewed (page, hero, section, storyboard, mockup, design system, component with visual identity), when the user says premium / beau / slop / Awwwards / « ça fait IA » / « PowerPoint », when aesthetic quality is an acceptance criterion, or before claiming a UI is done; also before any mascot render (mane, tail, any 3D look change) is produced or shown to the user. Invoke BEFORE the first line of markup, the first render, or the first reference link.
metadata:
  origin: 'Vocalise 2026-09-09 — post-mortem du fiasco design 2026-09-08 (docs/design/anti-slop-post-mortem-et-dispositif.md)'
  convention: 'chameleon (minimal-fork + audit Étape 0) — identique à skills-templates/project-session-end'
  wiki: 'C:/Dev/wiki/topics/llm-tooling/cookbook-frontend-anti-slop-quatre-couches.md'
---

> Projection 2026-10-24 de `C:\Dev\skills-templates\anti-slop-frontend\` (source canonique,
> à resynchroniser depuis là). Scripts `slop-static-gate.mjs` / `calibrate.mjs` **non projetés** :
> aucune fixture négative de page n'existe encore pour les calibrer (un gate jamais vu rouge
> n'est pas un gate). À projeter au premier storyboard de page refusé.

# Tables Magiques — Anti-slop frontend

## Variante mascotte (asset 3D pré-rendu)

Le livrable n'est pas une page : les Étapes s'appliquent avec ces substitutions —
barre = référence choisie par l'user (Étape 1 déjà faite pour la chevelure : Meshy « Midnight
Ponytail ») ; juge = `hair-judge` (grille `references/hair-rubric.md`) au lieu de
`design-judge` ; pack de revue = `docs/spikes/style-2026-10/harness/build_pack.py` (mode
d'emploi : `harness/README.md`). Le juge ne passe qu'après sa calibration sur la fixture
négative (`harness/README.md` § Calibration).

Un modèle qui produit une page **depuis des mots** produit la **moyenne** de ce qu'il a
vu : c'est le slop. Ce skill impose l'ordre inverse — **rendus réels → matière réelle →
briques prouvées → gates calibrés → juge externe → verdict humain** — et interdit à
l'agent d'être le signal de passage de son propre travail.

**Trois faits mesurés qui fondent chaque étape** (détail : `references/`) :

1. Les réservoirs de prompts (813 prompts, 73 DESIGN.md) ont produit du « PowerPoint 2003 »
   même fouillés : _le look n'est pas dans le texte_.
2. Les juges LLM atteignent ~70 % d'accord avec les experts et sont biaisés par la position
   (WebDevJudge, WiserUI-Bench) : un juge LLM **filtre**, il ne **tranche** pas.
3. Un gate jamais vu rouge est décoratif : chaque gate se calibre sur le **livrable slop
   connu** du projet avant d'être cru.

---

## Étape 0 — Audit (jamais sautée)

1. Lire la source canonique du projet (`docs/VISUAL_REFONTE_2026_SPEC.md` (pages) / `docs/spikes/style-2026-10/VERDICT.md` (mascotte)), l'inventaire
   des médias réels, les contraintes (mobile-first, perf, a11y).
2. Identifier la **fixture négative** : mascotte : `docs/spikes/style-2026-10/harness/negative/` ; pages : aucune encore (le premier storyboard refusé la deviendra) — un
   livrable déjà refusé comme slop. S'il n'en existe pas encore, le premier storyboard le
   deviendra ; le noter.
3. Lister ce qui existe déjà (gates du socle, skills installés : `impeccable`,
   `ui-ux-pro-max`, `slop-detect`) — matrice `coexist / migrate / supersede / ignore`.
4. Lire `references/jamais-il-faut-plutot.md` **en entier**. Chaque « JAMAIS » y est une
   faute déjà commise et payée.

**STOP** si l'un des trois manque : source canonique, inventaire média, fixture négative
(ou décision explicite qu'il n'y en a pas encore).

## Étape 1 — Miner des RENDUS (pas des prompts)

Au **navigateur** (Playwright / Chrome), jamais depuis la mémoire :

1. **Pages primées** : Awwwards (Site of the Day / Month, catégories proches du brief),
   puis Godly / Siteinspire en complément. Pour chaque candidate : **capture** (hero +
   une section + scroll intermédiaire), et annotation en 4 lignes — _stratégie d'image_,
   _rythme de composition_, _l'idée signature unique_, _ce qui serait transposable au brief_.
2. **Briques** : Codrops Creative Hub (`tympanus.net/codrops/hub/`, tags scroll / WebGL /
   three.js) — pour chaque effet envisagé, **une démo qui tourne + son dépôt + sa licence**.
3. Local : exemplaires vivants du wiki (IRIS, Home Sweet Home), réservoirs de prompts
   **seulement** pour vocabulaire et tokens, jamais pour le look.

Sortie : `docs/spikes/style-2026-10/harness/README.md` + `harness/reference/` — chaque ligne = URL **ouverte** + capture
sur disque + annotation. **Aucun lien sans capture.** Puis **3 candidats** de barre,
présentés côte à côte au porteur.

**STOP** tant que le porteur n'a pas choisi la barre (goût = sa décision, pas la mienne).
Ne jamais lui demander « quels effets veux-tu » : lui apporter 3 propositions au niveau.

## Étape 2 — Matière avant design

1. Récupérer la **matière réelle** : photos HD, frames extraites des vidéos (timestamps
   choisis, étalonnées), audio ; rendus 3D (three.js WebGL, Blender headless) si la scène
   l'exige. Sans portrait : **la meilleure frame est le hero**.
2. Manifest d'assets : chaque surface visible pointe vers un fichier réel avec dimensions
   et poids. **Aucun layout avant ce manifest.**
3. Palette et lumière **depuis la matière observée** (ce que montrent ses images), jamais
   depuis la consigne d'un prompt.

## Étape 3 — Construire PAR NIVEAU, un storyboard par niveau

Niveaux, dans l'ordre : **assets → fond/lumière → hero → typographie/tokens → scroll →
composants/sections → effets → perf/mobile**. Pour chaque niveau :

1. **Brique** : partir d'une démo prouvée (Étape 1.2), pas d'une invention.
2. **Storyboard du niveau** avec **vraies frames** même basse résolution (les placeholders
   masquent l'absence de stratégie d'image).
3. **Gates mécaniques** du niveau (`references/gates-catalog.md`) — verts. Rappel : ils
   ont été vus **rouges** sur la fixture négative (`scripts/calibrate.mjs`).
4. **Juge aveugle** : sous-agent `design-judge` (contexte frais), rendu vs référence au
   même cadrage, **deux passes avec positions permutées**, grille 6 axes. S'il pointe le
   mien dans l'une des deux passes → retour en 1.
5. **Verdict porteur** : choix forcé binaire (« lequel tiendrait sur le site livré ? »),
   jamais « tu aimes ? ».

**Anti-boucle** : un niveau qui échoue **deux fois** au juge ou au porteur → **STOP**.
Retour à l'Étape 1 pour ce niveau, avec le porteur. Jamais une troisième invention.

**Une seule idée signature** par page, exécutée à 100 %. Tout trope supplémentaire est
retiré avant le juge, pas discuté après.

## Étape 4 — Intégration et recette

1. Page complète déployée en preview (local `npm run build && npm run start` ; preview Vercel seulement sur go explicite).
2. Tous les gates, **toutes** les captures (desktop + mobile), `slop-detect` + `impeccable`
   sur l'URL.
3. Juge aveugle sur la page entière, puis verdict porteur contre la barre choisie.

## Méta-gate — la seule sortie autorisée

Jamais « c'est fait ». Livrer **la preuve** : captures côte à côte, rapport du juge (les
deux passes), sortie des gates, commandes rejouables. Pas de preuve → pas de « done ».

## Ce que ce skill ne prétend pas

- Il ne fabrique pas le goût : il l'emprunte à des pages primées et le fait trancher par
  un humain.
- Ses gates détectent le **plancher** (tics IA, aplats, factices) — pas le premium.
- Le juge LLM se trompe ~3 fois sur 10 : c'est un filtre pour ne pas gaspiller le temps
  du porteur, jamais une preuve.
