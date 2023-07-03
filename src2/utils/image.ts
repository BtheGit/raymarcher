export const loadImage = (path): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.src = path;
  });
};

export const hexToRGB = (hex) => {
  // Strip the leading hash;
  if (hex[0] === "#") {
    hex = hex.substr(1);
  }
  // Assume it is 6 characters;
  // TODO: Handle three character hexes.
  const total = parseInt(hex, 16);
  const r = (total >> 16) & 255;
  const g = (total >> 8) & 255;
  const b = total & 255;
  return { r, g, b };
};
