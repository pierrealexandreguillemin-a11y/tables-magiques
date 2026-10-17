# Spike style-2026-10 — 3D mascot style: references & assets

- **Date of all observations:** 2026-10-17 (browser: Playwright MCP, Chromium, viewport 1440x900).
- **Context:** the 2026-09-04 attempt (Quaternius low-poly Fox/Horse, "lowpoly/clay/toy" shading
  variants) was rejected as "pas enfantin, pas conforme aux styles". Root cause: the _mesh_ (faceted,
  realistic quadruped proportions) was the problem; shading changes cannot fix it.
- **Target:** cute, rounded, chibi proportions (big head, short limbs), big eyes, soft "clay / vinyl
  toy" look, nothing realistic or humanoid.
- **Source legend:** **[P]** = primary source (official site of the emitter, license file inside the
  pack, or the asset host's own model page). **[S]** = secondary source (search engine, aggregator).
- **Nothing here is committed or wired in the app.** Raw assets live outside the repo:
  `C:\Users\pierr\AppData\Local\Temp\claude\C--Dev-Multiplications-magiques\3b51f80a-c9a9-4282-bcd5-77ae8148442d\scratchpad\assets\`

---

## 1. References (the bar)

All screenshots taken by me on the official site on 2026-10-17 [P]. Cookie banners were refused
where possible (Duolingo's banner is still visible in its screenshot).

### 1a. Verified 3D, cute register — usable as the bar

| #   | Name                                                 | Official URL                                                                          | Screenshot                  | Rendering traits (observed)                                                                                                                                                                                                                                                                  |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Kirby** (Nintendo)                                 | https://kirby.nintendo.com/                                                           | `ref-kirby.png`             | Pure sphere-based shape language, zero sharp edges, 2-3 head-heights max. Glossy-soft "vinyl" material with a strong rim/subsurface feel, cheek blush decals, oval glossy eyes with highlight. **Pastel lilac→pink→cyan background** — closest palette match to Tables Magiques. No outline. |
| 2   | **Hello Kitty Island Adventure** (Sunblink / Sanrio) | https://www.hellokittyislandadventure.com/                                            | `ref-hellokitty-island.png` | Soft 3D "plush/vinyl" characters, big heads, tiny bodies, matte material with soft ambient occlusion, no outline. Saturated pastel purple/pink/cyan palette, bloom-y lighting. Very close to the target mood (kawaii + magical).                                                             |
| 3   | **Animal Crossing: New Horizons** (Nintendo)         | https://animalcrossing.nintendo.com/new-horizons/ (redirect from animal-crossing.com) | `ref-animalcrossing.png`    | Chibi animals (≈2 heads tall), rounded volumes, matte "toy/clay" materials with gentle texture, soft daylight + AO, no outline. Flat-ish eyes (decals), warm saturated palette.                                                                                                              |
| 4   | **ASTRO BOT** (Sony / Team Asobi)                    | https://www.playstation.com/en-us/games/astro-bot/                                    | `ref-astrobot.png`          | Chibi robot, big head / small body, glossy white plastic + blue accents = literal "vinyl toy". Emissive LED eyes. Dark space background, strong rim light. Proof that "toy" means _proportions + material_, not facets.                                                                      |
| 5   | **Toca Boca**                                        | https://www.tocaboca.com/                                                             | `ref-tocaboca.png`          | Screenshot shows BOTH registers side by side in their own audience-picker modal: the 2D flat outlined style ("I'm an adult" card) and a **soft 3D chibi render** ("I'm a kid" card: big head, round cheeks, blush, purple gradient background). The 3D card is a good target sample.         |

### 1b. Checked and found to be **2D**, not 3D (kept for shape-language reference only)

| Name              | Official URL                                                                        | Screenshot          | Observation                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Pok Pok           | https://playpokpok.com/                                                             | `ref-pokpok.png`    | Flat 2D hand-drawn illustration with slight texture. Not 3D.                                                               |
| Khan Academy Kids | https://learn.khanacademy.org/khan-academy-kids/ → https://www.khanacademy.org/kids | `ref-khankids.png`  | Flat 2D animals with thin dark linework. Not 3D.                                                                           |
| Duolingo          | https://www.duolingo.com/                                                           | `ref-duolingo.png`  | Flat 2D geometric vector characters (homepage hero). Not 3D. I did not search for separate Duolingo 3D campaigns.          |
| Lingokids         | https://lingokids.com/                                                              | `ref-lingokids.png` | Flat 2D/2.5D vector (soft gradients). Not 3D.                                                                              |
| Sago Mini         | https://sagomini.com/characters/                                                    | `ref-sagomini.png`  | Flat 2D, no outline, very simple pill shapes. Not 3D, but its shape simplicity is a good guide for silhouette readability. |

**Takeaway:** among children's _education_ apps checked, none uses 3D mascots on its official site;
the 3D "cute" bar comes from games (Nintendo, Sanrio/Sunblink, Sony) and from Toca Boca's own 3D
render. Common denominators of the 3D bar: (1) sphere/capsule volumes, no visible facets;
(2) head ≥ 40-50% of total height; (3) big glossy eyes with highlight, often blush;
(4) smooth matte-to-satin material + soft AO + rim light; (5) no outline; (6) pastel gradient
backgrounds.

---

## 2. Licenses (primary sources, quoted verbatim)

### 2a. Quaternius — **license changed in 2026; the FAQ is inconsistent with it**

`https://quaternius.com/license.html` [P], read 2026-10-17:

> Quaternius Asset License (QAL) v1.0
> Last updated: 8/28/2026
>
> In short — You can use these assets, free of charge, in personal, educational, and commercial games
> and other projects, with no credit required. You just can't resell or redistribute the assets
> themselves as assets.
>
> 3. Restrictions — You may not: a) Resell or redistribute the Assets themselves. You may not extract,
>    repackage, sublicense, sell, or otherwise redistribute the Assets (in original or modified form) as
>    a standalone asset, asset pack, stock file, template, or similar product, whether for free or for
>    payment, and whether alone or bundled with other assets. This restriction applies regardless of how
>    much the Assets have been modified. It does not restrict distributing a completed Product that
>    merely incorporates the Assets (see Section 2).
> 4. Changes to This License — We may publish updated versions of this License for future Asset
>    releases. Changes will not apply retroactively to Assets you've already obtained under an earlier
>    version; the version in effect at the time you obtained the Assets governs your use of them.

`https://quaternius.com/faq.html` [P], read 2026-10-17 (no date on the page):

> Can these assets be used in commercial projects? — Yes, these assets can be used for free without
> the need for attribution in commercial, educational, and personal projects. All models are under
> the CC0 License.
>
> Is it necessary to give credit when using these assets? — No, attribution is not necessary. However,
> credit is always appreciated. These assets are licensed under CC0, allowing you to use them without
> giving credit, even for commercial purposes.

Per-pack badges on the pack pages [P] (2026-10-17): Ultimate Monsters (Oct 2022), Cute Animated
Monsters (Aug 2020), Animated Cute Fish (Feb 2020), Farm Animal Pack (Jun 2018), Platformer Game Kit
(Dec 2021), Ultimate Animated Animal Pack (Jul 2021) → badge **"CC0"**. Newest pack
_Bestiary – Dungeon Monsters Kit_ (Aug 2026) → badge **"QAL"**.

`License.txt` inside the Drive folders [P], read in the Google Drive web viewer (download was blocked,
see §4). **Both** the Ultimate Monsters folder file (Drive id `16GqsDGESyEOfRbc4dS7EqAwkIUSIW4_y`) and
the Platformer folder file (id `1v0aHJ-urPz4Ex4hChrbKKCLYw1Segi96`) display the same text — note the
Ultimate Monsters copy is headed "Ultimate Platformer Pack" (copy-paste by the author):

> Ultimate Platformer Pack by @Quaternius
> License: CC0 1.0 Universal (CC0 1.0) Public Domain Dedication
> https://creativecommons.org/publicdomain/zero/1.0/

The Cute Monsters Drive folder listing contains **no License.txt** (only glTF/FBX/OBJ/Blend,
Textures, Preview.jpg).

Interpretation (mine, not legal advice): packs published with a CC0 `License.txt` remain CC0 for
copies obtained under it — the CC0 1.0 legal code itself says the affirmer "irrevocably and
unconditionally waives…" [P, creativecommons.org/publicdomain/zero/1.0/legalcode.en], and QAL §7
says changes are not retroactive. **QAL-only packs (Bestiary, any future pack) forbid redistributing
the asset files "as a standalone asset"**: committing raw `.glb` files to a _public_ Git repo could be
read as such redistribution — to clear with the user before ever committing a QAL asset.

### 2b. Kenney

`https://kenney.nl/support` [P], 2026-10-17:

> Can I use the game assets in a (commercial) project? — Yes, all game assets on the asset pages are
> public domain licensed (CC0). You're free to use them, even in commercial projects.
> Is attribution required? — Attribution is not required, but if you choose to give credit you can do
> so by mentioning "Kenney". Do not use our logo, as it is reserved for official projects by our studio.

`License.txt` inside `kenney_cube-pets_1.0.zip` [P]:

> Cube Pets (2.0) — Created/distributed by Kenney (www.kenney.nl) — Creation date: 26-03-2026 11:16
> License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/
> You can use this content for personal, educational, and commercial purposes.

(Oddity: the download URL is named `_1.0.zip` but the License.txt and the page say 2.0 "Complete
remake, added animals & animations".)

### 2c. Poly Pizza

Per-model license read on each model page `https://poly.pizza/m/<id>` [P] (string after
"OBJ/GLTF format •"). Only models showing **"Public Domain (CC0)"** were kept.

### 2d. Sketchfab (for the unicorn search)

Public API `https://api.sketchfab.com/v3/search?...&license=cc0&downloadable=true` [P]. Returned
**no CC0 unicorn / pony / pegasus**. Best cute unicorns are **CC BY 4.0** (attribution required).

---

## 3. Assets

Formats/tri counts measured by me with `glb_stats.py` (scratchpad) — replay:

```bash
S="/c/Users/pierr/AppData/Local/Temp/claude/C--Dev-Multiplications-magiques/3b51f80a-c9a9-4282-bcd5-77ae8148442d/scratchpad"
python -I "$S/glb_stats.py" "$S"/assets/polypizza/*.glb "$S/assets/kenney-cube-pets/extracted/Models/GLB format/animal-cat.glb"
# expected e.g.: Quaternius_AnimatedPlatformerCharacter_kKtL4zvS3n.glb: tris=2908 ... animations=18
#                Exceptional3D_CuteRedDino_WAkBnE6ydO.glb: tris=20751 ... animations=0
#                animal-cat.glb: tris=684 ... animations=8
```

Contact sheet of the downloaded CC0 models (thumbnails from the hosts, CC0 content only):
`assets-contact-cc0.png`. Local root below = `…\scratchpad\assets\`.

### 3a. Downloaded (all CC0, GLB)

| Name / author                                   | Source URL                                                           | License (where read)                        | Local path                                                        | Format, measured                                                                                                                                         | Style / proportions                                                                                                                                                                    | Fit 1-5                                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Animated Platformer Character** / Quaternius  | https://poly.pizza/m/kKtL4zvS3n (from Platformer Game Kit, Dec 2021) | CC0 — Poly Pizza page; pack License.txt CC0 | `polypizza\Quaternius_AnimatedPlatformerCharacter_kKtL4zvS3n.glb` | GLB, 2 908 tris, rigged, **18 anims** (Idle, Jump, Wave…), flat colours, 442 kB                                                                          | Smooth (not faceted), chibi ≈2 heads, big oval eyes, blue "bunny-suit" onesie. Closest Quaternius asset to the bar. Humanoid-ish kid in costume, but stylised enough to avoid uncanny. | **4** — right proportions + animations; needs recolour (lilac/pink) and maybe a horn to become "magical".         |
| **Cute Red Dino** / Exceptional_3D              | https://poly.pizza/m/WAkBnE6ydO                                      | CC0 — Poly Pizza page                       | `polypizza\Exceptional3D_CuteRedDino_WAkBnE6ydO.glb`              | GLB, 20 751 tris, 4 materials, no rig/anim, 513 kB                                                                                                       | Smooth subdivided, soft matte "vinyl toy" look, rounded belly, small spikes. Closest to the _material_ bar.                                                                            | **4** for look / **2** for use: no rig, no animations, dinosaur not on-theme. Good material/lighting test object. |
| **Cube Pets** (24 animals) / Kenney             | https://kenney.nl/assets/cube-pets                                   | CC0 — kenney.nl/support + pack License.txt  | `kenney-cube-pets\extracted\Models\GLB format\animal-*.glb`       | GLB, ~575-734 tris each, **8 anims each** (idle, walk, run, eat, dance, gesture-positive/negative), 1 shared colormap (external `Textures/colormap.png`) | Rounded-cube "toy" bodies, big eyes, cute faces, coherent set (bunny, cat, panda, chick, fox, deer…). Blocky silhouette, not soft-clay. No unicorn/horse.                              | **3** — cute and production-ready (anims, tiny), but cubic shape language ≠ round Kirby/HKIA bar.                 |
| **Bunny** / Quaternius (Ultimate Monsters)      | https://poly.pizza/m/irZjWFARyl                                      | CC0 — Poly Pizza page; pack badge CC0       | `polypizza\Quaternius_Bunny_irZjWFARyl.glb`                       | GLB, 8 284 tris, rigged, 14 anims                                                                                                                        | Smooth, but lanky limbs and half-closed "sleepy" eyes; reads as monster, not chibi.                                                                                                    | **2**                                                                                                             |
| **Cat** / Quaternius (Ultimate Monsters "Blob") | https://poly.pizza/m/2f54vbV0In                                      | CC0 — Poly Pizza page                       | `polypizza\Quaternius_Cat_2f54vbV0In.glb`                         | GLB, 1 772 tris, rigged, 9 anims                                                                                                                         | Head-only blob, round, but heavy-lidded eyes (grumpy).                                                                                                                                 | **2**                                                                                                             |
| **Mice** / MiniPoly                             | https://poly.pizza/m/Oud9UeK39O                                      | CC0 — Poly Pizza page                       | `polypizza\MiniPoly_Mice_Oud9UeK39O.glb`                          | GLB, 1 846 tris, 1 texture, no anim                                                                                                                      | Smooth soft rounded body, small. Neutral cute.                                                                                                                                         | **2**                                                                                                             |
| **Bird** / Isa Lousberg                         | https://poly.pizza/m/5gurZ5QVlE                                      | CC0 — Poly Pizza page                       | `polypizza\IsaLousberg_Bird_5gurZ5QVlE.glb`                       | GLB, 652 tris, 1 texture, no anim                                                                                                                        | Round chick, simple, slight facets, flat dot eyes.                                                                                                                                     | **2**                                                                                                             |

### 3b. Evaluated, **not** downloaded

| Name                                                                                 | Source                                                                                        | License (where read)                    | Why not                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ultimate Monsters (50) / Quaternius                                                  | https://quaternius.com/packs/ultimatemonsters.html                                            | CC0 badge + License.txt CC0 [P]         | Drive download blocked (§4). Style: smooth, Pokémon-like, many toothy/skull monsters; "Blob" sub-set (Cat, Dog, Chicken, PinkBlob) is the cute part — 3/5. Individual models are on Poly Pizza (Bunny, Cat taken from there). |
| Cute Animated Monsters (21) / Quaternius                                             | https://quaternius.com/packs/cutemonsters.html                                                | CC0 badge [P]; no License.txt in folder | Painted textures, gaping toothy mouths — creepy-cute, not "enfantin". 2/5.                                                                                                                                                    |
| Farm Animal Pack / Quaternius                                                        | https://quaternius.com/packs/farmanimal.html                                                  | CC0 badge [P]                           | Faceted, realistic quadruped proportions = exactly the rejected 09-04 failure mode. 1/5.                                                                                                                                      |
| Quaternius 2023 animals (Horse, Pig, Sheep, Raccoon, Hedgehog, Chick)                | poly.pizza `D3hAeqeDBE`, `u35l6uP5vj`, `rgJXF570ZK`, `xMmx6VQP3r`, `Uu0PXwt2nU`, `LH96IMq0rE` | CC0 [P]                                 | Voxel/blocky Minecraft-like. 1/5.                                                                                                                                                                                             |
| Kenney Mini Characters                                                               | https://kenney.nl/assets/mini-characters                                                      | CC0 [P]                                 | Humans (blocky). Out of scope.                                                                                                                                                                                                |
| **"Just a Unicorn!"** / nottodayrender                                               | https://sketchfab.com/3d-models/just-a-unicorn-8d0ae2d4b1ac4d1f8ab2adcdcc01cc8f               | **CC BY 4.0** [P, Sketchfab API]        | Best visual match found (pink chibi unicorn, 85 046 faces, 4 animations) — 5/5 style. **Not CC0** (attribution required) and Sketchfab download needs an authenticated account (API returned 401).                            |
| "Unicorn Toy Rainbow" / CompozipStudios                                              | https://sketchfab.com/3d-models/84aa966de9f846929c87a22dced65de7                              | CC BY 4.0 [P]                           | Plush-like winged unicorn, 156 707 faces, no anim. 4/5 style, not CC0, login needed.                                                                                                                                          |
| Poly Pizza unicorns (jeremy, Poly by Google, Thomas DR, Marc Barnes, Peter Bickhofe) | poly.pizza search "unicorn"                                                                   | CC BY [P]                               | Faceted low-poly horses + not CC0. 1/5.                                                                                                                                                                                       |
| "Unicorn Person" / Polygonal Mind                                                    | https://poly.pizza/m/TLsBUOdTr7                                                               | CC0 [P]                                 | Humanoid in a unicorn suit, T-pose — explicitly out of scope.                                                                                                                                                                 |

### 3c. Ranking for the decision

1. **Quaternius Animated Platformer Character** — only CC0 asset that has the chibi proportions
   _and_ a rig + 18 animations. Recolour + horn/wings in Blender to make a "magical" mascot.
2. **Kenney Cube Pets** — CC0, coherent family of 24 animated cute animals, tiny files; cubic
   silhouette is the trade-off.
3. **Exceptional_3D Cute Red Dino** — CC0, best "vinyl toy" surface quality; static, off-theme;
   useful as a material/lighting benchmark.
4. (Non-CC0) **"Just a Unicorn!"** — the only on-theme unicorn that meets the bar; requires CC BY
   attribution in-app and a Sketchfab login to download.

**No CC0 cute unicorn/pony was found** on Poly Pizza, Kenney, Quaternius or Sketchfab (CC0 filter).

---

## 4. What I could not verify / blockers

- **Quaternius Google Drive downloads blocked.** `gdown` and direct
  `https://drive.usercontent.google.com/download?id=…&export=download&confirm=t` returned Google's
  "Quota exceeded" page (HTTP 200, 2 040-byte HTML) for every file tried, including small
  `License.txt` files; same page ("Le quota autorisé a été atteint") when opened in the Playwright
  browser. Folder _listing_ works. License text was read in the Drive web viewer instead. Retry later
  or use itch.io mirrors (quaternius.itch.io) — not tried.
- **Sketchfab downloads** require an authenticated account (`/v3/models/<uid>/download` → 401). Not
  attempted with credentials.
- **Poly Pizza search coverage:** I used the site's own search pages for 14 terms; results are what
  the site returned on 2026-10-17, not an exhaustive catalogue.
- **Duolingo 3D**: only the homepage was checked (2D). Headspace was not checked.
- **Toca Boca**: the 3D image is one modal card; I did not verify whether Toca Boca's apps
  themselves use 3D characters.
- **Poly Pizza license strings** are the host's statement [P for the host], not a license file from
  the author. For Quaternius models it matches the pack License.txt; for Exceptional_3D, MiniPoly,
  Isa Lousberg I have only Poly Pizza's label.
- **Search-engine result** used once as a lead only [S] (WebSearch "CC0 cute unicorn 3D model glb");
  it surfaced no CC0 unicorn. Sources returned: [Sketchfab "Just a Unicorn"](https://sketchfab.com/3d-models/just-a-unicorn-8d0ae2d4b1ac4d1f8ab2adcdcc01cc8f),
  [Fab listing](https://fab.com/listings/15a9e6a4-cd29-4b03-8846-e2e7c87f022e),
  [Gumroad Unicorn](https://sandeepchoudhary.gumroad.com/l/Unicorn3DModel),
  [Coohom unicorn](https://www.coohom.com/3d-models/Toys/charming-unicorn-3d-model-for-imaginative-designs-mdtl~3FO3V3M6ISG3),
  [TurboSquid](https://www.turbosquid.com/3d-models/yellow-cartoon-unicorn-neutral-pose-1734576),
  [RenderHub](https://www.renderhub.com/supercigale/cartoon-unicorn-rigged).
- **Screenshots of third-party brands** (`ref-*.png`: Nintendo, Sanrio, Sony, Toca Boca…) are
  copyrighted marketing material captured for internal research. If the repo is public, decide
  before committing whether to keep them in Git or move them outside the repo.
- No render was made; no visual test of the assets in three.js / Blender was done in this spike.

## 5. Raw material outside the repo

`C:\Users\pierr\AppData\Local\Temp\claude\C--Dev-Multiplications-magiques\3b51f80a-c9a9-4282-bcd5-77ae8148442d\scratchpad\`

- `assets\polypizza\` — 6 GLB + host thumbnails
- `assets\kenney-cube-pets\` — zip + extracted pack (GLB/FBX/OBJ, previews, License.txt)
- `assets\quaternius-licenses\README.txt` — verbatim transcript of the Drive License.txt
- `assets\previews\` — Quaternius pack previews (`q_*.jpg`), Poly Pizza candidate thumbnails (`pp\`, `pp_contact.png`), Sketchfab unicorn thumbnails + metadata (`sf\`, `sf_contact.png`), Kenney previews
- `glb_stats.py`, `contact_sheet.py`, `dl_drive.py`, `list_ids.py`, `drive_listing.txt` — tooling / logs
