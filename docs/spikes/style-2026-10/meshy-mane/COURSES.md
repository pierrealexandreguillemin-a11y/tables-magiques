# Chibi hair drawing and stylized hair rendering — what the courses say (2026-10-25)

User: « et recherche des cours de dessins chibi et de rendu blender ! ». Secondary sources (tutorial
sites), read on 2026-10-25; none is a measurement.

## Drawing chibi hair (fringe rules)

Sources: [drawcartoonstyle — How to Draw Chibi Hair](https://drawcartoonstyle.com/how-to-draw-chibi-hair/),
[Envato Tuts+ — How to Draw a Chibi](https://design.tutsplus.com/tutorials/how-to-draw-a-chibi--cms-30282),
[Clip Studio Tips 4953](https://tips.clip-studio.com/en-us/articles/4953), [4828](https://tips.clip-studio.com/en-us/articles/4828),
[4826](https://tips.clip-studio.com/en-us/articles/4826).

- Start from a « helmet » held off the scalp: the gap makes the hair soft and light; lots of
  volume on top (« fluffy, thick ») makes the face read smaller, hence cuter.
- Draw the **fringe first**, then build outward from the face.
- **Gaps between the fringe sections** so it does not read as one solid block.
- Locks = two curves meeting in a point; leaf-like shapes; **ends curved**, neighbouring locks
  **pointing in different directions** (one curls up, the next down).
- Keep it simple and round: few locks, no fussy detail.
- Shading: the **inner part of the hair darker**, never black — dark purple or blue; the fringe
  casts a shadow on the forehead; highlights follow the curve of the head.

## Rendering stylized hair in Blender

Sources: [3dxdev — anime hair material, the right order](https://3dxdev.com/how-to-make-anime-hair-material-in-blender-the-right-order/),
[BlenderNation — anisotropic toon hair](https://www.blendernation.com/2020/04/09/how-to-make-anisotropic-hair/),
[mclelun — modelled anime specular](http://www.mclelun.com/2015/10/rendering-anime-hair-specular.html),
[yelzkizi — stylized anime hair](https://yelzkizi.org/make-stylized-anime-hair-flow-in-blender/).
CG Cookie's « big-medium-small forms » post answered 403 to the fetch: not read.

- Hair = clumps with strong silhouettes, not strands.
- Shadows **hue-shifted** (towards blue / purple), not just darker.
- One continuous highlight band following the skull, across the clumps (custom normals from a
  sphere); thin, tight rim light.
- These are toon (EEVEE) recipes; our mascot is a Cycles vinyl figurine, so what transfers is the
  colour logic (darker, cooler inner hair; readable gaps), not the cel ramp.

## Applied to the fit6 fringe

1. Keep Meshy's own forelock whole (fit6: face cut stops below the eyes) — the « fringe first »,
   one swooping lock with a pointed tip.
2. Next if the judges ask for it: a gap / second lock beside the horn, and darker cooler colour
   in the hollows (vertex colour by occlusion), so the fringe separates from the crown.
