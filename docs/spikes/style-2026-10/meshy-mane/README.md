# Meshy mane fitted on the A6 unicorn (2026-10-25)

User: « pourquoi tu ne fais pas ça inline avec blender ou meshy ». Generated in the user's Meshy
workspace (Pro, 20 credits, kept there: task `01a173f7-a64c-712e-80e6-b4985f3ebca6`, Meshy 6,
text-to-3D, licence « Privé »). Downloaded as GLB (15 256 760 bytes) to
`C:/Users/pierr/Downloads/Meshy_AI_Hair_only_no_head_n_1025170709_generate.glb` — not committed
(size); the Meshy workspace keeps the original.

Prompt: « Hair only, no head, no body: a stylized cute unicorn pony mane hairpiece sized for a big
round chibi head. A thick crest of hair rising behind the horn position, puffed crown with layers
lifting off, a soft forelock falling to one side, then many flowing locks sweeping back and down
the neck to shoulder length. Hundreds of real hair strands grouped into 20 clear locks, tapered
wispy tips each with its own direction, a few flyaway strands, full mass with no gaps. Pastel
gradient: pink at the roots, lilac in the middle, light sky blue at the tips. Soft glossy cartoon
hair. »

Result: Meshy ignored « hair only » and made a whole horse-like unicorn head with sculpted locks
(one shell, 423 773 vertices, 847 558 faces, no material). `fit_mane.py` keeps the mane (method in
its docstring). Not judged yet.

| Fit  | Change                                   | Seen (by me, not a judge)                                         |
| ---- | ---------------------------------------- | ----------------------------------------------------------------- |
| fit1 | scale 1.35, face cone + sphere cuts      | real layered mane; too long (past the chest); pink spikes at horn |
| fit2 | scale 1.45, hanging locks squashed ×0.72 | chibi length; sphere cuts tore locks around the horn (« petals ») |
| fit3 | capsule cuts                             | capsules misplaced: Meshy horn and cat-like ears left             |
| fit4 | capsules re-measured on grid views       | horn gone; ears cut leave dark hollows and pink stubs by our ears |

Replay: `"$B" -b --python fit_mane.py -- <glb> <out> --res 512 --spp 32` (~80 s).
