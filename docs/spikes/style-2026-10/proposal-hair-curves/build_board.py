"""Proposal board: what the Meshy reference does, what A8 lacks, how a chibi mane transposes it."""
import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SPIKE = os.path.dirname(HERE)
FONT = "C:/Windows/Fonts/segoeui.ttf"
BOLD = "C:/Windows/Fonts/segoeuib.ttf"
INK, MUTED, BG, ACCENT, BAD = (30, 28, 40), (95, 92, 110), (250, 248, 252), (124, 77, 255), (214, 48, 84)
PANEL_H = 620

# (file, crop box, title, markers [(n, x, y)] in source pixels, marker colour)
PANELS = [
    ("harness/reference/ref_side.png", (300, 140, 790, 820), "Meshy — profil", [(1, 600, 300), (2, 700, 390), (3, 430, 520), (4, 400, 760), (5, 655, 575)], ACCENT),
    ("harness/reference/ref_3q.png", (360, 140, 730, 800), "Meshy — 3/4", [(1, 560, 320), (2, 455, 200), (3, 530, 560), (4, 505, 730), (5, 410, 310)], ACCENT),
    ("harness/trials/a8/it1_3q.png", (140, 60, 880, 980), "A8 refusé — ce qui manque", [(1, 620, 300), (2, 450, 150), (3, 700, 430), (4, 640, 600), (5, 728, 330)], BAD),
]
ROWS = [
    ("Masse pleine, crâne jamais visible", "Racines sur toute la bande de crête (masque de densité) ; jamais sur les joues", "Interpolate + Density Mask"),
    ("Couches : dessous plaqué, dessus qui se décolle", "2 couches de guides : courte collée au cou, longue qui gonfle au sommet", "2 jeux de guides"),
    ("Mèches regroupées, pas un bloc ni des spaghettis", "15–25 mèches lisibles à 200 px (chibi), chacune faite de centaines de brins", "Clump Hair Curves"),
    ("Pointes effilées, chacune sa direction", "Profil effilé + désordre sur le dernier tiers seulement", "Set Profile + Frizz/Noise"),
    ("Silhouette déchiquetée, mèches folles", "5–10 brins isolés hors de la masse, pas plus", "guides libres"),
]
NOT_COPIED = "Pas copié : la queue de cheval, la longueur, le brun réaliste. Gardé : pastel lilas/bleu, longueur chibi (jusqu'au cou), rendu doux."


def panel(path, box, title, marks, colour):
    im = Image.open(os.path.join(SPIKE, path)).convert("RGB").crop(box)
    k = PANEL_H / im.height
    im = im.resize((round(im.width * k), PANEL_H), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BOLD, 26)
    for n, x, y in marks:
        cx, cy = (x - box[0]) * k, (y - box[1]) * k
        d.ellipse((cx - 19, cy - 19, cx + 19, cy + 19), fill=colour, outline="white", width=3)
        d.text((cx, cy), str(n), font=f, fill="white", anchor="mm")
    return im, title


def main():
    tiles = [panel(*p) for p in PANELS]
    gap, pad = 24, 40
    width = sum(t[0].width for t in tiles) + gap * (len(tiles) - 1) + 2 * pad
    row_h, table_top = 72, pad + 50 + PANEL_H + 40
    height = table_top + row_h * (len(ROWS) + 1) + 90
    out = Image.new("RGB", (width, height), BG)
    d = ImageDraw.Draw(out)
    h2, body, small = ImageFont.truetype(BOLD, 24), ImageFont.truetype(FONT, 21), ImageFont.truetype(FONT, 19)
    x = pad
    for im, title in tiles:
        d.text((x, pad), title, font=h2, fill=INK)
        out.paste(im, (x, pad + 44))
        x += im.width + gap
    cols = [pad, pad + 60, pad + 560]
    for c, label in zip(cols, ["N°", "Ce que fait Meshy", "Transposé en chibi  ·  outil Blender 5.2"]):
        d.text((c, table_top), label, font=h2, fill=INK)
    for i, (meshy, chibi, tool) in enumerate(ROWS, 1):
        y = table_top + row_h * i
        d.line((pad, y - 8, width - pad, y - 8), fill=(225, 220, 235), width=2)
        d.text((cols[0] + 12, y), str(i), font=h2, fill=ACCENT)
        d.multiline_text((cols[1], y), textwrap.fill(meshy, 44), font=body, fill=INK, spacing=4)
        d.text((cols[2], y), chibi, font=body, fill=INK)
        d.text((cols[2], y + 28), tool, font=small, fill=ACCENT)
    d.text((pad, height - 70), NOT_COPIED, font=small, fill=MUTED)
    out.save(os.path.join(HERE, "board.png"))
    print("board.png", out.size)


if __name__ == "__main__":
    main()
