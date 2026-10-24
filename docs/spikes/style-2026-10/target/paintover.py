"""Paint-over target map: tapered 2D ribbons over the bald renders (screen space, 1024 px).

  python paintover.py design.py   -> target_<view>.png next to design.py

design.VIEWS = [(bald gradient png, clumps, marks, output png, title)]. The bald render's
character mask is read from the matching *_alpha.png (made by bald_views.py).
Clump = (label, class, centreline points, max half-width px, curl or None, colour t[, "back"]):
  class 'M' = medium clump (filled, with sculpted grooves), 'S' = small strand (thin);
  curl = (radius px, turns, +1 / -1 direction), a roll appended to the tip;
  "back" = drawn behind the character (masked by its alpha). Drawn in list order.
Marks: ("base", points) solid big form under every clump, ("origin", x, y, label) the whorl
every lock starts from, ("silhouette", points) the dashed outline of the big form.
"""

import math
import sys

from PIL import Image, ImageDraw, ImageFont

SS = 2  # supersampling
PAL = [(255, 182, 222), (214, 182, 255), (176, 206, 255)]  # pink -> lilac -> sky (as studio.MANE_STOPS)
BASE_FILL = (150, 120, 205, 235)  # the big form is darker than the clumps on it (value structure)
INK = (70, 30, 110)
RED = (220, 0, 60)
GROOVES = ((-0.45, 0.08, 0.62), (0.05, 0.02, 0.84), (0.5, 0.15, 0.55))  # (offset x half-width, start, end)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def ramp(t):
    t = max(0.0, min(1.0, t))
    return lerp(PAL[0], PAL[1], t * 2) if t < 0.5 else lerp(PAL[1], PAL[2], t * 2 - 1)


def catmull(pts, n=24):
    p = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for k in range(n):
            t = k / n
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t**3) for j in range(2)))
    out.append(pts[-1])
    return out


def add_curl(c, curl):
    r, turns, d = curl
    (x0, y0), (x1, y1) = c[-2], c[-1]
    a = math.atan2(y1 - y0, x1 - x0)
    cx, cy = x1 + r * math.cos(a + d * math.pi / 2), y1 + r * math.sin(a + d * math.pi / 2)
    a0 = math.atan2(y1 - cy, x1 - cx)
    n = int(40 * turns)
    for k in range(1, n + 1):
        f = k / n
        ang = a0 + d * 2 * math.pi * turns * f
        c.append((cx + r * (1 - 0.55 * f) * math.cos(ang), cy + r * (1 - 0.55 * f) * math.sin(ang)))
    return c


def width(t, w):
    """Swells after the root, then tapers to a soft (not needle) point."""
    rise = 0.75 + 0.25 * min(t / 0.3, 1)
    return w * (rise * max(1 - t**2.2, 0) ** 0.5 + 0.14)


def normal(c, i):
    a, b = c[max(i - 1, 0)], c[min(i + 1, len(c) - 1)]
    L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
    return -(b[1] - a[1]) / L, (b[0] - a[0]) / L


def ribbon(c, w):
    n = len(c) - 1
    left, right = [], []
    for i, (x, y) in enumerate(c):
        nx, ny = normal(c, i)
        ww = width(i / n, w)
        left.append((x + nx * ww, y + ny * ww))
        right.append((x - nx * ww, y - ny * ww))
    return left + right[::-1]


def grooves(c, w):
    n = len(c) - 1
    for off, start, end in GROOVES:
        g = []
        for i in range(int(n * start), int(n * end)):
            nx, ny = normal(c, i)
            ww = width(i / n, w) * off
            g.append((c[i][0] + nx * ww, c[i][1] + ny * ww))
        if len(g) > 1:
            yield g


def draw_clump(d, label, cls, pts, w, curl, t, font):
    c = catmull([(x * SS, y * SS) for x, y in pts])
    if curl:
        c = add_curl(c, (curl[0] * SS, curl[1], curl[2]))
    col = ramp(t)
    if cls == "M":
        d.polygon(ribbon(c, w * SS), fill=col + (215,), outline=INK + (255,), width=2 * SS)
        for g in grooves(c, w * SS):  # detail = grooves sculpted in the clump, not loose strands
            d.line(g, fill=lerp(col, INK, 0.35) + (190,), width=2 * SS)
    else:
        d.polygon(ribbon(c, w * SS), fill=lerp(col, INK, 0.25) + (235,), outline=INK + (255,), width=SS)
    if label:
        x, y = c[int(len(c) * 0.45)]
        d.ellipse((x - 17 * SS, y - 17 * SS, x + 17 * SS, y + 17 * SS), fill=(255, 255, 255, 230), outline=INK + (255,), width=2 * SS)
        d.text((x, y), label, fill=INK, font=font, anchor="mm")


def draw_marks(d, marks, font):
    for kind, *rest in marks:
        if kind == "origin":
            x, y, txt = rest[0] * SS, rest[1] * SS, rest[2]
            star = [(x + (22 if k % 2 == 0 else 9) * SS * math.cos(math.pi / 5 * k - math.pi / 2), y + (22 if k % 2 == 0 else 9) * SS * math.sin(math.pi / 5 * k - math.pi / 2)) for k in range(10)]
            d.polygon(star, fill=RED + (255,), outline=(255, 255, 255, 255))
            d.text((x + 30 * SS, y - 4 * SS), txt, fill=RED, font=font, anchor="lm")
        elif kind == "silhouette":
            c = catmull([(px * SS, py * SS) for px, py in rest[0]], 16)
            for i in range(0, len(c) - 1, 2):  # dashed
                d.line([c[i], c[i + 1]], fill=RED + (255,), width=3 * SS)


def draw(base, clumps, marks, out, title):
    size = (1024 * SS, 1024 * SS)
    im = Image.open(base).convert("RGBA").resize(size)
    front, back = Image.new("RGBA", size, (0, 0, 0, 0)), Image.new("RGBA", size, (0, 0, 0, 0))
    df, db = ImageDraw.Draw(front), ImageDraw.Draw(back)
    font = ImageFont.truetype("arialbd.ttf", 26 * SS)
    small = ImageFont.truetype("arialbd.ttf", 20 * SS)
    for kind, *rest in marks:
        if kind == "base":
            pts = [(x * SS, y * SS) for x, y in rest[0]]
            df.polygon(catmull(pts + pts[:1], 12), fill=BASE_FILL, outline=INK + (255,), width=2 * SS)
    for label, cls, pts, w, curl, t, *layer in clumps:
        draw_clump(db if layer == ["back"] else df, label, cls, pts, w, curl, t, small)
    draw_marks(df, marks, font)
    char = Image.open(base.replace("_gradient", "_alpha")).convert("L").resize(size)
    back.putalpha(Image.composite(back.getchannel("A"), Image.new("L", size, 0), Image.eval(char, lambda a: 255 - a)))
    im = Image.alpha_composite(Image.alpha_composite(im, back), front).convert("RGB")
    ImageDraw.Draw(im).text((24 * SS, 24 * SS), title, fill=INK, font=font)
    im.resize((1024, 1024), Image.LANCZOS).save(out)


if __name__ == "__main__":
    import importlib.util

    spec = importlib.util.spec_from_file_location("design", sys.argv[1])
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for args in mod.VIEWS:
        draw(*args)
        print("wrote", args[3])
