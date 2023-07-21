import wad from "./demo.wad.js";
import engine from "../dist/raymarcher.mjs";

document.addEventListener("DOMContentLoaded", () => {
  // Testing out to see how full screen looks. Needs optimization by a factor of 4x

  const DEFAULT_SETTINGS = {
    width: 512, // document.documentElement.clientWidth,
    height: 368, // document.documentElement.clientHeight,
    canvasId: "raymarcher-display",
  };
  const r = engine(wad, DEFAULT_SETTINGS);
});
