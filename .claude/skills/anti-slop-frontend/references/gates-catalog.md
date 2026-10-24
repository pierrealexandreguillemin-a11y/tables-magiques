# Catalogue de gates — par niveau

> Règle d'or : **un gate qu'on n'a jamais vu rouge n'est pas un gate.** Chaque ligne est
> calibrée sur la fixture négative du projet (`scripts/calibrate.mjs`) avant d'entrer dans
> la commande de qualité. Ces gates détectent le **plancher** (tics IA, factices, aplats)
> — pas le premium, qui vient du juge et du porteur.

| Niveau             | Faute (rouge)                                                                        | Outil                                                                                       | État                                      |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Assets             | figure/section sans `src` réel, légende « à brancher », `placeholder`, `lorem`       | `scripts/slop-static-gate.mjs` (règle `placeholder-figure`)                                 | **calibré** rouge sur storyboard Vocalise |
| Assets             | image sans dimensions / poids réels ; manifest d'assets incomplet                    | script projet (à écrire), Playwright `naturalWidth`                                         | à écrire au niveau assets                 |
| Fond/lumière       | `filter:blur` + `mix-blend-mode:screen` (lumière simulée), particules DOM            | `slop-static-gate.mjs` (`fake-light-blur-screen`, `decorative-particles`)                   | **calibré**                               |
| Fond/lumière       | canvas WebGL présent mais qui ne dessine rien (frame uniforme)                       | Playwright : capture du canvas → variance des pixels > seuil                                | à écrire au niveau fond                   |
| Hero               | marquee infini, hero vide                                                            | `slop-static-gate.mjs` (`infinite-marquee`, `placeholder-figure`)                           | **calibré**                               |
| Typo/tokens        | Inter/Poppins/Space Grotesk ; titres hors police display choisie                     | `slop-static-gate.mjs` (`banned-ai-font`) + Playwright `getComputedStyle`                   | statique calibré ; computed à écrire      |
| Tics IA            | glassmorphism gratuit, dégradé violet→bleu, cartes-dans-cartes, icônes carré-arrondi | **slop-detect** (`npx slop-detect <url>`, 27 patterns) + **impeccable** (61 règles)         | à brancher et calibrer sur la preview     |
| Composants         | lecteur factice, temps en dur, `href="#"`, grille de cartes-valeurs                  | `slop-static-gate.mjs` (`fake-player`, `dead-link`, `value-cards-grid`)                     | **calibré**                               |
| Composants         | lien externe mort / non ouvert                                                       | link-check (Playwright : status 200 + capture)                                              | à écrire                                  |
| Scroll             | rien ne change entre 0/25/50/75/100 %                                                | Playwright : 5 captures → diff perceptuel > seuil entre voisines                            | à écrire au niveau scroll                 |
| Scroll             | `prefers-reduced-motion` ignoré                                                      | Playwright `emulateMedia({reducedMotion:'reduce'})` : aucun mouvement scrubé                | à écrire                                  |
| Rythme             | deux sections consécutives au même squelette                                         | script structurel (signature DOM par section : séquence des tags/classes ; égalité = rouge) | à écrire au niveau composants             |
| Perf/mobile        | LCP, CLS, TBT, FPS sous seuil — **seuils fixés à la mesure**                         | Lighthouse (`npx lighthouse <url> --preset=…`), trace Chrome                                | à mesurer, jamais de seuil de mémoire     |
| Liens de référence | URL de référence non ouverte / sans capture                                          | script : chaque URL du doc de références a un PNG à côté                                    | à écrire à l'Étape 1                      |

## Calibration (obligatoire avant d'ajouter un gate à la commande de qualité)

```bash
# 1. ROUGE attendu sur la fixture négative :
node scripts/slop-static-gate.mjs --expect-fail <fixture-négative>     # attendu : exit 0 « CALIBRATION OK »
# 2. VERT attendu sur un état sain (ou compréhension exacte de chaque rouge restant) :
node scripts/slop-static-gate.mjs src                                   # attendu : exit 0, ou rouges expliqués
```

Un gate qui reste vert sur la fixture négative est **retiré** ou **réécrit** — jamais gardé
« pour plus tard ». (Précédent : `jscpd` sans chemin restait vert sur un clone — trouvé par
la calibration, cf. `docs/evidence/socle-qualite.md` de Vocalise.)

## Ajouter une règle

Chaque règle = **une faute observée** + sa preuve (fichier, ligne) dans `why`. Pas de règle
« par principe » : la liste est un casier judiciaire, pas une charte.
