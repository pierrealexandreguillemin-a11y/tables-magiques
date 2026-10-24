"""Paint-over target map: tapered 2D ribbons over the bald renders (screen space, 1024 px).

  python paintover.py design.py   -> target_<view>.png next to design.py

design.VIEWS = [(bald gradient png, clumps, marks, output png, title)]. The bald render's
character mask is read from the matching *_alpha.png (made by bald_views.py).
Clump = (label, class, centreline points, max half-width px, curl or None, colour t[, "back"]):
  class 'M' = medium clump (filled, with sculpted grooves), 'S' = small strand (thin);
  curl = (radius px, turns, +1 / -1 direction), a roll appended to the tip;
  "back" = drawn behind the character (masked by its alpha). Drawn in list order.
A clump may also be a dict, a section of fine locks (see section_locks): either "edges" (two
polylines) or "spine" + "half" (a bundle converging to its tip), with "n" locks, colour range
"t", and optional "curl", "seed", "min_len", "max_w", "overlap", "back", "label".
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


def fine_width(t, w):
    """Fine lock: full width to mid-length, then a long gradual taper to a fine point."""
    s = min(max((t - 0.4) / 0.6, 0.0), 1.0)
    return w * ((1 - s * s * (3 - 2 * s)) ** 0.85 * 0.97 + 0.03)


def ribbon(c, w, prof=width, t0=0.0, t1=1.0):
    """Outline of a ribbon of half-width prof(t, w) along c; t runs t0 -> t1 over c."""
    n = len(c) - 1
    left, right = [], []
    for i, (x, y) in enumerate(c):
        nx, ny = normal(c, i)
        ww = prof(t0 + (t1 - t0) * i / n, w)
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


def resample(pts, m):
    """Polyline -> m points evenly spaced along its length."""
    c = catmull(pts, 16)
    acc = [0.0]
    for a, b in zip(c, c[1:]):
        acc.append(acc[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    out, j = [], 0
    for k in range(m):
        s = acc[-1] * k / (m - 1)
        while j < len(acc) - 2 and acc[j + 1] < s:
            j += 1
        f = (s - acc[j]) / ((acc[j + 1] - acc[j]) or 1)
        out.append((c[j][0] + (c[j + 1][0] - c[j][0]) * f, c[j][1] + (c[j + 1][1] - c[j][1]) * f))
    return out


def frac(x):
    return x - math.floor(x)


def section_locks(sec):
    """A big form split into n fine locks flowing between its two edges (screen polylines, root
    first). Deterministic variation per lock (golden-ratio sequence): length, a slight sideways
    wave, and a forked tip on every third lock; one lock may end in a curl."""
    if "spine" in sec:  # a bundle: edges = spine +- half-width, converging towards the tip
        sp = resample(sec["spine"], 40)
        a, b = [], []
        for i, (x, y) in enumerate(sp):
            nx, ny = normal(sp, i)
            h = sec["half"] * (1.0 - 0.75 * (i / 39) ** 1.6)
            a.append((x + nx * h, y + ny * h))
            b.append((x - nx * h, y - ny * h))
    else:
        a, b = resample(sec["edges"][0], 40), resample(sec["edges"][1], 40)
    n = sec["n"]
    locks = []
    for k in range(n):
        u = (k + 0.5) / n
        g = frac(k * 0.618 + sec.get("seed", 0.0))
        length = sec.get("min_len", 0.72) + (1 - sec.get("min_len", 0.72)) * g
        pts = [(a[i][0] + (b[i][0] - a[i][0]) * u, a[i][1] + (b[i][1] - a[i][1]) * u) for i in range(40)]
        pts = pts[: max(int(40 * length), 6)]
        spacing = math.hypot(b[20][0] - a[20][0], b[20][1] - a[20][1]) / n
        wave = spacing * 0.35
        pts = [(x + normal(pts, i)[0] * wave * math.sin(math.pi * i / len(pts) + 6.3 * g), y + normal(pts, i)[1] * wave * math.sin(math.pi * i / len(pts) + 6.3 * g)) for i, (x, y) in enumerate(pts)]
        w = min(spacing * sec.get("overlap", 1.25), sec.get("max_w", 26)) * (0.65 + 0.7 * frac(k * 0.382 + sec.get("seed", 0.0)))
        widest = max(range(n), key=lambda j: frac(j * 0.382 + sec.get("seed", 0.0)))
        curl = sec["curl"] if "curl" in sec and k == widest else None
        locks.append((pts[::3] + [pts[-1]], w, curl, sec["t"][0] + (sec["t"][1] - sec["t"][0]) * u, k % 3 == 1 and not curl))
    order = sorted(range(n), key=lambda k: (k % 2, k)) if sec.get("interleave", True) else range(n)
    return [locks[k] for k in order]


FINE_GROOVES = ((-0.4, 0.06, 0.62), (0.0, 0.03, 0.8), (0.42, 0.1, 0.55))


def draw_fine_lock(d, pts, w, curl, t, fork):
    """A fine lock: three fine sculpted grooves, a long gradual taper; `fork` splits the last 35 %
    into two thinner tips that part slightly."""
    c = catmull([(x * SS, y * SS) for x, y in pts])
    if curl:
        c = add_curl(c, (curl[0] * SS, curl[1], curl[2]))
    col = ramp(t)
    W = w * SS
    fill, edge = col + (232,), INK + (210,)
    n = len(c) - 1
    if fork:
        cut = int(n * 0.65)
        d.polygon(ribbon(c[: cut + 1], W, fine_width, 0.0, 0.4), fill=fill, outline=edge, width=SS)
        for s in (-1, 1):
            br = []
            for i in range(cut, n + 1):
                nx, ny = normal(c, i)
                f = (i - cut) / (n - cut)
                br.append((c[i][0] + nx * s * W * (0.3 + 0.6 * f), c[i][1] + ny * s * W * (0.3 + 0.6 * f)))
            d.polygon(ribbon(br, W * 0.7, fine_width, 0.3, 1.0), fill=fill, outline=edge, width=SS)
    else:
        d.polygon(ribbon(c, W, fine_width), fill=fill, outline=edge, width=SS)
    for off, start, end in FINE_GROOVES:
        g = []
        for i in range(int(n * start), int(n * end)):
            nx, ny = normal(c, i)
            ww = fine_width(i / n, W) * off
            g.append((c[i][0] + nx * ww, c[i][1] + ny * ww))
        if len(g) > 1:
            d.line(g, fill=lerp(col, INK, 0.3) + (150,), width=SS)


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
    for item in clumps:
        if isinstance(item, dict):  # a section of fine locks
            for pts, w, curl, t, fork in section_locks(item):
                draw_fine_lock(db if item.get("back") else df, pts, w, curl, t, fork)
            continue
        label, cls, pts, w, curl, t, *layer = item
        draw_clump(db if layer == ["back"] else df, label, cls, pts, w, curl, t, small)
    for item in clumps:  # section labels on top
        if isinstance(item, dict) and item.get("label"):
            if "spine" in item:
                x, y = resample(item["spine"], 40)[16]
            else:
                (x1, y1), (x2, y2) = resample(item["edges"][0], 40)[12], resample(item["edges"][1], 40)[12]
                x, y = (x1 + x2) / 2, (y1 + y2) / 2
            x, y = x * SS, y * SS
            df.ellipse((x - 19 * SS, y - 19 * SS, x + 19 * SS, y + 19 * SS), fill=(255, 255, 255, 235), outline=INK + (255,), width=2 * SS)
            df.text((x, y), item["label"], fill=INK, font=small, anchor="mm")
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
