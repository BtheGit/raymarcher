import wad from "./demo.wad.js";
import engine from "../dist/raymarcher.mjs";

document.addEventListener("DOMContentLoaded", () => {
  // Testing out to see how full screen looks.

  const DEFAULT_SETTINGS = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    canvasId: "raymarcher-display",
    tileSize: 256, // TODO: Make this defined in the WAD (since the wad will define world objects relative to this... or, just use this forever since this is a toy project after all. :) )
  };
  const r = engine(wad, DEFAULT_SETTINGS);
});
