# Sculpted chibi mane (S1) and Meshy community references — 2026-10-25

User: « commence par produire une crinière chibi conforme. puis on itèrera en brins fins si
besoin ».

## S1 — sculpted shell mane (`scripts/blender/mane_sculpt.py`, `--mane sculpt`)

One closed shell per tier, grown from a whorl behind the horn, lanes turning down under gravity,
locks with V tips, tiers offset by half a lock. Render: `render_views.py` (4 views in one Blender
run, ~100 s at 512 px / 48 spp on CPU).

| Iteration | Sheet           | Seen by me (no judge run)                                                                |
| --------- | --------------- | ---------------------------------------------------------------------------------------- |
| it0       | `it0_sheet.png` | failed: petals / feathers, a daisy of crown locks round the horn, bare cheeks            |
| it1       | `it1_sheet.png` | reads as sculpted hair (bob), but hood/helmet in profile, washed-out colour, tiny fringe |

Two failures at this level → anti-slop Step 3 stop: back to references (Step 1), done below.

## Step 1 — mining the Meshy community (CC0)

- API `GET https://api.meshy.ai/openapi/v1/showcases` tried with the user's key on 2026-10-25:
  **403 « This endpoint is only available for enterprise users »** (contract in
  `C:/Dev/wiki/raw/web/meshy-cli-readme-showcases-contract-2026-10-23.md`). Balance after:
  1150 credits (nothing charged).
- Community search (`/discover`) asks for a login; the Chrome extension (logged-in browser) was
  not connected. Public tag pages work without login: `/tags/{unicorn,unicorns,mlp,pony,pastel}`,
  pages 1-3, parsed for model links + thumbnails → 102 models, `meshy-community/contact_tags.png`.
- Shortlist (`meshy-community/shortlist.png`), numbers = contact sheet index:

| #   | Page                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------- |
| 16  | https://www.meshy.ai/fr/posts/cute-crochet-style-unicorn-01a0545c-706a-761d-8988-65c0e9096e88             |
| 22  | https://www.meshy.ai/fr/posts/01943ba0-b47c-795c-917f-0f5fbd60d637                                        |
| 24  | https://www.meshy.ai/fr/posts/unico-del-libro-01a0197d-1f83-7e87-a094-834ef2d45690                        |
| 26  | https://www.meshy.ai/fr/posts/019ec0ca-7b81-7802-8b8f-04235a1732dc                                        |
| 34  | https://www.meshy.ai/fr/posts/019ef7e2-1773-716a-bc39-baa9da122670                                        |
| 35  | https://www.meshy.ai/fr/posts/019e9d9b-a773-73d4-bed5-4353956e2473                                        |
| 36  | https://www.meshy.ai/fr/posts/019d68c9-3746-741a-9012-f6a87a078ce2                                        |
| 52  | https://www.meshy.ai/fr/posts/019c8165-f85b-78bd-a07c-10a94130db70 (MLP-styled: structure reference only) |
| 62  | https://www.meshy.ai/fr/posts/019f345f-5d52-730c-87dd-fa0e1d1be299                                        |

What every chibi unicorn of the shortlist shares (looked at, thumbnails only):

- **Pony layout, not a wig**: a forelock swoops from beside the horn over one side of the
  forehead; the mane runs down the back of the head and the neck and falls on **one** side.
  None frames the face on both sides like A6 / S1 do.
- **Few big S-shaped masses** (3-6), each a broad ribbon with a crisp edge and a pointed or
  rolled tip; layering forelock > mane > under-locks.
- **Colour per lock** (pink / lilac / mint / sky bands, or a strong gradient) — it is what makes
  the locks readable; S1's near-white gradient erases them.
