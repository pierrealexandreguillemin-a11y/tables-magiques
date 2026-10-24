"""Target design of the mane and tail, four views, for paintover.py.

A paint-over MAP, not a render: clumps (gesture lines) placed by hand over the bald renders made
by bald_views.py (same framing as A7), using the skull landmarks that script prints. Each clump
is drawn as a bundle of fine locks (user, 2026-10-24: « attention à la finesse de la crinière »).

Crest mane (user, 2026-10-24, refusing the previous map: « on dirait un casque de cheveux ! »):
roots on the midline only, from a whorl behind the horn (O) to the nape; the forelock sweeps
over the forehead; the mass falls behind the head and down the neck with air between it and the
skull; the sides of the head stay bare except the lock the user drew behind the ear (L1).
Labels: F forelock, L locks over the near side (character's left), M main mass behind the head,
N nape (back view), R far side, T tail, s small strand. 'back' = drawn behind the character.
"""

import os

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "bald", "bald_{}_gradient.png")


def out(view):
    return os.path.join(HERE, f"target_{view}.png")


def bundle(label, spine, half, t, curl=None, back=False, seed=0.0):
    """One readable clump (gesture = spine, half-width = half) drawn as 3-6 fine locks of varied
    widths converging to the tip."""
    n = max(3, min(6, round(half / 9)))
    sec = {"label": label, "spine": spine, "half": half, "n": n, "t": (t - 0.07, t + 0.07), "min_len": 0.78, "seed": seed, "back": back}
    if curl:
        sec["curl"] = curl
    return sec


COWLICK = [(0, 0), (-14, -34), (-4, -60), (18, -68)]  # small strand standing up from the whorl


def cowlick(x, y):
    return ("", "S", [(x + dx, y + dy) for dx, dy in COWLICK], 4, None, 0.05)


Q = [
    bundle("T3", [(650, 760), (690, 800), (706, 860), (694, 905)], 16, 0.85, back=True, seed=0.1),
    bundle("T2", [(648, 750), (716, 760), (764, 810), (770, 880)], 28, 0.6, back=True, seed=0.4),
    bundle("T1", [(650, 740), (722, 698), (800, 700), (850, 760), (856, 838), (826, 892)], 40, 0.3, curl=(22, 0.9, -1), back=True, seed=0.7),
    bundle("R", [(400, 210), (335, 210), (282, 228), (248, 258)], 18, 0.55, back=True, seed=0.2),
    bundle("M4", [(540, 330), (630, 395), (685, 470), (700, 560), (690, 640)], 24, 0.85, back=True, seed=0.9),
    bundle("M2", [(480, 225), (580, 250), (668, 310), (722, 400), (738, 490), (726, 575), (742, 640)], 32, 0.7, back=True, seed=0.5),
    bundle("M1", [(470, 215), (560, 222), (650, 262), (718, 330), (756, 420), (764, 510), (748, 590), (768, 650)], 34, 0.55, back=True, seed=0.3),
    bundle("M3", [(460, 212), (570, 204), (680, 232), (770, 296), (816, 388), (826, 480), (806, 560), (780, 610)], 30, 0.4, curl=(22, 0.9, 1), back=True, seed=0.8),
    bundle("L2", [(452, 212), (540, 224), (612, 266), (655, 330)], 20, 0.3, seed=0.6),
    bundle("L1", [(440, 214), (500, 240), (548, 300), (575, 380), (575, 460), (555, 530)], 26, 0.2, seed=0.35),
    bundle("F2", [(415, 212), (385, 248), (345, 275), (318, 300)], 18, 0.12, seed=0.6),
    bundle("F1", [(425, 208), (395, 235), (350, 262), (300, 276), (250, 282)], 34, 0.05, curl=(18, 0.9, 1), seed=0.9),
    cowlick(418, 208),
    ("", "S", [(690, 236), (735, 214), (770, 222)], 4, None, 0.4),
]
Q_MARKS = [("origin", 420, 210, "O")]

FRONT = [
    bundle("R", [(500, 212), (400, 222), (322, 262), (272, 340), (255, 440), (262, 540), (282, 610)], 24, 0.6, back=True, seed=0.2),
    bundle("M2", [(555, 214), (640, 240), (705, 300), (748, 390), (764, 500), (750, 600)], 24, 0.7, back=True, seed=0.5),
    bundle("M1", [(560, 212), (660, 225), (740, 275), (790, 360), (806, 460), (792, 560), (772, 630)], 30, 0.55, curl=(20, 0.85, -1), back=True, seed=0.3),
    bundle("L2", [(545, 212), (610, 218), (665, 240), (700, 275)], 16, 0.3, seed=0.6),
    bundle("L1", [(565, 214), (635, 230), (695, 275), (730, 350), (745, 430), (745, 510)], 18, 0.2, seed=0.35),
    bundle("F2", [(528, 216), (502, 250), (468, 280), (444, 300)], 16, 0.12, seed=0.6),
    bundle("F1", [(535, 212), (515, 246), (478, 272), (428, 288), (382, 290)], 32, 0.05, curl=(18, 0.9, 1), seed=0.9),
    cowlick(535, 210),
]
FRONT_MARKS = [("origin", 535, 212, "O")]

SIDE = [
    bundle("T3", [(648, 750), (690, 790), (705, 860), (695, 905)], 16, 0.85, back=True, seed=0.1),
    bundle("T2", [(650, 735), (720, 740), (770, 800), (775, 880)], 28, 0.6, back=True, seed=0.4),
    bundle("T1", [(650, 720), (720, 680), (800, 690), (850, 750), (860, 830), (835, 890)], 40, 0.3, curl=(24, 0.9, -1), back=True, seed=0.7),
    bundle("M4", [(520, 420), (600, 480), (640, 560), (645, 640)], 22, 0.85, back=True, seed=0.9),
    bundle("M3", [(380, 226), (480, 222), (580, 250), (660, 310), (705, 400), (715, 500), (700, 580), (676, 630)], 30, 0.4, curl=(22, 0.9, 1), back=True, seed=0.8),
    bundle("M2", [(420, 232), (500, 262), (545, 320), (565, 410), (565, 500), (580, 580)], 22, 0.7, seed=0.5),
    bundle("M1", [(390, 228), (480, 236), (550, 270), (590, 330), (612, 420), (615, 520), (630, 600), (655, 645)], 28, 0.55, seed=0.3),
    bundle("L2", [(360, 230), (430, 240), (490, 268), (530, 310)], 18, 0.3, seed=0.6),
    bundle("L1", [(345, 234), (360, 280), (358, 350), (345, 430), (320, 500), (295, 545)], 24, 0.2, seed=0.35),
    bundle("F1", [(335, 234), (290, 250), (240, 285), (205, 322)], 30, 0.05, seed=0.9),
    cowlick(335, 232),
]
SIDE_MARKS = [("origin", 335, 234, "O")]

BACK = [
    bundle("N3", [(445, 250), (370, 265), (300, 320), (262, 410), (255, 510), (270, 600), (252, 650)], 30, 0.45, curl=(22, 0.9, 1), back=True, seed=0.8),
    bundle("R", [(470, 250), (560, 262), (625, 315), (655, 400), (660, 480)], 20, 0.6, back=True, seed=0.2),
    bundle("N4", [(462, 252), (520, 300), (552, 390), (560, 490), (548, 590), (565, 655)], 30, 0.75, seed=0.5),
    bundle("N2", [(448, 252), (400, 300), (360, 380), (345, 480), (352, 580), (338, 650)], 34, 0.6, seed=0.3),
    bundle("N5", [(450, 252), (420, 320), (405, 420), (412, 520), (398, 610), (414, 668)], 30, 0.65, seed=0.45),
    bundle("N6", [(458, 252), (494, 322), (512, 420), (522, 520), (514, 610), (532, 664)], 30, 0.72, seed=0.65),
    bundle("N1", [(455, 250), (450, 330), (462, 430), (476, 520), (470, 610), (488, 680)], 40, 0.7, seed=0.1),
    bundle("T3", [(525, 720), (540, 790), (530, 860)], 16, 0.85, seed=0.1),
    bundle("T2", [(530, 710), (575, 740), (600, 810), (590, 880)], 28, 0.6, seed=0.4),
    bundle("T1", [(530, 700), (560, 660), (620, 650), (660, 700), (670, 790), (645, 860)], 40, 0.3, curl=(24, 0.9, -1), seed=0.7),
    cowlick(452, 248),
]
BACK_MARKS = [("origin", 452, 250, "O")]

VIEWS = [
    (B.format("3q"), Q, Q_MARKS, out("3q"), "3/4"),
    (B.format("front"), FRONT, FRONT_MARKS, out("front"), "Face"),
    (B.format("side"), SIDE, SIDE_MARKS, out("side"), "Profil (cote gauche du perso)"),
    (B.format("back"), BACK, BACK_MARKS, out("back"), "Dos"),
]
