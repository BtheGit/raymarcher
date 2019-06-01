[Live Demo](https://bthegit.github.io/raymarcher/): WASD to move

# Raymarcher Test

This is just a bit of faffing about with making a basic raymarcher in HTML5 canvas. 

### Feature checkpoints

In the interests of making lists that never get completed, here are some potential milestones:

- [x] Make a basic raymarcher in 2d:
  - Have a point, FOV, walls
  - Be able to move the point
  - Be able to rotate the point
  - Have a second display in first person perspective (split screen)
  - Have an animation loop for drawing at reasonable intervals
  - Have falloff lighting
  - Have walls (height)
  - Use vanilla canvas
- [x] Create background for infinite distance
- [x] Animate background (done but removed)
- [x] Allow maps to be predrawn and loaded
- [x] Create wall types (start with colors)
- [x] Allow for texture mapping on walls (walls same size for now)
- [ ] Allow for procedurally generated maps
- [x] Have collision detection
- [ ] Add sprites
- [ ] Give different sprites different motion types and displays
- [x] Floor textures.
- [/] Floor dimming.
- [X] Sky box texture 
- [ ] Variable wall heights.
- [ ] Allow for placing textures on walls face by face
- [ ] Add build system with typescript
- [x] WAD packs to instantiate the 'game' with. Including all textures and maps for now. Maps should be bundled with starting player location and direction and plane as well.

### Alternate fun ideas with raycasters:

- A few dots running around shooting rays that get brighter where they intersect or illuminating bubbles flying around.
- Try voxel terrain instead (need height maps)

### Immediate bug fixes
- ~~Enable wall slipping. it's impossible to slip along walls when you're right up against them. Perhaps a combination of creating an artifical limit to keep player from directly contacting wall as well as a calculation to move perpendicular at some velocity if you are not directly walking into a wall but at an angle.~~
- ~~Using bokeh now causes the whole thing to break on resizes. Might not be possible to workaround without pushing new updates to bokeh (other than a conditional render - so tiles without canvas height will fall back to a default color like fire engine red). The issue is that on a window resize event the bokeh field canvas is resized to its parent's client sizes. But in this case, the parent doesn't have a client size since it's not attached to the dom~~
- Minimap does not render correctly when map grid is not square
- Seams at the bottom of walls showing.
- Refactor casting algorithm from player class to screen class. At this point the logic is split with walls in the player and floors in the screen. There is some logic in having the player have a cast method (hit scanning and collision detection with NOCs and what not) but for simplicity let's put it all in one place for now.

### Random working notes / Plan

- Floor casting might just be too expensive with the current implementation.
- Change the tile array into a map
- Set a maximum drawDistance. Use some kind of shading beyond that.
- Change the grid cells from simple numbers to an object. This gives us a lot more room to innovate. For example:
  - We can possibly draw multilayered images over wall tiles.
  - We can create orientations for the tiles, so each cardinal direction has a different tile (this will make the minimap a bit annoying)
  - We can have varied floor tiles (when I figure out floor casting that is)
  - We can have sprites specified right on the base grid, rather than a second grid (this wouldn't be an issue if floor tiles aren't a thing.)
- Create this as a drop-in library. All that would be needed were a map grid (in this case it would make sense to constrain it to simple numbers for the grid), and textures to map to the numbers. Also, fallbacks for colors to stand in for textures could be used to make sure it still works without textures. It should work fine whether links to local files or urls for images are used.
- Add a simple mapbuilder for people.
  0. Build in a fallback for autofilling walls if none are selected
  1. Let them draw a grid with one type of wall on one side, and show the map on the other side.
  2. Let them select the size of the grid.
  3. Let them generate the grid as a map on a second screen.
  4. Let them upload their own textures to use as tiles.
  5. Create a permanent link for the map. (QueryParams would be nice, also stored in a backend (but no custom textures would be possible, too heavy.))
- In the same vein, we can have complex tiles and default ones, so the grid could be a mix of 0s or empty objects (for default) and objects with settings.
- Track viewed cells and use that to draw the mini-map so that the mini-map doesn't immediately reveal the entire level.
- In the event that the complexity never grows much more, one fun addition to it as a portfolio site could be creating multiple levels and randomly loading one each time (except if one is already active in session storage and the current player position is not the starting position or if it is determined that the player has reached there from going back and not reloading or some such)
- Create dynamic 'picture frames' that I can use to create hanging pictures on wall tiles (Instead of a simple ImageBuffer, take an image, scale it to a random or given fractional width of the wall tile, give it a several pixel border (could be an image of a picture frame (could be one of several), and 'hang' it by superimposing it at a randomized tilt (minor, between -10 and 10), and randomized elevation on a wall (again, constrained to 60-90% of the wall height)));
- Can we draw 3d rendered sprites on a webgl canvas and blit that over with any efficiency?
- Sprites, WADs holding textures and maps, sessionstorage onbeforeunload...

- ceiling casting, make complex map where floor and ceiling are defined (ceilings can be seethru), make the textures smaller, use bigger textures for my info stuff but cheaper ones for everywhere else, keep looking for places to precalc everything.
- Is it straightforward enough to do upsampling? IE, when closer to walls use a higher texture or more scan lines.
- Should be change the rendering to only do alternate scanlines? It would probably make everything a fair bit quicker if I start running into issues with higher quality textures on the floors or ceilings again.
- SPRITES PLAN:
  - We need a z buffer for the walls locations. We could just store the columns as an array with their perpDistance. But that might not lend itself well to if there is ever the case of semi-opaque walls or portals with partial obscuring.
  - I need to decide if I just want static sprites to center in a grid or not. I'm inclined to not include sprites on the map grid simply because then everything is centered. Alternately, we can have them on the grid in complex cells where their location is specified exactly (15.4, 10.9) or relative to the walls (.5, .8). Then when casting through empty space we can build an array of all the sprites encountered and use that to render them later. This means multiple sprites per cell (GOOD!) but means that collision detection is more complicated (BAD!). The collision detection might be an issue if we ever add moving sprites like NPCs anyway.
  - For the purposes of trial, I'm going to just use an array of sprites with positions.
  - If I record all grid cells the rays pass to check for renderable sprites, then I can save some processing, but it doesn't work if a sprite is in one cell but overlaps to another. So, for the first pass, let's just do one sprite per tile and centered. We'll use complex grid cells with a sprite key (so that I can use custom floors and ceilings). So:
    1. Z Buffer of wall perpendicular distances by column
    2. While casting, if a cell checked is a floor, add it to an array of visible floors along with its coordinates. The same cell will obviously we checked multiple times so this might not be optimal. Instead we can perhaps use a boolean to indicate whether a cell has been traversed. These booleans could be reset after the sprites have been drawn. Alternately we can use a set or a hash to store simple references. Eg { 1: { 1: true }}.
    3. After rendering the walls and floors and skybox, iterate through the array in reverse drawing the sprites (we might not need to sort by distance since the rays hit cells in a distance pattern as well).
    4. While drawing the sprites (back to front), draw in columns (we'll deal with pixel by pixel later) and for each column, check if the sprites distance is closer than the matching column in the z buffer.