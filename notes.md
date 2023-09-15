It seems chrome mobile emulator isn't correct.
View is zoomed out nicely on chrome, but zoomed in on mobile.
careful with flex centering, it tends to shrink content.

Git problems

- lack of case sensitivity caused conflicts. fixed with `git config core.ignorecase false` and `git rm --cache src/components/diamond.astro`

Safari problems
-drop shadow gets weird glitches if the shadow is too big.
-aspect-ratio not working properly.
-svg with flex container needs width and height to be visible.

- animations leaving artifacts, as safari doesn't re-draw correctly. Fixed with outline: 1px solid transparent.
