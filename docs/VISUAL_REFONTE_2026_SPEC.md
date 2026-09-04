# Refonte visuelle 2026 — Spécification (phases P20 → P24)

> Statut : **spec v1, 2026-09-04**. Décisions validées par l'utilisateur le 2026-09-03 ; esthétique
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

## 3. Esthétique des assets 3D — à trancher

Les rendus de septembre 2026 sur Suzanne (`docs/spikes/blender-2026-09/`) étaient jugés « uncanny ».
Refaits le 2026-09-04 sur de **vrais assets CC0** (Quaternius, pack _Ultimate Animated Animals_,
licence CC0 1.0 jointe dans `docs/spikes/blender-2026-09/real-assets/QUATERNIUS_LICENSE.txt`) :

`docs/spikes/blender-2026-09/real-assets/montage_real_assets.webp` (Fox et Horse_White, 3 styles).

| Style                                           | Rendu                                | Coût de production              | Lecture                                                                    |
| ----------------------------------------------- | ------------------------------------ | ------------------------------- | -------------------------------------------------------------------------- |
| **lowpoly** (flat shading, matériaux d'origine) | facettes visibles, couleurs franches | nul, l'asset est rendu tel quel | look « jouet en papier », le plus proche de l'écosystème Quaternius/Kenney |
| **clay** (lissage par angle 60°, mat)           | facettes fondues, doux               | nul                             | look pâte à modeler, très « app enfant 2026 »                              |
| **toy** (lissage + brillance)                   | reflets plastique                    | nul                             | look figurine vernie                                                       |

Recommandation : **clay**. Il gomme les facettes qui rappellent 2015, garde les couleurs franches
pour les enfants, et le pipeline reste identique au lowpoly (un paramètre de shading). Le style toy
ajoute des reflets qui bougent avec la rotation et pèsent plus en vidéo (AV1 compresse mal les
hautes lumières). **Décision utilisateur attendue avant P23.**

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

- Style tranché en §3. Assets : mascotte (cheval blanc → licorne par ajout d'une corne modélisée,
  ou renard), badges 3D en spin court.
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

| Source                             | Licence                                                     | Usage        |
| ---------------------------------- | ----------------------------------------------------------- | ------------ |
| Quaternius                         | CC0 1.0 (vérifié dans le `License.txt` du pack, 2026-09-04) | oui          |
| Kenney                             | à vérifier sur kenney.nl au premier téléchargement          | probable oui |
| Poly Haven, ambientCG              | à vérifier sur le site à l'usage                            | probable oui |
| Tout asset -NC, -ND, CC-BY-SA, GPL |                                                             | **non**      |

Seule la ligne Quaternius est vérifiée à la source. Les autres restent à confirmer sur le site
émetteur avant tout téléchargement, et la licence doit être copiée à côté de l'asset.

## 7. Hors périmètre / parqué

- Cluster `docs/EFFECTS_*` archivé dans `docs/archive/effects-2025/` le 2026-09-04.
- Approche B (near-zero JS) : non lancée, déclenchée seulement par un échec visuel de A.
