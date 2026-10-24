# Mane audit — A7 (2026-10-24)

User request (verbatim): « toute la coiffure est à auditer, pour presque tout refaire ! le niveau
de détails et la qualité n'y est pas ! cherche des audit anti-slop ».

Board: `audit/A7_mane_audit_board.png` (3/4 render 1024 px, front and side previews upscaled from
512 px; red numbers = findings below).

## Method and sources

No published "anti-slop" audit exists for 3D stylized characters (searched 2026-10-24). The
anti-slop audits found are for UI: the `audit-ai-design-slop` skill (MengTo/Skills) and
Impeccable. This audit takes the **form** of `audit-ai-design-slop`: evidence first, each finding
classed _defect_ or _slop pattern_, a removal test (what does the element bring? would removing
it help?), priorities P0-P3, an Unknowns section, no score. The **criteria** come from stylized
hair guides. All are secondary sources (tutorial blogs, a forum, a paid course page), not studio
production documents:

- Big / medium / small forms: big = silhouette, medium = clumps, small = a few strands inside or
  breaking away; block the big forms first (CG Cookie, Bucknell sculpture blog, Cubebrush course).
- Vary clump sizes, keep quiet areas: uniform thickness and spacing kill the style
  (Clip Studio "6-3-1" articles, anime hair guide).
- Hair grows from an origin (part, whorl) and is anchored to the hairline; it keeps a volume
  "barrier" off the scalp; ribbons, not tubes, except for locks; avoid repetitive shallow "S"
  curves, give each curve an opposite swing (Emmyroid, Clip Studio tips 10830).
- Each lock: clear root, body and tapered end; restraint, only clumps that help readability;
  topology and highlights follow the flow (Tripo3D guide, 3D.sk blog).

Sources: https://blog.cgcookie.com/posts/how-to-model-hair-in-blender/ (fetch refused 403, read
from the search summary only) · https://sculpture1.blogs.bucknell.edu/hair-modeling-examples/ ·
https://tips.clip-studio.com/en-us/articles/10830 (read in full) ·
https://www.tripo3d.ai/blog/explore/smart-mesh-topology-for-stylized-hair-clumps ·
https://raw.githubusercontent.com/MengTo/Skills/main/agent-skills/ui/audit-ai-design-slop/SKILL.md
(method read through a summary).

## Verdict

The mane is not a designed hairstyle: it is 23 sweeps from one recipe laid on a sphere (A7 count: 7 side locks + 7 inner + 4 slit + 2
side + nape + 2 fringe), each split into
5 near-identical strands (115 strands), then patched four times (A5 inner layer, A6 slit locks
and side lock, A7 cascade) to hide the gaps the layout itself creates. The result has a big form
(a helmet) but no medium forms (every clump is the same 5-strand fan), and its small forms are
everywhere instead of in a few places: needle tips, tip rolls and spikes all over. That is the
slop fingerprint here, **uniform repetition with no hierarchy**. Patching it further cannot fix
it. A redo should start from a designed silhouette and a clump map, not from the code.

## Findings

| #   | P   | Class  | Pattern                                    | Evidence                                                                                                                                                                                                                                             | Harm                                                         | Remove or fix                                                                   |
| --- | --- | ------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 10  | P1  | slop   | No medium forms: one clump size everywhere | `STRANDS` (5 strands, widths x0.5, lengths 0.8-1.0) applied to all 23 locks; lock widths 0.17-0.21. Front view reads as a bowl of equal parallel noodles                                                                                             | No focal point, no rhythm; "spaghetti / wig" read            | Redesign with 3 sizes (big, medium, small) and quiet areas                      |
| 12  | P1  | slop   | Lazy repeated "S"                          | Every lock is the same catmull-rom puff-out-and-back through 4-6 control points (`MANE_LEFT/RIGHT`); side view = parallel lanes from crest to tips                                                                                                   | Flow reads mechanical; no direction contrast                 | Design flow lines with opposing swings, a few long gestures                     |
| 5   | P1  | slop   | Same tip roll copied                       | `curl=(0.10-0.12, 0.32, None)` on 11 lock definitions, inherited by `inner_lock`, `mirrored`, `settled` → 21 of 23 locks end in the same roll. Replay: `grep -oE "curl=\(0\.1[0-2]?, 0\.32, None\)" scripts/blender/unicorn_mane.py \| wc -l` → `11` | Small round knobs repeat at every lock end (marker 5)        | Remove the roll from most locks; keep 1-2 deliberate curls as accents           |
| 4,7 | P1  | defect | Needle tips                                | `STRAND_TIP_CONE = 6.0`, width floor `0.02` (`strand_width`): tips end as thin spikes; under the jaw they bunch into a spiky tangle (marker 7)                                                                                                       | Clashes with the round chibi body; reads as thorns / icicles | Soft, rounded points (wider floor, short cone); few tips, grouped               |
| 1   | P1  | defect | Root jumble at the crest                   | `scalp_cap` metaball ridge + 23 roots on the midline (`(0, el, -0.03)`): lumpy pink band around the horn base and between the ears                                                                                                                   | No hairline, no origin; reads as clay blobs                  | One part / whorl origin behind the horn; roots hidden under the big form        |
| 2   | P2  | defect | Sausage loop at the horn                   | Right fringe lock (`FRINGE[1]`) bends left round the horn base as a horizontal tube (marker 2)                                                                                                                                                       | Reads as a hose, not hair                                    | Fringe redesigned with the forelock                                             |
| 3   | P2  | slop   | Snail curl on the forehead                 | Left fringe tip roll `curl=(0.08, 0.3, …)` with a fine needle after it (markers 3-4)                                                                                                                                                                 | A small round knob in the most watched spot of the face      | Removal test: it brings nothing the forelock shape could not → remove           |
| 6   | P2  | defect | Dark creases between layers                | Side view and 3/4: dark slits between outer and inner layers (marker 6); the four patch rounds A5-A7 each moved a crease rather than removing it                                                                                                     | Breaks the volume; needed 3 sessions of fixes                | Solid big form under the clumps, clumps lying on it                             |
| 8   | P2  | defect | Stray wisps crossing the jaw               | Pale strands across the left jaw line (marker 8), and on both sides in front view (marker 11)                                                                                                                                                        | Noise on the face outline                                    | Remove; place any flyaway deliberately                                          |
| 9   | P2  | slop   | Tail = same generator                      | `build_tail_strands`: 4 locks x 5 strands, parallel ribbons, same rolls (marker 9); reads as piped whipped cream                                                                                                                                     | Same repetition as the mane                                  | Redo with the mane (same rules), or scope out if the user prefers               |
| —   | P3  | slop   | Gradient without value structure           | `gradient_field`: colour by distance along each lock (pink → lilac → sky); separation between clumps comes only from shadow creases                                                                                                                  | Flat read at small sizes                                     | Keep the palette; add value contrast between clump layers (darker under-layers) |

## Removal test applied to the patch layers

| Layer                  | Added in | Role                               | Verdict                                                |
| ---------------------- | -------- | ---------------------------------- | ------------------------------------------------------ |
| `inner_lock` (7 locks) | A5       | fill the hollow under side locks   | exists only because locks stand off the skull → remove |
| `SLIT_LOCKS` (4)       | A6       | fill the slit behind the skull     | same cause → remove                                    |
| `SIDE_LOCK` (2)        | A6       | lock drawn by the user             | keep the **intent** (a lock on the side of the skull)  |
| `CASCADE` / `settled`  | A7       | settle the side locks on SIDE_LOCK | same cause → remove                                    |
| `scalp_cap`            | A2       | hide the roots                     | replaced by the big form                               |

## What is kept from the votes (user decisions, not reopened)

Chibi unicorn, procedural, ours (2026-10-17). A2: no muzzle in profile. A3 over A2: flat
tapering locks, not round tubes ("pool noodles"). A4 over A3: finer than one thick sweep per lock
("dreadlocks"). A5/A6: no band between skull and mane seen from the front (C4), no gap between
head and mane (C6). A6 drawing: a lock lying on the side of the skull, behind the ear down to the
cheek. Palette `studio.MANE_STOPS`.

## Unknowns

- Back and top views not rendered: the crest and nape were seen only in 3/4 and side previews.
- Interpenetration of strands with the head and the body: not measured (only seen where visible).
- Whether a procedural (Python / geometry nodes) build can reach hand-sculpted quality is not
  proven; that is what the redo spike must show, against a target the user validates first.

## Target board (2026-10-24, user: « oui refais la queue aussi, fais la planche cible »)

Page: `target.html` (served from this folder: `python -m http.server 8765 --bind 127.0.0.1`,
then `http://127.0.0.1:8765/target.html`), with a copy-paste feedback form.

- A paint-over **map**, not a render: tapered 2D ribbons drawn over the unicorn rendered without
  mane and tail, same framing as A7, four views (3/4, front, side, back).
- Rules it encodes, one per finding above: a solid darker big form under every clump (6), one
  origin whorl behind the horn (1), three clump sizes plus only 2 small strands (10), detail as
  grooves sculpted into each clump instead of loose strands (10), three curls in all (5, 3), soft
  tips (4, 7), different gestures and lengths (12), tail redone with the same rules (9).
- Reproduce: `target/bald_views.py` (docstring: Blender commands + alpha extraction), then
  `cd target && python paintover.py design.py` → `target_<view>.png`. The clumps are placed by
  hand in `design.py` from the skull landmarks `bald_views.py` prints.
- Checked: `bald_views.py` re-renders the committed 3/4 base with a max pixel difference of 1
  (render noise); the cleaned `paintover.py` gives a max difference of 0 against the first draft.
- Not voted. The build only starts once the user validates the target (or draws on it).

## Finesse pass (2026-10-24, user: « attention à la finesse de la crinière stp; il faut vraiment s'appliquer », « cherche des exemples ou assets sur le web via liens /wiki », « tu as aussi meshy »)

- **Wiki first:** no hair article; `topics/game-dev/bibliotheques-assets-3d-libres.md` points to
  Sketchfab, `entities/meshy.md` to the Meshy community (CC0 by its ToS §3.3, download on paid
  plans only).
- **Sketchfab** (public search API `api.sketchfab.com/v3/search`, thumbnails looked at): the
  stylized hair sculpts by rumpelshtiltshin (Hair 45 / 37 / 40, Standard licence, links only)
  show where finesse comes from: narrow locks in layers, fine incised strand lines, long tapers,
  forked tips, a few lone strands, darker under-layers.
- **Meshy** (tag pages are public, search needs an account): `/tags/unicorn` (« plus de 544 »),
  `/tags/hair` (1776), `/tags/mane` (599). Closest: « Cute little cartoon unicorn » (Meshy-4,
  CC0, 9 930 faces). **Measured in its viewer's solid mode: the mane is one smooth mass; the fine
  strands are painted in the texture.** So Meshy gives shape and colour references, not fine
  geometry; it also suggests fine grooves could come from a bump / normal map on simpler locks.
- **Two failed drafts on the map (kept as lessons):** all-thin equal locks read as spaghetti
  (the A4-A7 defect again); wide clumps (first board) read as chunky, not fine.
- **Kept:** each readable clump of the first board becomes a bundle of 3-6 fine locks of varied
  widths (`paintover.section_locks`, `design.fine`), converging and tapering to the tip, every
  third tip forked, the curl on the widest lock. Counts (replay: `cd target && python -c "import
design; [print(v[4], sum(s['n'] for s in v[1] if isinstance(s, dict))) for v in design.VIEWS]"`):
  3/4 37 locks, front 26, side 30, back 41; lock spacing 11-20 px for a head ~495 px wide in 3/4.
