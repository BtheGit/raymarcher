import { 
  applyColorStopsToLinearGradient,
  toDegrees,
  hexToRGB,
} from '../utilities';
import ImageBuffer from './ImageBuffer';

const PI2 = Math.PI * 2;

const HUES = {
  1: '330',
  2: '160',
  3: '180',
  4: '200',
  5: '220',
}

const fallBackTexture_Rainbow = (function(){
  const fallBackTextureCanvas_Rainbow = document.createElement('canvas');
  fallBackTextureCanvas_Rainbow.width = 64;
  fallBackTextureCanvas_Rainbow.height = 64;
  const fallbackTexture_Rainbow = fallBackTextureCanvas_Rainbow.getContext('2d');
  for(let i = 0; i < fallBackTextureCanvas_Rainbow.width; i += 8){
    fallbackTexture_Rainbow.fillStyle = `hsl(${i * 5}, 100%, 80%)`;
    fallbackTexture_Rainbow.fillRect(i,0, 8,64);
  }
  return new ImageBuffer(fallBackTextureCanvas_Rainbow);
})()

// Do we want to return the texture name or the actual texture buffer?
const getWallCellTextureCode = (cell, wallFace) => {
  if(wallFace && typeof cell.faces === 'object' && cell.faces[wallFace] != null && typeof cell.faces[wallFace] === 'object') {
    // This is problematic, multifaceted walls only support textures if this is done like so.
    return cell.faces[wallFace].textureConfig.name;
  }
  return cell.textureConfig.name;
}

const getFaceSpecificWallConfig = (cell, wallFace) => {
  if(typeof cell !== 'object' || cell == null || cell.type !== 'wall') {
    return;
  }
  // This should be an unnecessary guard clause. A wall face should always exist for a wall
  if (wallFace == undefined){
    return;
  }

  // TODO: Once the editor is in place, I'd like faces to be a required key, which individual faces configs being optional.
  if (cell.faces != null) {
    const faceSpecificConfig = cell.faces[wallFace];
    if(typeof faceSpecificConfig === 'object' && faceSpecificConfig != null && faceSpecificConfig.hasOwnProperty('textureType') && faceSpecificConfig.hasOwnProperty('textureConfig')) {
      return faceSpecificConfig;
    }
  }
  return cell;

}

const getWallColor = (wallTextureConfig, brightness) => {
  const colorType = wallTextureConfig.colorType;
  let color;
  switch(colorType){
    case 'hex':
      const hasLeadingHash = wallTextureConfig.color[0] === '#';
      color = hasLeadingHash ? wallTextureConfig.color : '#' + wallTextureConfig.color;
      break;
    case 'hsl':
      const defaultHSL = {
        h: 25,
        s: 100,
        l: brightness,
      }
      const mergedHSL = { ...defaultHSL, ...wallTextureConfig.color }
      color = `hsl(${ mergedHSL.h }, ${ mergedHSL.s }%, ${ mergedHSL.l }%)`;
      break;
    case 'rgb':
      // I'm not sure I really want to support HSL. Might be better to always convert it in the editor.
    default:
      color = 'cornflowerblue';
      break;
  }
  return color;
}


const VALID_TEXTURE_TYPES = ['image', 'color', 'gradient'];
const VALID_COLOR_TYPES = ['hsl', 'rgb', 'hex'];
const validateWallTextureConfig = (textureType, textureConfig) => {
  if(!textureType || VALID_TEXTURE_TYPES.indexOf(textureType) === -1){
    return false;
  }
  if(textureType === 'color'){
    const hasColor = textureConfig.hasOwnProperty('colorType') && VALID_COLOR_TYPES.indexOf(textureConfig.colorType) > -1;
    if(hasColor){
      // TODO: Validate color.
      const hasValidColor = true;
      if(hasValidColor){
        return true;
      }
    }
  }
  else if(textureType === 'image'){
    // We need to make sure all the valid config elements are available.
    // Primarily whether the specified image exists.
    // For now, we have a problem because the image texture buffers are not being kept as keys in a store/hash for reference/retrieval
    // We have to refactor out the array before we continue.
    return true;
  }
  else if(textureType === 'gradient'){
    // TODO:
  }
  return false;
}

/**
 * 
 * @param {string} id The DOM id of the canvas element this screen instance wraps.
 */
class Screen {
  constructor(game, mainScreenCanvasId, width, height){
    this.canvas = document.getElementById(mainScreenCanvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvasBuffer = document.createElement('canvas');
    this.ctxBuffer = this.canvasBuffer.getContext('2d');
    this.floorBuffer = document.createElement('canvas');
    this.floorCtxBuffer = this.floorBuffer.getContext('2d');
    this.canvas.width = this.canvasBuffer.width = this.width = width;
    this.canvas.height = this.canvasBuffer.height = this.height = height;
    this.offscreenCanvasPixels;
    this.backgroundColor = 'black';
    this.game = game;
    this.currentMap = this.game.currentMap;
    this.currentMapGrid = this.game.grid;
    // We delay creating the background until after the main canvas size is determined.
    // TODO: We could also generate this only as needed, if it seems like it adds too much memory.
    this.staticPOVBackgroundCanvasBuffer = document.createElement('canvas');
    this.staticPOVBackgroundCtxBuffer = this.staticPOVBackgroundCanvasBuffer.getContext('2d');
    // Use this for a singleton pattern to avoid redrawing the sky gradient on each frame.
    this.hasDrawnSkyGradient = false;
    // Just to make sure the canvas is reset before beginning.
    // When this is true, draw minimap overlay.
    // TODO: Can have all conditional render options set as single object with getters/setters later. (HUD, etc)
    this.isMapActive = false;

    // Create constants to speed up the casting
    this.CENTER_Y = this.height / 2;
    // Create lookup tables to speed up the casting.
    this.lookupCurrentDist = this.generateCurrentDistLookupTable();
    this.lookupFloorBrightnessModifier = this.generateFloorBrightnessModifierLookupTable();
  }

  generateSkyGradient(stops){
    this.hasDrawnSkyGradient = true;
    const gradient = this.staticPOVBackgroundCtxBuffer.createLinearGradient(0,0,0, this.height / 2);
    applyColorStopsToLinearGradient(gradient, stops);
    this.staticPOVBackgroundCtxBuffer.fillStyle = gradient;
    this.staticPOVBackgroundCtxBuffer.fillRect(0, 0, this.width, this.height / 2);
  }

  generateCurrentDistLookupTable(){
    const table = {};
    for(let i = this.CENTER_Y; i < this.height; i++){
      table[i] = this.height / (2.0 * i - this.height)
    }
    return table;
  }

  generateFloorBrightnessModifierLookupTable(){
    const table = {};
    // Since we know dead center of the screen is the darkest possible and we want a fall off, we can use 
    // an inverse square law.
    // Let's say that the maximum drop off is 50% brightness. That means brightness is 1 / dist.
    for(let i = this.CENTER_Y; i < this.height; i++){
      const distanceFromPlayer = ((this.height - i) / this.CENTER_Y) * 1.1;
      const brightnessModifier = 1 / Math.pow(2, distanceFromPlayer);
      table[i] = brightnessModifier;
    }
    return table;
  }

  initializeOffscreenCanvasPixels(){
    if(!this.offscreenCanvasPixels){
      this.floorBuffer.width = this.width;
      this.floorBuffer.height = this.height;
      this.offscreenCanvasPixels = this.floorCtxBuffer.getImageData(0,0,this.width, this.height);
    }
  }
  
  updateFromBuffer(){
    this.ctx.drawImage(this.canvasBuffer, 0,0);
  }

  // ### Getters/Setters

  showMap(){
    this.isMapActive = true;
  }

  hideMap(){
    this.isMapActive = false;
  }

  toggleMap(){
    this.isMapActive = !this.isMapActive;
  }

  // ### Display Helpers

  resizeCanvas(width, height) {
    this.canvas.width = this.canvasBuffer.width = this.width = width;
    this.canvas.height = this.canvasBuffer.height = this.height = height;
  }

  setBackgroundColor(color) {
    this.backgroundColor = color;
  }

  // ### Main draw functions

  drawMapOverlay(){
    // TODO: Lots of hardcoded stuff to make dynamic.
    const emptyCellColor = 'rgba(5,5,5,0.7)';
    // TODO: For simplicity's sake, we'll hard code the placement and size of the minimap for now at the top left.
    // Probably would be nicer as a full screen overlay with transparency;
    const mapLeft = 0;
    const mapTop = 0;
    const mapWidth = 200;
    const mapHeight = 200;
    const mapXRatio = mapWidth / this.game.grid.width;
    const mapYRatio = mapHeight / this.game.grid.height;
    // Get player position and direction
    const playerPos = this.game.player.pos;
    const playerDir = this.game.player.dir;
    const playerSize = 3;
    // Get current world map.
    // This will be a class with useful methods... later
    const world = this.game.grid;
    const mapGrid = world.grid;
    const GRID_UNIT = 1;
    const mapWidthUnit = mapXRatio * GRID_UNIT;
    const mapHeightUnit = mapYRatio * GRID_UNIT;

    // Render grid lines
    for (let i = 0; i <= world.width; i++){
      // VERTICAL
      this.ctxBuffer.beginPath();
      this.ctxBuffer.lineWidth = 1;
      this.ctxBuffer.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctxBuffer.moveTo(0 + (i * mapWidthUnit), 0);
      this.ctxBuffer.lineTo(0 + (i * mapWidthUnit), mapHeight);
      this.ctxBuffer.closePath();
      this.ctxBuffer.stroke();
    }
    
    for(let i = 0; i < world.height; i++){
      // HORIZONTAL
      this.ctxBuffer.beginPath();
      this.ctxBuffer.lineWidth = 1;
      this.ctxBuffer.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctxBuffer.moveTo(0, 0 + (i * mapHeightUnit));
      this.ctxBuffer.lineTo(mapWidth, 0 + (i * mapHeightUnit));
      this.ctxBuffer.closePath();
      this.ctxBuffer.stroke();
    }

    // TODO: Fix the mirrored orientation issues!!!
    // Render grid elements, scaled.
    for(let rowOffset = 0; rowOffset < mapGrid.length; rowOffset++){
      const row = mapGrid[rowOffset];
      for(let columnOffset = 0; columnOffset < row.length; columnOffset++){
        const reversedRowOffset = mapGrid.length - 1 - rowOffset;
        const reversedColumnOffset = row.length - 1 - columnOffset;
        const cell = world.getCell(rowOffset, columnOffset);
        const textureId = cell; // In the future the cell will have more data so this will require extracing the data
        const cellHue = HUES[textureId];
        const cellTexture = this.game.images[cell - 1] && this.game.images[cell - 1].getCanvas();
        const cellLeft = rowOffset * mapWidthUnit;
        const cellTop = columnOffset * mapHeightUnit;
        if (cellTexture){
          this.ctxBuffer.drawImage(cellTexture, 0, 0, cellTexture.width, cellTexture.height, cellLeft, cellTop, mapWidthUnit, mapHeightUnit);
        }
        else {
          this.ctxBuffer.beginPath();
          this.ctxBuffer.fillStyle = cellHue ? `hsla(${cellHue}, 100%, 80%, .9)` : emptyCellColor;
          this.ctxBuffer.fillRect(cellLeft, cellTop, mapWidthUnit, mapHeightUnit);
          this.ctxBuffer.closePath();
        }
      } 
    }

    // Render player dot
    const playerPosXOnMap = playerPos.x * mapXRatio;
    const playerPosYOnMap = playerPos.y * mapYRatio;
    this.ctxBuffer.beginPath();
    this.ctxBuffer.fillStyle = 'red';
    this.ctxBuffer.arc(playerPosXOnMap, playerPosYOnMap, playerSize, 0, PI2);
    this.ctxBuffer.fill();
  }

  /**
   * Since all levels will have at least a default floor texture we only
   * need to concern ourselves with the sky/upper half.
   * 
   * We want to allow for several levels of fallbacks when it comes to the sky.
   * 
   * If a level has a sky texture, use that.
   * Else if a level has a gradient use that.
   * Else use a hardcoded default color (or in the future a generated one based on the default floor texture (a darker color perhaps)).
   */
  drawPOVBackground(){
    const backgroundImageTextureKey = this.game.currentMap.skyTexture;
    const backgroundImage = this.game.textureMap[backgroundImageTextureKey];
    if(backgroundImage){
      // We need to have an origin for the image
      // We need to find the offset from that origin in the FOV and then sample 1/6 of the image
      // from that point then draw it to the background.
      const { x, y } = this.game.player.dir;
      const angle = Math.atan2(x, y);
      let degrees = angle > 0 ? toDegrees(angle) : 360 + toDegrees(angle);
      // degrees = degrees - 30 >= 0 ? degrees - 30 : 360 + degrees - 30;
      const sampleWidth = backgroundImage.width / 6;// 1/3 of image because FOV / 180
      const currentSampleStart = (degrees / 360) * backgroundImage.width;
      const willOverflow = (backgroundImage.width - currentSampleStart) < sampleWidth;
      if(willOverflow){
        const overflowWidth = (currentSampleStart + sampleWidth) - backgroundImage.width;
        const nonOverflowWidth = sampleWidth - overflowWidth;
        const overflowRatio = nonOverflowWidth / sampleWidth;
        const seamPoint = overflowRatio * this.width;
        // We need to get the two pieces separately and stitch them together on a new canvas.
        // In the case where we are too close to the edges, we need to sample the overflow from the head or tail
        // to create the seam.
        this.ctxBuffer.drawImage(backgroundImage.canvas, currentSampleStart, 0, nonOverflowWidth, backgroundImage.height, 0, 0, seamPoint, this.height)
        this.ctxBuffer.drawImage(backgroundImage.canvas, 0, 0, overflowWidth, backgroundImage.height, seamPoint, 0, this.width - seamPoint, this.height)
      }
      else {
        this.ctxBuffer.drawImage(backgroundImage.canvas, currentSampleStart, 0, sampleWidth, backgroundImage.height, 0, 0, this.width, this.height)
      }
    }
    else {
      const skyGradientGradientStops = this.game.currentMap.skyGradient;
      const fallbackGradientStops = [{ stop: 0, color: '#6190E8'}, { stop: 1, color: '#A7BFE8'}];
      const stops = skyGradientGradientStops && skyGradientGradientStops.length > 0 
                      ? skyGradientGradientStops 
                      : fallbackGradientStops;
      if(!this.hasDrawnSkyGradient){
        this.generateSkyGradient(stops);
      }
      this.ctxBuffer.drawImage(this.staticPOVBackgroundCanvasBuffer, 0, 0, this.width, this.height / 2);
    }
  }

  drawPlayerPOV(){
    const { rays, elevation: playerElevation } = this.game.player;
    // We'll need to record the perpendicular distance of each column for sprite clipping later.
    const zBuffer = [];

    if(!rays){
      return;
    }
    for(let i = 0; i < rays.length; i++){
      const ray = rays[i];
      // TODO: Make ray class to abstract and use getters.
      const { normalizedDistance, wall, wallOrientation, wallIntersection, rayDir, activeCell, wallFace } = ray;

      zBuffer.push(normalizedDistance);

      const columnHeight = Math.ceil(this.height / normalizedDistance);
      const top = (this.height / 2) - (columnHeight / 2) * playerElevation;
      const VIEW_DISTANCE = 25;
      const brightnessMultiplier = 1.3;
      const darknessMultiplier = 0.9;
      const brightness = (((VIEW_DISTANCE - (normalizedDistance * brightnessMultiplier)) / VIEW_DISTANCE) * 40) + 10; // clamps the brightness between 10 and 50.
      
      // #### BEGIN WALL RENDERING #####

      // Determine textureType. 
      // First, check to see if a face specific setting exists.
      const wallConfig = getFaceSpecificWallConfig(wall, wallFace);
      
      // Render the specified textureType using the textureConfig object.
      const wallTextureType = wallConfig.textureType;
      const wallTextureConfig = wallConfig.textureConfig;
      const isValidTextureConfig = validateWallTextureConfig(wallTextureType, wallTextureConfig);

      // At this point we won't validate the config any further. That should be handled adequately by the validator. If it wasn't invalid, the wall
      // should be rendered with the fallback color.
      if(isValidTextureConfig){
        // If it's a color, it's a completely different thing. We can just draw a rect for the texture strip. 
        // TODO: We should combine this with the fallback color drawing later if possible.
        if(wallTextureType === 'color'){
          const color = getWallColor(wallTextureConfig, brightness);
          // We support hex, hsl, and someday rgb (not rgba).
          this.ctxBuffer.fillStyle = color;
          this.ctxBuffer.beginPath();
          this.ctxBuffer.fillRect(i,top, 1, columnHeight);
          this.ctxBuffer.closePath();
        }
        // If it's an image or a gradient we will need a canvas to work from (gradients shouldn't be created on each pass, but cached).
        else {
          // TODO: Support gradients.

          // #### RENDER 'image' texture type ####
          // If a texture doesn't exist, use a fallback color 
          // (We could reuse the default texture but then it would be harder to spot missing textures)
          const wallTextureCode = getWallCellTextureCode(wall, wallFace);
          const wallTextureImageBuffer = wallTextureCode === 'default' ? fallBackTexture_Rainbow : this.game.textureMap[wallTextureCode];
          if(wallTextureImageBuffer instanceof ImageBuffer) {
            const wallTexture = wallTextureImageBuffer.getCanvas();
            const textureWidth = wallTexture.width;
            let wallIntersectionOffset;
            if(wallOrientation === 1){
              if(this.game.player.dir.y > 0){
                wallIntersectionOffset = wallIntersection - Math.floor(wallIntersection);
              }
              else {
                wallIntersectionOffset = 1 - (wallIntersection - Math.floor(wallIntersection));
              }
            }
            else {
              if(this.game.player.dir.x < 0){
                wallIntersectionOffset = wallIntersection - Math.floor(wallIntersection);
              }
              else {
                wallIntersectionOffset = 1 - (wallIntersection - Math.floor(wallIntersection));
              }
            }
            let textureStripLeft = Math.floor(wallIntersectionOffset * textureWidth);
            this.ctxBuffer.drawImage(wallTexture, textureStripLeft, 0, 1, wallTexture.height, i, top, 1, columnHeight);


            // TODO: Change this to color shift the pixels directly instead of messing with a semi-opaque overlay.
            this.ctxBuffer.fillStyle = 'black';
            this.ctxBuffer.globalAlpha = 1 - (VIEW_DISTANCE - (normalizedDistance * darknessMultiplier)) / VIEW_DISTANCE;
            this.ctxBuffer.fillRect(i, top, 1, columnHeight);
            this.ctxBuffer.globalAlpha = 1;
            
            // UNFINISHED: VARIABLE HEIGHT WALLS
            // TODO: HANDLE HEIGHTS IN MULTIPLES OF ONE (FOR NOW)
            // Hardcoding a height of two temporarily.
            // if (typeof wall === 'object' && wall.height > 1) {
            //   // This doesn't really work because it only renders correctly face on. 
            //   // Getting this to work would require keeping the DDA algorithm going past initial intersections with walls and then using a zBuffer of sorts to
            //   // draw with a painters algorithm. I'm starting to rethink the utility of that.
            //   this.ctxBuffer.drawImage(wallTexture, textureStripLeft, 0, 1, wallTexture.height, i, top - columnHeight, 1, columnHeight);
            // }
          }
          else {
            // Valid texture not available. Use warning color.
            this.ctxBuffer.fillStyle = 'orangered';
            this.ctxBuffer.beginPath();
            this.ctxBuffer.fillRect(i,top, 1, columnHeight);
            this.ctxBuffer.closePath();
          }
        }
      }
      else {
        const wallHue = 0; // Anything without a fallback hue will be crazy red and obvious.
        const hsl = `hsl(${ wallHue }, 100%, ${ brightness }%)`;
        this.ctxBuffer.fillStyle = hsl;
        this.ctxBuffer.beginPath();
        this.ctxBuffer.fillRect(i,top, 1, columnHeight);
        this.ctxBuffer.closePath();
      }

      // This creates artificial shading on half the vertices to give them extra three dimensional feel.
      if(wallOrientation === 1){
        this.ctxBuffer.globalAlpha = .2;
        this.ctxBuffer.fillStyle = 'black';
        this.ctxBuffer.fillRect(i, top, 1, columnHeight);
        this.ctxBuffer.globalAlpha = 1;
      }
      // #### END WALL RENDERING ####

      // #### BEGIN FLOOR CASTING

      let floorXWall;
      let floorYWall;
      //4 different wall directions possible
      if(wallOrientation === 0 && rayDir.x > 0) {
        floorXWall = activeCell.x;
        floorYWall = activeCell.y + wallIntersection;
      }
      else if(wallOrientation === 0 && rayDir.x < 0) {
        floorXWall = activeCell.x + 1.0;
        floorYWall = activeCell.y + wallIntersection;
      }
      else if(wallOrientation === 1 && rayDir.y > 0) {
        floorXWall = activeCell.x + wallIntersection;
        floorYWall = activeCell.y;
      }
      else {
        floorXWall = activeCell.x + wallIntersection;
        floorYWall = activeCell.y + 1.0;
      }

      // draw the floor from columnBottom to the bottom of the screen
      const columnBottom = Math.floor(top + columnHeight) >= 0 ? Math.floor(top + columnHeight) : this.height;
      const floorColumnHeight = this.height - columnBottom;

      if(floorColumnHeight > 0){
        for(let y = columnBottom; y < this.height; y++){
          const x = i;
          const currentDist = this.lookupCurrentDist[y];
          const weight = currentDist / normalizedDistance;

          
          const currentFloorX = weight * floorXWall + (1.0 - weight) * this.game.player.pos.x;
          const currentFloorY = weight * floorYWall + (1.0 - weight) * this.game.player.pos.y;

          const gridCell = this.currentMapGrid.getCell(Math.floor(currentFloorX), Math.floor(currentFloorY));
          // TODO: DEBUG ASAP! Was this error always here or is there something missing in the defaults?
          if(gridCell !== null && gridCell !== undefined){

            
            // Let's dim the floor
            // TODO: Better dropoff curve.
            const brightnessModifier = this.lookupFloorBrightnessModifier[y];

            if(gridCell.textureType === 'color') {
              // TODO: This is going to be a bit of a slow down. We should require floors to be hex?
              const color = getWallColor(gridCell.textureConfig, brightness);

              // TODO: Here is a big breaking assumption. ALL floor colors are hex!
              const { r, g, b } = hexToRGB(color);

              const index = (y * this.width + x) * 4;
              this.offscreenCanvasPixels.data[index] = r * brightnessModifier;
              this.offscreenCanvasPixels.data[index + 1] = g * brightnessModifier;
              this.offscreenCanvasPixels.data[index + 2] = b * brightnessModifier;
              this.offscreenCanvasPixels.data[index + 3] = 255;
            }
            else {
              // TODO: Handle gradients. This will fail on gradients.
              const floorTextureName = gridCell.textureConfig.name;
              let floorTexture = this.game.textureMap[floorTextureName];
              
              // TODO: Temp, to have a floor while textures are missing
              if(floorTexture == null){
                floorTexture = fallBackTexture_Rainbow;
              }

              // ### DRAW FLOOR
              if (floorTexture != null){
                const floorTexturePixels = floorTexture.getImageData();
      
                const floorTexX = Math.floor(currentFloorX * floorTexture.width) % floorTexture.width;
                const floorTexY = Math.floor(currentFloorY * floorTexture.height) % floorTexture.height;
                const textureIndex = (floorTexY * floorTexture.width + floorTexX) * 4;
            
                const red = floorTexturePixels.data[textureIndex] * brightnessModifier;
                const green = floorTexturePixels.data[textureIndex + 1] * brightnessModifier;
                const blue = floorTexturePixels.data[textureIndex + 2] * brightnessModifier;
                const alpha = floorTexturePixels.data[textureIndex + 3];
      
                const index = (y * this.width + x) * 4;
                this.offscreenCanvasPixels.data[index] = red;
                this.offscreenCanvasPixels.data[index + 1] = green;
                this.offscreenCanvasPixels.data[index + 2] = blue;
                this.offscreenCanvasPixels.data[index + 3] = alpha;
              }
            }
            
            // ### DRAW CEILING

            // TODO: Add config bool to specify ceiling. Have fallback color when no ceiling config exists?
            
            // For now, just check if ceilingConfig exists and assume it is valid.
            const hasCeiling = gridCell.hasOwnProperty('ceilingConfig') && gridCell.ceilingConfig != null;
            if(hasCeiling){
              // Let's dim the ceiling more than the floor.
              // TODO: Better dropoff curve.
              const ceilingBrightnessModifier = brightnessModifier - .2;
  
              const { ceilingConfig } = gridCell;
  
              if(ceilingConfig.textureType === 'color') {
                // TODO: This is going to be a bit of a slow down. We should require floors to be hex?
                const ceilingColor = getWallColor(ceilingConfig.textureConfig, brightness);
                // TODO: Here is a big breaking assumption. ALL floor colors are hex!
                const { r, g, b } = hexToRGB(ceilingColor);
  
                const index = ((this.height - y) * this.width + x) * 4;
                this.offscreenCanvasPixels.data[index] = r * ceilingBrightnessModifier;
                this.offscreenCanvasPixels.data[index + 1] = g * ceilingBrightnessModifier;
                this.offscreenCanvasPixels.data[index + 2] = b * ceilingBrightnessModifier;
                this.offscreenCanvasPixels.data[index + 3] = 255;              
              }
              else {
                // TODO: Handle gradients.
                const ceilingTextureName = ceilingConfig.textureConfig.name;
                let ceilingTexture = this.game.textureMap[ceilingTextureName];
      
                // TODO: Temp, to have a ceiling
                if(ceilingTexture == null) {
                  ceilingTexture = fallBackTexture_Rainbow;
                }
      
                if (ceilingTexture != null) {
                  const ceilingTexturePixels = ceilingTexture.getImageData();
      
                  const ceilTexX = Math.floor(currentFloorX * ceilingTexture.width) % ceilingTexture.width;
                  const ceilTexY = Math.floor((this.height - currentFloorY) * ceilingTexture.height) % ceilingTexture.height;
                  const textureIndex = (ceilTexY * ceilingTexture.width + ceilTexX) * 4;
        
                  const red = ceilingTexturePixels.data[textureIndex] * ceilingBrightnessModifier;
                  const green = ceilingTexturePixels.data[textureIndex + 1] * ceilingBrightnessModifier;
                  const blue = ceilingTexturePixels.data[textureIndex + 2] * ceilingBrightnessModifier;
                  const alpha = ceilingTexturePixels.data[textureIndex + 3];
        
                  const index = ((this.height - y) * this.width + x) * 4;
                  this.offscreenCanvasPixels.data[index] = red;
                  this.offscreenCanvasPixels.data[index + 1] = green;
                  this.offscreenCanvasPixels.data[index + 2] = blue;
                  this.offscreenCanvasPixels.data[index + 3] = alpha;
                }
              }
            }
          }        
        }
      }
    }
    // Because of the mix of direct pixel manipulation and drawImage calls, we have dangling bits of render
    // code like this for the nonce.
    this.floorCtxBuffer.putImageData(this.offscreenCanvasPixels, 0, 0);
    this.ctxBuffer.drawImage(this.floorBuffer,0,0);
    this.floorCtxBuffer.clearRect(0,0, this.floorBuffer.width, this.floorBuffer.height)
    this.offscreenCanvasPixels = this.floorCtxBuffer.getImageData(0,0,this.width, this.height);

    // #### SPRITE RENDERING
    // We'll also need to sort out the sizing of textures. I'm inclined to say they should all be the same height but variable widths.
    const sprites = this.game.sprites;

    // TODO: In the future we could have a visible property to allow us to persist objects in the world that
    // might be temporarily hidden.
    if(sprites.length > 0){

      // Sort sprites by dumb distance (not normalized).
      const sortedSprites = sprites.sort((sprite1, sprite2) => {
        const sprite1distance = Math.pow(this.game.player.pos.x - sprite1.pos.x, 2) + Math.pow(this.game.player.pos.y - sprite1.pos.y, 2);
        const sprite2distance = Math.pow(this.game.player.pos.x - sprite2.pos.x, 2) + Math.pow(this.game.player.pos.y - sprite2.pos.y, 2);
        return sprite2distance - sprite1distance;
      })

      for(let i = 0; i < sortedSprites.length; i++){
        const currentSprite = sortedSprites[i];
        if(currentSprite){
          const spriteX = currentSprite.pos.x;
          const spriteY = currentSprite.pos.y;
          const spriteX_relativeToPlayer = spriteX - this.game.player.pos.x;
          const spriteY_relativeToPlayer = spriteY - this.game.player.pos.y;
          
          const transformX = this.game.player.inverseDeterminate * (this.game.player.dir.x * spriteY_relativeToPlayer - this.game.player.dir.y * spriteX_relativeToPlayer);
          // This provides the depth on screen, much like a z-index in a 3d system.
          // Depth will of course we used to determine size, height, vertical offset, and wall clipping.
          // NOTE TO SELF: The Math.max is used to clamp to zero. For some reason, planck-length level numbers were being created
          // at a very specific location which caused the program to hang as it looped through insane ranges.
          const transformY = Math.max(this.game.player.inverseDeterminate * (-this.game.player.plane.y * spriteX_relativeToPlayer + this.game.player.plane.x * spriteY_relativeToPlayer), 0);
          
          const spriteScreenX = Math.floor((this.width / 2) * (1 + transformX / transformY));
          // using "transformY" instead of the real distance prevents fisheye
          const scale = currentSprite.scale;
          const spriteHeight = Math.abs(Math.floor(this.height / transformY) * scale);
          
          // calculate lowest and highest pixel to fill in current stripe
          const drawStartY = Math.floor((-spriteHeight * currentSprite.verticalOffset) / 2 + this.height / 2);
          const drawEndY = spriteHeight + drawStartY;
          
          //calculate width of the sprite
          // The width ratio ensures the sprite is not stretched horizontally.
          const widthRatio = (currentSprite.width / currentSprite.height) * scale;
          const spriteWidth = Math.abs(Math.floor((this.height / transformY * widthRatio )));
          const drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
          const drawEndX = spriteWidth / 2 + spriteScreenX;
          
          // Draw sprite in vertical strips.
          for(let stripe = drawStartX; stripe < drawEndX; stripe++){
            const texX = Math.floor(256 * (stripe - (-spriteWidth / 2 + spriteScreenX)) * currentSprite.width / spriteWidth) / 256;
            //the conditions in the if are:
            //1) it's in front of camera plane so you don't see things behind you
            //2) it's on the screen (left)
            //3) it's on the screen (right) 
            //4) ZBuffer, with perpendicular distance
            if(transformY > 0 && stripe > 0 && stripe < this.width && transformY < zBuffer[stripe]) {
              // TODO: When sprites are multifaceted, we'll need to pass in player pos/dir to calculate the face;
              this.ctxBuffer.drawImage(currentSprite.getFrame(), texX, 0, 1, currentSprite.height, stripe, drawStartY, 1, drawEndY - drawStartY);
            }
          }
        }
      }
    }
  }

  draw() {
    // We don't bother with a clrScreen function because, between the sky, floor textures, and walls, it's moot.
    this.drawPOVBackground();
    this.initializeOffscreenCanvasPixels();
    this.drawPlayerPOV();
    if(this.isMapActive){
      this.drawMapOverlay();
    }
    this.updateFromBuffer();
  }
}

export default Screen;