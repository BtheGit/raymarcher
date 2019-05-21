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
- [ ] Floor and ceiling textures.
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