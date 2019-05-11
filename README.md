# Raymarcher Test

This is just a bit of faffing about with making a basic raymarcher in HTML5 canvas. But in the interests of making lists that never get completed, here are some potential milestones:

- [ ] Make a basic raymarcher in 2d:
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
- [ ] Create background for infinite distance
- [ ] Animate background
- [ ] Allow maps to be predrawn and loaded
- [ ] Create wall types (start with colors)
- [ ] Allow for texture mapping on walls (walls same size for now)
- [ ] Allow for procedurally generated maps
- [ ] Have collision detection
- [ ] Create other objects and animate them with perlin noise
- [ ] Give different objects different motion types and displays

### Alternate fun ideas with raycasters:
- A few dots running around shooting rays that get brighter where they intersect or illuminating bubbles flying around.
- Try voxel terrain instead


## Random working notes

I'm doing a refactor in toto here. A good opportunity to reconsider how the screen drawing is being split up.