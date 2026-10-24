# Juge aveugle — protocole et grille

## Pourquoi un protocole, pas une opinion

- L'auto-revue est biaisée : l'auteur a les angles morts de l'écriture (règle du socle).
- Les juges LLM multimodaux atteignent ~**70 %** d'accord avec les experts (WebDevJudge,
  arXiv 2510.18560, meilleur modèle) et sont **sensibles à la position** gauche/droite
  (WiserUI-Bench). Sources : wiki `raw/web/cookbook-frontend-open-source-2026-09`.
- Conséquence : le juge LLM est un **filtre** avant le porteur, jamais un verdict.

## Protocole (obligatoire, dans cet ordre)

1. **Cadrage identique** : rendu candidat et référence recadrés à la même largeur (ex.
   1440 px desktop, 390 px mobile), même zone (hero ; ou section équivalente ; ou scroll à
   50 %). Fichiers PNG sur disque.
2. **Contexte frais** : sous-agent `design-judge` lancé **sans** l'historique de la session
   (jamais `fork`). Il ne sait pas qui a produit quoi.
3. **Deux passes permutées** : passe A = (candidat à gauche, référence à droite) ; passe B =
   inversée. Libellés neutres « Image 1 / Image 2 ».
4. **Consigne** : « Une des deux pages est l'œuvre d'un studio primé, l'autre d'un
   générateur. Désigne le générateur, note chaque image sur les 6 axes, cite ce qui t'a
   trahi. » Sortie structurée (JSON ci-dessous).
5. **Décision** : le candidat **échoue** s'il est désigné « générateur » dans **l'une** des
   deux passes, ou si un axe est ≤ 2/5 dans les deux. Il **passe** le filtre sinon — ce qui
   ne prouve rien : il va au porteur.
6. **Archiver** les deux rapports à côté des captures (preuve).

## Grille — 6 axes (wiki `topics/ia/scrollytelling-xray-design`), /5 chacun

| Axe           | Question                                     | Ce qui vaut 1-2 (slop)                         | Ce qui vaut 4-5                                       |
| ------------- | -------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Typographie   | Identité, pairing, absence de polices « IA » | Inter/Poppins/Space Grotesk, hiérarchie plate  | Display de caractère, rythme, une italique qui compte |
| Couleur       | Harmonie, sémantique, **moment signature**   | Aplats, dégradé violet→bleu, or « générique »  | Palette tirée de l'image, un accent qui signe         |
| Animation     | Chaque mouvement communique-t-il ?           | Reveals génériques, marquee, orbs qui flottent | Un mouvement lié au contenu, scrubé, sobre            |
| Composition   | Hiérarchie, respiration, ruptures de rythme  | Même squelette partout, grille de cartes       | Plein-cadre → serré → média → chiffre                 |
| Arrière-plans | Profondeur, texture, lumière                 | Fond uni, blur CSS en guise de lumière         | Image/3D/lumière réelle ou calculée                   |
| Composants    | Personnalité, réalité fonctionnelle          | Lecteur factice, cartes vides, `href="#"`      | Média qui joue, données réelles                       |

## Sortie attendue du juge (JSON)

```json
{
  "pass": "A|B",
  "generator_is": "Image 1|Image 2",
  "confidence": 0.0,
  "scores": {
    "Image 1": {
      "typography": 0,
      "color": 0,
      "motion": 0,
      "composition": 0,
      "backgrounds": 0,
      "components": 0
    },
    "Image 2": {
      "typography": 0,
      "color": 0,
      "motion": 0,
      "composition": 0,
      "backgrounds": 0,
      "components": 0
    }
  },
  "tells": ["…ce qui a trahi le générateur, concret, localisé…"]
}
```

## Verdict porteur (après le filtre)

Choix forcé binaire, formulation fixe : **« Lequel des deux tiendrait sur le site livré ? »**
Jamais « tu aimes ? », jamais « c'est mieux ? ». Consigner la réponse avec la date. C'est
la seule chose qui s'appelle « validé ».
