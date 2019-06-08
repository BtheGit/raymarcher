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
- [x] Have collision detection with walls
- [x] Add sprites
- [x] Add sprite collision detection
- [ ] Add animated fixed position sprites
- [ ] Allow for placing textures on walls face by face
- [ ] Add moving sprites
- [ ] Sprites with multiple vantage points (8 views depending on with player)
- [ ] Add NPC class with movement logic
- [ ] Add collisions to NPCs
- [ ] Add basic triggered interactions to NPCs
- [ ] Add dialogue tree based interactions to NPCs
- [ ] Give different sprites different motion types and displays
- [x] Floor textures.
- [\] Floor dimming.
- [x] Sky box texture 
- [x] Ceiling textures
- [ ] Variable wall heights.
- [x] WAD packs to instantiate the 'game' with. Including all textures and maps for now. Maps should be bundled with starting player location and direction and plane as well.

### Alternate fun ideas with raycasters:

- A few dots running around shooting rays that get brighter where they intersect or illuminating bubbles flying around.
- Try voxel terrain instead (need height maps)

### Immediate bug fixes
- ~~Enable wall slipping. it's impossible to slip along walls when you're right up against them. Perhaps a combination of creating an artifical limit to keep player from directly contacting wall as well as a calculation to move perpendicular at some velocity if you are not directly walking into a wall but at an angle.~~
- ~~Using bokeh now causes the whole thing to break on resizes. Might not be possible to workaround without pushing new updates to bokeh (other than a conditional render - so tiles without canvas height will fall back to a default color like fire engine red). The issue is that on a window resize event the bokeh field canvas is resized to its parent's client sizes. But in this case, the parent doesn't have a client size since it's not attached to the dom~~
- Minimap does not render correctly when map grid is not square
- ~~Seams at the bottom of walls showing.~~
- Refactor casting algorithm from player class to screen class. At this point the logic is split with walls in the player and floors in the screen. There is some logic in having the player have a cast method (hit scanning and collision detection with NOCs and what not) but for simplicity let's put it all in one place for now.
- It would be great to reverse the calculations that effectively make every grid reversed. That means likely changing the render direction
- The skybox renders an extra pixel above ceilings, created a single pixel line.
- Performance is smooth in Chrome, sluggish in FF and Safari. This will improve once I stop using such big textures, but it does beg a bit more of precalcing and using lookup tables  (which may also entail working harder to avoid floating points, which I've been lazy about so far.)

### Random working notes / Plan

- Change the tile array into a map
- Set a maximum drawDistance. Use some kind of shading beyond that.
- ~~Change the grid cells from simple numbers to an object. This gives us a lot more room to innovate. For example:
  - We can possibly draw multilayered images over wall tiles.
  - We can create orientations for the tiles, so each cardinal direction has a different tile (this will make the minimap a bit annoying)
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
- Add biomes. Ie, have the skybox image be dependent on where a player is standing (either a certain number of biome specific blocks near the player (a la Terraria)) or based on an invisible biome map that is hard coded. Would need a transition effect to fade in and out. This would be a great feature for procedurally generated levels.

- ceiling casting, make complex map where floor and ceiling are defined (ceilings can be seethru), make the textures smaller, use bigger textures for my info stuff but cheaper ones for everywhere else, keep looking for places to precalc everything.
- Is it straightforward and cheap enough to do upsampling? IE, when closer to walls use a higher texture or more scan lines. All we need to do is have multiple versions of a texture (optionally) and select which one based on the distance to player. This would require coordination of course to make sure the various resolutions had the small dimensions and alignment of course. (Could also be auto generated in a map builder.)
- Should we change the rendering to only do alternate scanlines? It would probably make everything a fair bit quicker if I start running into issues with higher quality textures on the floors or ceilings again. I might be able to get alot more fidelity and complexity without anymore efficiency just by doing half the pixel rendering each frame. There's also no reason I couldn't drop the frame rate a bit.
- How expensive would motion blur be?
- What other kinds of animated textures can we do? Obviously repeating gifs are cheaper but particle effects are cooler.
- SPRITES PLAN:
- Look into using weakmaps where possible instead of hashes. Explore whether there is any tangible memory overhead savings.
- We're not going to do dynamic lighting, but if we create a brightness modifier (either cell by cell or face by face), we can approximate a bit more lightmapping. We could even have sprites be affected by the brightness modifier of whatever cell they are standing in.

PLAN:
    - ~~Add in ceiling casting. See if it works when only some empty cells have ceilings. That is unlikely but would be an amazing surprise.~~
    - ~~Add in sprite sorting.~~
    - ~~Add in sprite collisions.~~
    - ~~Add actual sprite class so we can remove hardcoded locations and sprite texture. Use names (tiles will eventually too.)~~
    - Add in a mechanism for controlling sprite sizes (can use just the height since ew have a vertical offset and the image ratios are now respected).
    - Add in a console text display that is toggleable (like the minimap), change the minimap to being switched on or off rather than on when a button is pressed.
    - Add in a basic text interaction for sprites.
    - Explore what adding in a dialogue tree would entail.
    - Add in specified wall faces.
    <!-- - Add in draw distance (so that I can render varying height walls behind other walls) -->
    <!-- - Render all walls in draw distance, back to front (painter's algorithm); -->
    <!-- - Add back in ascend/descend controls. -->
    - Add in a text overlay (so that I can have pop-up messages or npcs talking or signs...). Maybe multiple types. But for now just text on the screen that is triggered by an event and a way to dismiss it. (For cheap purposes, we can use a console HUD until we have a more diegetic approach.)
    - To that effect, let's create a text display overlay that will run on it's own buffer and be drawn last. We'll let events write to is and we'll make it time based (so we don't have to deal with overlapping interactions for now.)


    - Add in fallback gradient if no background sky or sky gradient is specified.
    - Add in interactions with sprites. (Press spacebar and the sprite does something/says something).
    - Add in signs. (Sprites that draw text or play audio when you interact with them).
    - Make a first pass of a portfolio site!! (Or at least have the initial room point towards the portfolio (links) and the rest of the world be in development - that way I can at least replace my home domain with something new (even if it just links back to the legacy portfolio));