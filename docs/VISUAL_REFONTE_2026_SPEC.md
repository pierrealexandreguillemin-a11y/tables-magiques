# Refonte visuelle 2026 — Spécification (phases P20 → P24)

> Statut : **spec v1.1, 2026-10-17** (v1 du 2026-09-04). Décisions validées par l'utilisateur le 2026-09-03 ; esthétique
> des assets 3D **à trancher** (§3). Rédigée en français car c'est un document de décision produit.

## 1. Cadre

- Le cœur gamifié (tables, badges, défis) est jugé bon. **C'est le rendu qui ne satisfait pas.**
- But : un rendu **beau, 2026**, et plus léger. Priorité **beauté > poids**.
- **Refonte, pas portage byte-identique.** Les effets actuels ne sont pas un cahier des charges.
- Approche retenue : **A « modernisation ciblée »**. Fallback **B « radical near-zero JS »** si un effet
  déçoit après modernisation.
- 3D : **Blender en pré-rendu uniquement** (0 KB de runtime 3D). Assets **CC0** (Quaternius, Kenney).

## 2. État mesuré (baseline)

Commande rejouable et résultat attendu :

```bash
bash scripts/check-bundle-size.sh      # attendu : "Bundle size (gzipped JS): ~525 KB", seuil 560
```

| Poste                                | Poids gz  | Note                                                                                      |
| ------------------------------------ | --------- | ----------------------------------------------------------------------------------------- |
| JS total                             | ~525 KB   | seuil script = 560 KB                                                                     |
| Lottie                               | 78 KB     | plus gros chunk, importé en direct dans MagicLoader / BadgeIcon / ChallengePlaying        |
| Framer Motion                        | ~45 KB    | eager dans `app/providers.tsx`, présent dans 24 fichiers (CLAUDE.md n'en documente que 7) |
| tsParticles                          | 39 KB     |                                                                                           |
| react-kawaii                         | 16 KB     |                                                                                           |
| Libs d'animation                     | ~178 KB   | 34 % du JS                                                                                |
| `public/icons/badges/unicorn.json`   | 868 KB    | asset Lottie                                                                              |
| `public/icons/` + `public/icons-v6/` | dupliqués |                                                                                           |

Le lazy-loading annoncé est en trompe-l'œil : les imports sont directs.

**Constat du 2026-10-17** : `app/providers.tsx` enveloppe l'app dans `<LazyMotion features={domAnimation}>`,
mais les 24 fichiers rendent `motion.*` et non `m.*`. Or `motion.*` embarque tout le jeu de fonctions,
donc `LazyMotion` n'économise rien aujourd'hui (doc officielle : <https://motion.dev/docs/react-lazy-motion>,
option `strict`). Vérification : `grep -rnoE "\bmotion\.[a-z]+" --include=*.tsx app components features | wc -l`
→ `92` ; `grep -rnoE "\bm\.[a-z]+" --include=*.tsx app components features | wc -l` → `0`.

Baseline re-mesurée le 2026-10-17 (commit `12ead03`) : `npm run build && bash scripts/check-bundle-size.sh`
→ `525 KB`. Ce script additionne **tous** les chunks JS : un chargement différé ne le fait pas baisser.
Le poids au premier chargement par route se mesure à part (plan
`docs/superpowers/plans/2026-10-17-visual-refonte-p20-p22.md`, tâche 2).

## 3. Esthétique des assets 3D — tranchée le 2026-10-17

Les rendus de septembre 2026 sur Suzanne (`docs/spikes/blender-2026-09/`) étaient jugés « uncanny ».
Refaits le 2026-09-04 sur de **vrais assets CC0** (Quaternius, pack _Ultimate Animated Animals_,
licence CC0 1.0 jointe dans `docs/spikes/blender-2026-09/real-assets/QUATERNIUS_LICENSE.txt`) :

`docs/spikes/blender-2026-09/real-assets/montage_real_assets.webp` (Fox et Horse_White, 3 styles).

| Style                                           | Rendu                                | Coût de production              | Lecture                                                                    |
| ----------------------------------------------- | ------------------------------------ | ------------------------------- | -------------------------------------------------------------------------- |
| **lowpoly** (flat shading, matériaux d'origine) | facettes visibles, couleurs franches | nul, l'asset est rendu tel quel | look « jouet en papier », le plus proche de l'écosystème Quaternius/Kenney |
| **clay** (lissage par angle 60°, mat)           | facettes fondues, doux               | nul                             | look pâte à modeler, très « app enfant 2026 »                              |
| **toy** (lissage + brillance)                   | reflets plastique                    | nul                             | look figurine vernie                                                       |

~~Recommandation : clay.~~ **Caduque.** Verdict utilisateur du 2026-09-04 sur les 6 rendus : aucun ne
passe, « pas enfantin, pas conforme aux styles mentionnés ». Cause identifiée : clay et toy n'étaient
qu'un changement de shading sur le même maillage low-poly à facettes, pas de vrais styles. Les
proportions (animaux adultes, petites têtes) n'ont rien d'enfantin quel que soit le matériau.

Pistes ouvertes :

1. **Autres assets** aux proportions chibi (grosse tête, grands yeux, formes rondes) : packs mignons
   Quaternius, Kenney, Poly Pizza (CC0 seulement).
2. **Retravail Blender** des assets existants : remesh voxel + lissage pour arrondir, SSS et lumière
   studio pastel pour un vrai clay, coat et reflets pour un vrai toy, ombre douce au sol, Cycles.
   Leçon mesurée : SUBSURF sur du low-poly fait des bulles ; utiliser `shade_smooth_by_angle`.
3. **Mascotte three.js temps réel** (levier accepté par l'utilisateur le 2026-10-17) : shading
   toon ou clay, réactive aux réponses, chargée à la demande.

Méthode de décision : 3 à 6 références réelles d'apps enfant choisies par l'utilisateur comme
barre, puis rendus des candidats sur de vrais assets, présentés dans son navigateur en positions
permutées, verdict en choix forcé (cf. wiki `topics/llm-tooling/cookbook-frontend-anti-slop-quatre-couches.md`).
Matériel dans `docs/spikes/style-2026-10/`.

**Verdict utilisateur du 2026-10-17 (choix forcé, `docs/spikes/style-2026-10/board.html`) :**
« candidat 1 est la bonne piste ». Candidat 1 = **licorne chibi procédurale**, modélisée par script
Blender à partir de métaballes et de sphères haute résolution (`scripts/blender/chibi_unicorn.py`,
modèle à nous, aucune licence tierce). Candidat 2 (personnage Quaternius restylé) écarté :
silhouette humanoïde, facettes. La barre de référence reste celle des jeux (Kirby, Hello Kitty
Island Adventure, Animal Crossing, Astro Bot), décrite dans `docs/spikes/style-2026-10/RESEARCH.md`.

« Bonne piste » n'est pas « validé tel quel » : défauts relevés sur le rendu
(`docs/spikes/style-2026-10/renders/A_unicorn_gradient.png`) et à corriger avant production :
cils de l'œil lointain qui dépassent du bord de la tête, bouche décentrée, corps « pilier » sans
modelé, crinière en boudins lisses plutôt qu'en boucles, spirale de la corne peu lisible, contraste
faible (blanc nacré sur fond pastel). Chaque itération repasse devant l'utilisateur.

Suivi (2026-10-17) : A2 corrige les cinq premiers défauts et est validée (« A2 mieux que la
version 1 ») ; le profil sans museau est accepté (« effet cute »). Le contraste est clos par
l'utilisateur : « le corps de la licorne validée est ok ». A3 (crinière en mèches) attend son
verdict face à A2 (`docs/spikes/style-2026-10/VERDICT.md`).

Re-rendu : `"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --python
scripts/blender/chibi_unicorn.py -- docs/spikes/style-2026-10/renders` (CPU Ryzen 5 5600H, ~2 min,
1024 px, 160 échantillons ; `--preview` ≈ 10 s en 512 px).

Commande rejouable (Blender 5.2 headless, pack décompressé dans `<pack>`) :

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b \
  --python scripts/blender/render_styles.py -- <pack>/glTF/Fox.gltf <outdir>
# attendu : 3 PNG Fox_lowpoly / Fox_clay / Fox_toy dans <outdir>
```

Téléchargement du pack : bouton « Download » de <https://quaternius.com/packs/ultimateanimatedanimals.html>
ouvre un dossier Google Drive ; `python -m gdown --folder <url-drive> -O animals` le récupère.

## 4. Spikes passés (2026-09-03)

- **CSS natif 2026** rend réellement dans la stack (Next 16, Tailwind v4, Chrome 152) : View
  Transitions, `@starting-style`, `linear()`, `@property`, Popover. Scroll-driven animations et
  `interpolate-size` sont Chromium-only → **derrière `@supports`**.
- **Pipeline Blender 5.2 LTS headless + ffmpeg 8.1.1** reproductible au pixel (byte-diff = timestamp
  PNG seulement). Spin 24 images → AV1 WebM 12 KB, VP9 alpha 20 KB, poster AVIF 4 KB.
- **Réserve** : alpha animé cross-browser (Safari) exige `avifenc` (libavif) et `img2webp` (libwebp).
  ffmpeg seul ne suffit pas. Ni l'un ni l'autre n'est installé (vérifié `which` le 2026-09-04).

## 5. Phases

Chaque phase se termine par `bash scripts/check-bundle-size.sh` et une capture visuelle des écrans
touchés (home, jeu, badges) comparée à la précédente. Un gate rouge = code à corriger, pas de seuil
relevé.

### P20 — Fondations CSS natif

- Tokens `@property` pour les valeurs animées ; courbes `linear()` partagées dans un fichier unique.
- View Transitions pour les navigations home → jeu → résultat.
- `@starting-style` pour les apparitions (badges, modales, toasts) à la place des `initial/animate` FM.
- Gate : `prefers-reduced-motion` respecté partout (test E2E existant à étendre).

### P21 — Amaigrissement Framer Motion

- Passage à `LazyMotion` + `m` avec `domAnimation` chargé à la demande ; retrait de l'import eager
  dans `app/providers.tsx`.
- Réduire les 24 fichiers aux cas où le CSS ne suffit pas (drag, layout animations, gestes).
- **Gate anti-reprolifération** : règle ESLint `no-restricted-imports` sur `framer-motion` hors
  liste blanche, listée dans CLAUDE.md.
- Cible mesurée : −25 KB gz minimum.

### P22 — Suppression tsParticles

- Confettis et étoiles : `canvas-confetti` lazy (déjà recommandé dans
  `ANIMATION_LIBRARIES_RESEARCH.md`) ou CSS pur pour les étincelles statiques.
- Cible mesurée : −39 KB gz.

### P23 — Pipeline Blender, mascotte, suppression Lottie

- Style tranché en §3 (2026-10-17) : mascotte = licorne chibi procédurale
  (`scripts/blender/chibi_unicorn.py`). Étapes : (1) corriger les défauts listés en §3 et
  re-valider avec l'utilisateur ; (2) rig + poses/expressions dont l'app a besoin (attente,
  réussite, encouragement après erreur, célébration) ; (3) choisir le mode de diffusion :
  pré-rendu vidéo/AVIF (0 KB de JS) ou three.js temps réel (`A_unicorn.glb`, chargé à la
  demande ; le SSS ne survit pas à l'export glTF, à reproduire en matériau three.js), par une
  mesure de poids et un choix forcé visuel ; (4) badges 3D en spin court, même langage de formes.
- Pipeline : script Blender headless → PNG → ffmpeg AV1/VP9 + poster AVIF. Installer libavif et
  libwebp pour l'alpha Safari **avant** le premier asset livré.
- Remplacer MagicLoader / BadgeIcon / ChallengePlaying (Lottie) par `<video>` + poster.
- Cible mesurée : −78 KB gz JS, −868 KB `unicorn.json`.

### P24 — Nettoyage et abaissement des seuils

- Dédupliquer `public/icons/` et `public/icons-v6/`.
- Retirer react-kawaii si la mascotte 3D le remplace.
- Abaisser le seuil de `scripts/check-bundle-size.sh` à la nouvelle mesure + 5 %.
- Mettre à jour CLAUDE.md (liste blanche FM, pipeline Blender).

## 6. Licences d'assets (règle)

| Source                             | Licence                                             | Usage                 |
| ---------------------------------- | --------------------------------------------------- | --------------------- |
| Quaternius                         | **QAL v1.0** depuis le 2026-08-28 (voir ci-dessous) | oui, rendus seulement |
| Kenney                             | à vérifier sur kenney.nl au premier téléchargement  | probable oui          |
| Poly Haven, ambientCG              | à vérifier sur le site à l'usage                    | probable oui          |
| Tout asset -NC, -ND, CC-BY-SA, GPL |                                                     | **non**               |

**Quaternius, relu à la source le 2026-10-17** (<https://quaternius.com/license.html>) : _Quaternius
Asset License (QAL) v1.0_, « Last updated: 8/28/2026 ». Usage personnel, éducatif et commercial
gratuit, « No attribution is required », mais « You may not extract, repackage, sublicense, sell, or
otherwise redistribute the Assets ». La §7 dit que « the version in effect at the time you obtained
the Assets governs your use of them ». Le pack _Ultimate Animated Animals_ téléchargé le 2026-09-04
(donc après le 2026-08-28) contient pourtant un `License.txt` CC0 1.0. Lecture prudente retenue : on
applique la QAL. Les rendus intégrés à l'app sont permis ; les fichiers 3D bruts ne sont **jamais**
versionnés (dépôt GitHub). La licence se vérifie pack par pack.

Seule la ligne Quaternius est vérifiée à la source. Les autres restent à confirmer sur le site
émetteur avant tout téléchargement, et la licence doit être copiée à côté de l'asset.

## 7. Hors périmètre / parqué

- Cluster `docs/EFFECTS_*` archivé dans `docs/archive/effects-2025/` le 2026-09-04.
- Approche B (near-zero JS) : non lancée, déclenchée seulement par un échec visuel de A.
