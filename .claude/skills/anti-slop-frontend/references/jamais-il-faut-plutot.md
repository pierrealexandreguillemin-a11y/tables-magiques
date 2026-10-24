# JAMAIS / IL FAUT PLUTÔT — par niveau

> Chaque ligne « JAMAIS » est une faute **réellement commise** (Vocalise, page Claudine,
> 2026-09-08, modèle Opus 4.8 — ou ailleurs dans le portefeuille, cité). Ce n'est pas une
> liste de principes : c'est un casier judiciaire. Source : `C:/Dev/vocalise/docs/design/
anti-slop-post-mortem-et-dispositif.md` · wiki `cookbook-frontend-anti-slop-quatre-couches`.

## Méthode

| JAMAIS                                                                         | IL FAUT PLUTÔT                                                                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Produire quoi que ce soit depuis la mémoire ou depuis des **prompts** (texte). | Ouvrir des **rendus** au navigateur (pages primées, démos Codrops), capturer, annoter — puis seulement construire. |
| Décrire un corpus (« 813 prompts disponibles ») au lieu de l'ouvrir.           | Ouvrir les fichiers, citer le chemin et la ligne. Un corpus décrit n'a pas été lu.                                 |
| Déduire une source (« Superdesign = un site ») depuis un nom de catégorie.     | Citer le wiki / la page source ; une provenance non prouvée se **déclare** non prouvée.                            |
| Ressortir les sites que le porteur a dit aimer (sycophantie, bug report n°1).  | Apporter des références **qu'il n'a pas encore vues**, au niveau, et le laisser trancher.                          |
| Demander au porteur « quels effets veux-tu ? » (abdication).                   | Apporter **3 propositions** au niveau ; lui demander ce qu'il **veut** (goût, usage), jamais **comment** faire.    |
| Écrire « validée user » sur une intention.                                     | « Validé » = un choix forcé binaire consigné avec sa date, rien d'autre.                                           |
| Se noter soi-même (« mon storyboard est bien »).                               | Juge externe à contexte frais, positions permutées, puis verdict humain.                                           |
| Tourner en boucle ×3 en réinventant.                                           | Deux échecs sur un niveau → **STOP**, retour au minage avec le porteur.                                            |
| Dire « c'est fait ».                                                           | Livrer la preuve : captures, rapport du juge, gates, commandes rejouables.                                         |

## Références

| JAMAIS                                                                                       | IL FAUT PLUTÔT                                                                                                  |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Un lien non ouvert, non capturé (la fiche de références pointait vers une page **rejetée**). | Chaque URL ouverte, capturée sur disque, annotée en 4 lignes.                                                   |
| Un **plancher** comme barre (le site du concurrent local).                                   | Une **page primée** comme barre (Awwwards SOTD/SOTM), choisie par le porteur parmi 3.                           |
| Lire la spec Tailwind d'un prompt et croire avoir « vu ».                                    | Regarder le Live Preview / la démo qui tourne ; copier la **stratégie d'image et la composition**, pas les hex. |

## Assets / matière

| JAMAIS                                                                                                                                   | IL FAUT PLUTÔT                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Des boîtes en dégradé + grain « photo à brancher » alors qu'une **frame réelle existait** (`img.youtube.com/vi/<id>/maxresdefault.jpg`). | Extraire les vraies frames aux bons timestamps ; sans portrait HD, **la frame est le hero**.   |
| Des placeholders qui masquent l'absence de stratégie d'image.                                                                            | Storyboard avec **vraies images** même basse résolution ; manifest d'assets avant tout layout. |
| Une palette importée d'un prompt (« never cold blue ») **contre** la lumière observée sur la vraie scène (bleu/violet).                  | Palette et lumière **depuis ses images** ; les accents depuis ses objets réels (le collier).   |

## Fond / lumière

| JAMAIS                                                                                                                                                                                                                                 | IL FAUT PLUTÔT                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Simuler une lumière de scène avec des `div` floutés `filter:blur` + `mix-blend-mode:screen`, « pool » au sol, particules CSS. (Déjà consigné au wiki : « 27 `box-shadow` pour imiter une lumière qu'un moteur calcule gratuitement ».) | Lumière **réelle** (celle de la photo) ou **calculée** : three.js **WebGL** (spot + cône volumétrique + poussière 3D) ou Blender headless → texture. |
| Exclure three.js par un faux argument (« IRIS est WebGPU-only → écran noir mobile »).                                                                                                                                                  | three.js WebGL tourne sur tout téléphone ; WebGPU est optionnel avec fallback. Mesurer sur mobile mid-range.                                         |
| Fond uni « marron » sans média ni canvas.                                                                                                                                                                                              | Toute section porte une image, une vidéo ou un canvas qui **dessine réellement**.                                                                    |
| Renommer un glow orb « projecteur ».                                                                                                                                                                                                   | Une lumière **motivée** par une source visible dans l'image, ou rien.                                                                                |

## Hero

| JAMAIS                                                               | IL FAUT PLUTÔT                                                                         |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Hero vide « le portrait s'incruste ici », marquee du nom en boucle.  | Hero = **elle**, dans sa vraie lumière ; le nom en typographie de caractère, une fois. |
| Douze tropes à 40 % (marquee, squiggle, poussière, rideau, cartes…). | **Une idée signature** exécutée à 100 % (ex. _le projecteur cherche la voix_).         |

## Typographie / tokens

| JAMAIS                                             | IL FAUT PLUTÔT                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Inter, Poppins, Space Grotesk (signature IA 2026). | Une display de caractère (Fraunces, Cormorant…) + un texte humaniste ; vérifié en `computedStyle`. |
| Des hex « indicatifs » inventés.                   | Tokens tirés des images réelles, contraste ≥ 4,5:1 mesuré.                                         |

## Scroll / mouvement

| JAMAIS                                                                                          | IL FAUT PLUTÔT                                                                                                                |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Un scroll qui ne fait que réchauffer un dégradé et fondre un voile (rien de scrubé au contenu). | Un mouvement lié au **contenu** (la lumière se déplace sur l'image, la caméra avance), scrubé, avec `prefers-reduced-motion`. |
| Empiler reveal + parallax + marquee + rideau.                                                   | Le seul mouvement de l'idée signature ; le reste statique.                                                                    |

## Composants / sections

| JAMAIS                                                                      | IL FAUT PLUTÔT                                                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Lecteur factice (▶ qui devient ❚❚, temps `1:12 / 3:41` en dur), `href="#"`. | Embed qui **joue** (façade `lite-youtube`), liens réels vérifiés.                                                      |
| Trois cartes « Bienveillance / Sur mesure / Ils en parlent ».               | Un témoignage réel, ou rien. Pas de grille de cartes pour remplir.                                                     |
| Le même squelette (kicker + h2 + lead + grille) dans chaque section.        | Jamais deux sections consécutives au même squelette ; rupture de rythme (plein-cadre → texte serré → vidéo → chiffre). |
| Copie lyrique générique (« Rester en lumière », « Rideau »).                | Les faits (bio, dates, liens) ; quand ils manquent, l'image porte.                                                     |

## Gates

| JAMAIS                                                                             | IL FAUT PLUTÔT                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Une règle en prose dans la DA (« pas de glow orbs ») violée dans le même livrable. | Un script qui **échoue** sur la faute, calibré rouge sur la fixture négative. |
| Un gate installé et jamais lancé (`impeccable`).                                   | Gates dans la commande de qualité du projet, exécutés avant chaque juge.      |
| Un seuil de perf « de mémoire ».                                                   | Seuils fixés à la mesure (Lighthouse, trace), historisés.                     |
