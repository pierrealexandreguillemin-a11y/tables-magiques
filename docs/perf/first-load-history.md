# First-load JS history

Gzipped JS per route, measured on a local production build (Chromium, cold cache).

- `loadKB` — scripts finished before the `load` event (critical path).
- `idleKB` — every script once the network is idle (includes deliberate post-render preloads).
- `total` — sum of every emitted chunk, `bash scripts/check-bundle-size.sh` (gate, threshold 560 KB).

Reproduce: `npm run build && npm run quality:first-load` (the script starts and stops its own
`next start`; a stale server cannot answer with an older build) and `npm run quality:bundle-size`.
Duplicated modules across chunks: `node` script in the 2026-10-17 entry below.

| Date       | Change                                          | `/` load / idle | `/practice` | `/challenge` | `/profile` | `/settings` | total |
| ---------- | ----------------------------------------------- | --------------- | ----------- | ------------ | ---------- | ----------- | ----- |
| 2026-10-17 | baseline (`d800217`, Next 16.4.2, React 19.3.1) | 432 / 467       | 431 / 453   | 431 / 453    | 432 / 467  | 416 / 446   | 524   |
| 2026-10-17 | direct imports, barrels removed                 | 288 / 459       | 370 / 431   | 370 / 429    | 288 / 459  | 218 / 305   | 547   |

## 2026-10-17 — why the barrels cost 144 KB on the home page

`components/effects/index.ts` and `lib/animations/index.ts` re-exported every effect, including
Lottie (~115 KB gz chunk), tsParticles (~38 KB) and react-kawaii. Without a `sideEffects`
declaration the bundler cannot prove that unused re-exports are side-effect free, so importing
one name from a barrel shipped all of them before `load`.

Two fixes were measured:

| Fix                                        | `/` load | `/` idle | total          | duplicated modules |
| ------------------------------------------ | -------- | -------- | -------------- | ------------------ |
| none (baseline)                            | 432      | 467      | 524            | 24 / 392           |
| `"sideEffects": ["*.css"]` in package.json | 285      | 481      | 569 (gate red) | 65 / 371           |
| direct imports, barrels deleted (kept)     | 288      | 459      | 547            | 55 / 386           |

The direct-import fix was kept: same critical-path gain, lower idle on every route, gate green.
The total grows because Turbopack now splits per route and copies small shared modules into
several chunks; a single visit never downloads those copies twice, which `idleKB` shows.

Visual proof of a HOW-only change: `npm run test:e2e:local:update` on the new build, then the
pre-change sources rebuilt and `npm run test:e2e:local` → 7/7 screenshots match
(`maxDiffPixelRatio: 0.01`, the threshold of `tests/e2e/visual-regression.spec.ts`).

Duplicated-module count (Turbopack chunk format, module id followed by a factory):

```bash
node -e "const fs=require('fs');const d='.next/static/chunks';const seen=new Map();for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(d+'/'+f,'utf8');const re=/[,\[](\d{2,7}),(?=\(?[\w\$,]*\)?=>|function)/g;let m;while((m=re.exec(s))){if(!seen.has(m[1]))seen.set(m[1],new Set());seen.get(m[1]).add(f)}}console.log('modules',seen.size,'duplicated',[...seen.values()].filter(s=>s.size>1).length)"
```
