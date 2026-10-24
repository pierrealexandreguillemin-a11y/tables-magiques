"""Build a blind review pack: candidate hair renders vs the user's reference, same views.

  python build_pack.py <candidate-pattern> <out-dir> [<bald-pattern>]
  e.g. python build_pack.py "negative/map4_{view}.png" "<scratchpad>/review/map4" \
         "../target/bald/bald_{view}_gradient.png"

<candidate-pattern> holds `{view}`; views without a candidate file are skipped. <bald-pattern>
is the same character rendered without mane and tail at the same camera: the hair is then
framed alone (difference with the bald render), like the reference. Writes into
<out-dir> (keep it out of the repo, procedure Q.1):
  pairs/<view>_<order>_<1|2>.png  neutral names, order A = candidate first, B = swapped
  key.json                        which pair image is the candidate (never given to a judge)
  defects/cand_<view>.png         candidate alone, for lens H-B
  sheet.png                       reference | candidate per view, for the user
  brief.md                        the judge prompts, one per pass

Each image is cropped to its hair (reference: distance to the backdrop; candidate: difference
with the bald render), padded and fitted in the same square, so both sides of a pair share one
framing.
"""

import json
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
VIEWS_DIR = os.path.join(HERE, "chibi-refs", "views")
VIEWER_UI = (0, 45, 1200, 835)  # Sketchfab embed captures: title bar and player controls left out
# view -> (file, crop, mirror); mirrored so the head faces left like our cameras
REFERENCES = {
    "meshy": {v: (os.path.join(HERE, "reference", f"ref_{v}.png"), None, False) for v in ("front", "3q", "side", "back")},
    "structure": {
        "front": (os.path.join(VIEWS_DIR, "C_rot5.png"), VIEWER_UI, False),
        "3q": (os.path.join(VIEWS_DIR, "C_rot4.png"), VIEWER_UI, False),
        "side": (os.path.join(VIEWS_DIR, "C_rot2.png"), VIEWER_UI, True),
        "back": (os.path.join(VIEWS_DIR, "C_rot3.png"), VIEWER_UI, False),
    },
    "finesse": {
        "front": (os.path.join(VIEWS_DIR, "A_rot5.png"), VIEWER_UI, False),
        "3q": (os.path.join(VIEWS_DIR, "A_rot4.png"), VIEWER_UI, False),
    },
}
VIEWS = ("front", "3q", "side", "back")
SIZE = 768
PAD = 0.06
BG = (46, 48, 54)  # neutral dark grey behind alpha renders, close to the reference's backdrop
SUBJECT_DIFF = 40  # min channel distance to the background to count as hair
REFERENCE_HAIR = (230, 130, 820, 915)  # reference captures: viewer panels and toolbar left out
TEXTURE_DIFF = 4  # reference: min blurred edge strength; its vignette defeats a backdrop diff
MAP_TITLE_ROWS = 0.08  # paint-over maps carry their view title in the top band


def mask_box(diff, skip_rows=0):
    mask = diff.convert("L").point(lambda d: 255 if d > SUBJECT_DIFF else 0)
    if skip_rows:
        mask.paste(0, (0, 0, mask.width, skip_rows))
    return mask.getbbox()


def backdrop_box(img):
    """Subject against a backdrop that varies smoothly between the left and right borders."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    left = rgb.crop((0, 0, 8, h)).resize((1, h))
    right = rgb.crop((w - 8, 0, w, h)).resize((1, h))
    edges = Image.new("RGB", (2, h))
    edges.paste(left, (0, 0))
    edges.paste(right, (1, 0))
    return mask_box(ImageChops.difference(rgb, edges.resize((w, h), Image.BILINEAR)))


def texture_box(img):
    """Strands are high-frequency; the reference's radial vignette and floor shadow are smooth."""
    edges = img.convert("L").filter(ImageFilter.FIND_EDGES)
    w, h = edges.size
    for rim in ((0, 0, w, 3), (0, h - 3, w, h), (0, 0, 3, h), (w - 3, 0, w, h)):
        edges.paste(0, rim)  # FIND_EDGES rings along the image border
    edges = edges.filter(ImageFilter.BoxBlur(4))
    return edges.point(lambda d: 255 if d > TEXTURE_DIFF else 0).getbbox()


def hair_box(img, bald_path):
    bald = Image.open(bald_path).convert("RGB").resize(img.size, Image.LANCZOS)
    diff = ImageChops.difference(img.convert("RGB"), bald)
    return mask_box(diff, int(img.height * MAP_TITLE_ROWS))


def framed(path, bald_path=None, ref=None):
    img = Image.open(path)
    if ref == "meshy":
        img = img.crop(REFERENCE_HAIR)
        box = texture_box(img)
    elif ref:
        crop, mirror = ref
        img = img.convert("RGB").crop(crop)
        if mirror:
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        box = backdrop_box(img)
    elif bald_path:
        box = hair_box(img, bald_path)
    else:
        box = backdrop_box(img)
    if box is None:
        raise SystemExit(f"no subject found in {path}")
    x0, y0, x1, y1 = box
    side = int(max(x1 - x0, y1 - y0) * (1 + 2 * PAD))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    canvas = Image.new("RGB", (side, side), BG)
    src = img.convert("RGBA")
    canvas.paste(src, (side // 2 - cx, side // 2 - cy), src)
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def sheet(rows, ref_name):
    out = Image.new("RGB", (2 * SIZE, len(rows) * SIZE + 28), (20, 20, 24))
    draw = ImageDraw.Draw(out)
    draw.text((8, 8), f"reference ({ref_name})", fill="white")
    draw.text((SIZE + 8, 8), "candidate", fill="white")
    for i, (view, ref, cand) in enumerate(rows):
        out.paste(ref, (0, 28 + i * SIZE))
        out.paste(cand, (SIZE, 28 + i * SIZE))
        draw.text((8, 36 + i * SIZE), view, fill="yellow")
    return out


H_A = (
    "Lens H-A, view {view}. Image 1: {img1}  Image 2: {img2}. Follow your agent instructions "
    "and the rubric; answer with the H-A JSON only."
)
H_B = (
    "Lens H-B. Candidate images: {imgs}. Follow your agent instructions and the rubric; answer "
    "with the H-B JSON only."
)


def main(pattern, out_dir, bald_pattern=None, ref_name="meshy"):
    refs = REFERENCES[ref_name]
    for sub in ("pairs", "defects"):
        os.makedirs(os.path.join(out_dir, sub), exist_ok=True)
    key, rows, prompts, cands = {}, [], [], []
    for view in VIEWS:
        cand_path = pattern.format(view=view)
        if view not in refs or not os.path.exists(cand_path):
            continue
        ref_path, crop, mirror = refs[view]
        ref = framed(ref_path, ref="meshy" if ref_name == "meshy" else (crop, mirror))
        cand = framed(cand_path, bald_pattern.format(view=view) if bald_pattern else None)
        rows.append((view, ref, cand))
        cand_out = os.path.join(out_dir, "defects", f"cand_{view}.png")
        cand.save(cand_out)
        cands.append(cand_out)
        for order, first, second in (("A", cand, ref), ("B", ref, cand)):
            names = [os.path.join(out_dir, "pairs", f"{view}_{order}_{n}.png") for n in (1, 2)]
            first.save(names[0])
            second.save(names[1])
            key[f"{view}_{order}"] = {
                "candidate": 1 if order == "A" else 2,
                "source": cand_path,
                "ref": ref_name,
            }
            prompts.append(H_A.format(view=view, img1=names[0], img2=names[1]))
    if not rows:
        raise SystemExit(f"no candidate matches {pattern}")
    prompts.append(H_B.format(imgs=", ".join(cands)))
    with open(os.path.join(out_dir, "key.json"), "w", encoding="utf-8") as f:
        json.dump(key, f, indent=2)
    with open(os.path.join(out_dir, "brief.md"), "w", encoding="utf-8") as f:
        f.write("# Judge prompts (one fresh hair-judge agent per line)\n\n")
        f.writelines(f"- {p}\n" for p in prompts)
    sheet(rows, ref_name).save(os.path.join(out_dir, "sheet.png"))
    print(f"{len(rows)} views, {len(prompts)} passes -> {out_dir}")


if __name__ == "__main__":
    args = sys.argv[1:]
    ref_name = "meshy"
    if "--ref" in args:
        i = args.index("--ref")
        ref_name = args[i + 1]
        del args[i : i + 2]
    main(*args[:3], ref_name=ref_name)
