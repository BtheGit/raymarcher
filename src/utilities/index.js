// # Helper functions

// const toRadians = degrees => degrees * (Math.PI / 180);
// const vectorDistance = (vector1, vector2) => Math.sqrt((vector1.x - vector2.x) ** 2 + (vector1.y - vector2.y) ** 2);
// const random = (upper = 100, lower = 0) => Math.max(Math.floor(Math.random() * (upper + 1)), lower);
// const clamp = (number, min, max) => Math.max(min, Math.min(number, max));
// const getMovementDelta = ({angle, forward = true, speed = .5 }) => {
//   const rads = toRadians(angle);
//   const xDelta = Math.cos(rads) * speed;
//   const yDelta = Math.sin(rads) * speed;
//   const x = forward ? xDelta : -xDelta;
//   const y = forward ? yDelta : -yDelta;
//   return { x, y };
// }
// const scaleToScreen = (vector, screen) => {
//   const scaleX = screen.width / MAP_WIDTH;
//   const scaleY = screen.height / MAP_HEIGHT;
//   const scaledX = vector.x * scaleX;
//   const scaledY = vector.y * scaleY;
//   return { x: scaledX, y: scaledY };
// }
export const toDegrees = radians => radians / (Math.PI/ 180);
export const loadImage = path => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      resolve(img);
    })
    img.src = path;
  })
}
export const applyColorStopsToLinearGradient = (linearGradient, stops) => {
  for(let i = 0; i < stops.length; i++){
    linearGradient.addColorStop(stops[i].stop, stops[i].color)
  }
}

export const loadStateFromSessionStorage = storageId => {
  try {
      const serializedState = sessionStorage.getItem(storageId);
      if(serializedState === null) {
          return undefined;
      }
      const state = JSON.parse(serializedState);
      // Clear sessionStorage so that refreshes restart a level
      sessionStorage.removeItem(storageId);
      return state;
  }
  catch(err) {
      return undefined;
  }
}

export const saveStatetoSessionStorage = (storageId, currentState) => {
  try {
      const serializedState = JSON.stringify(currentState);
      sessionStorage.setItem(storageId, serializedState)
  }
  catch(err) {
      console.log(err);
  }
}

export const colorValueToHex = value => ("0" + Number(value).toString(16)).substr(-2);

export const rgbToHex = (r,g,b) => colorValueToHex(r) + colorValueToHex(g) + colorValueToHex(b);

export const hexToRGB = (hex) => {
  // Strip the leading hash;
  if (hex[0] === '#') {
    hex = hex.substr(1);
  }
  // Assume it is 6 characters;
  // TODO: Handle three character hexes.
  const total = parseInt(hex, 16);
  const r = (total >> 16) & 255;
  const g = (total >> 8) & 255;
  const b = total & 255;
  return { r, g, b };
}