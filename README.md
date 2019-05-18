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
- [ ] Add build system with typescript
- [ ] Upgrade to WebGL or try three.js
- [x] Create background for infinite distance
- [ ] Animate background
- [x] Allow maps to be predrawn and loaded
- [x] Create wall types (start with colors)
- [x] Allow for texture mapping on walls (walls same size for now)
- [ ] Allow for procedurally generated maps
- [x] Have collision detection
- [ ] Handle non-wall objects as sprites
- [ ] Give different objects different motion types and displays
- [ ] Floor and ceiling textures.
- [ ] Allow for placing textures on walls face by face

### Alternate fun ideas with raycasters:

- A few dots running around shooting rays that get brighter where they intersect or illuminating bubbles flying around.
- Try voxel terrain instead

### Immediate bug fixes
- Enable wall slipping. it's impossible to slip along walls when you're right up against them. Perhaps a combination of creating an artifical limit to keep player from directly contacting wall as well as a calculation to move perpendicular at some velocity if you are not directly walking into a wall but at an angle.
- Using bokeh now causes the whole thing to break on resizes. Might not be possible to workaround without pushing new updates to bokeh (other than a conditional render - so tiles without canvas height will fall back to a default color like fire engine red)

### Random working notes / Plan

- Change the tile array into a map
- Change the grid cells from simple numbers to an object. This gives us a lot more room to innovate. For example:
  - We can possibly draw multilayered images over wall tiles.
  - We can create orientations for the tiles, so each cardinal direction has a different tile (this will make the minimap a bit annoying)
  - We can have varied floor tiles (when I figure out floor casting that is)
  - We can have sprites specified right on the base grid, rather than a second grid (this wouldn't be an issue if floor tiles aren't a thing.)

