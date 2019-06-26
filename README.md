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
- [x] Allow for placing textures on walls face by face
- [ ] Add moving sprites
- [ ] Sprites with multiple vantage points (8 views depending on with player)
- [ ] Add NPC class with movement logic
- [ ] Add collisions to NPCs
- [ ] Add basic triggered interactions to NPCs
- [ ] Add dialogue tree based interactions to NPCs
- [ ] Give different sprites different motion types and displays
- [ ] Fog tiles
- [ ] Rainbow gun
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
- Refactor all calls for grid cells to use correct getter.
- Prevent errors triggered from walking to the edge of a world with no walls.
- FIX THE DAMN REVERSE THING!
- Issue with crashes when no outer wall in viewport.

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

- ~~ceiling casting, make complex map where floor and ceiling are defined (ceilings can be seethru), make the textures smaller, use bigger textures for my info stuff but cheaper ones for everywhere else, keep looking for places to precalc everything.~~
- Is it straightforward and cheap enough to do upsampling? IE, when closer to walls use a higher texture or more scan lines. All we need to do is have multiple versions of a texture (optionally) and select which one based on the distance to player. This would require coordination of course to make sure the various resolutions had the small dimensions and alignment of course. (Could also be auto generated in a map builder.)
- Should we change the rendering to only do alternate scanlines? It would probably make everything a fair bit quicker if I start running into issues with higher quality textures on the floors or ceilings again. I might be able to get alot more fidelity and complexity without anymore efficiency just by doing half the pixel rendering each frame. There's also no reason I couldn't drop the frame rate a bit.
- How expensive would motion blur be?
- What other kinds of animated textures can we do? Obviously repeating gifs are cheaper but particle effects are cooler.
- SPRITES PLAN:
- Look into using weakmaps where possible instead of hashes. Explore whether there is any tangible memory overhead savings.
- We're not going to do dynamic lighting, but if we create a brightness modifier (either cell by cell or face by face), we can approximate a bit more lightmapping. We could even have sprites be affected by the brightness modifier of whatever cell they are standing in.
- Fog tiles. Can make different types, but ideally can use these to create much more organic space divisions in a single map. The further away from them you are the more opaque. In fact, it might make sense to make it a special wall tile (though it would create issues with sprites - we'd have to start thinking about how to make translucent walls.)
- A rainbow gun. People keep asking for a gun. I don't plan on making a game. But, it could be an interesting exercise to implement a projectile weapon (maybe just hitscan) if I made it something that recolored tiles and sprites (such as a filter effect that created a rainbow overlay (or simply swapped out the texture with a rainbow)). (Sprites behind sprites would be a bigger challenge that would require pixel sniffing for opacity).
- Create more particle effects textures (heavy though)
- Create a way to render gifs to wall textures.
- I've said it before but it bears repeating, we need to optimize. Move away from floats as much as possible, try lookup tables as much as possible. Move as many calculations out of the render cycles as possible ~~(here's looking at you sky gradient)~~.
- For sprite sizes, let's use a sprite scale value (default of one) relative to wall height/grid cell size (ie the one unit of measurement in the world). Everything has been done as 1 so far. But perhaps we can start using units of 100 in the future to cheaply cut down on floats.
- Figure out how to programmatically get correct verticalOffset from scale.
- Create a series of behaviors that can be specified as triggers. Eg, go to a webpage, start/stop animation, display text, start a dialogue tree session, cause something in the world to change (such as turning off all textures)...
- Create a god mod HUD, with a series of controls that let us dynamically change world settings on the fly. Clipping, textures, shading...
- It might behoove me to create a sprite manager service class, so that there is a straightforward way to query for sprites outside of a Player or some such method. (Things like triggering).
- If I really want to go crazy, I could make this a multiplayer world. But I think I'll leave that for a long time, I'd rather have static pages than sockets and a server for the scope of this.

PLAN:
    - ~~Add in ceiling casting. See if it works when only some empty cells have ceilings. That is unlikely but would be an amazing surprise.~~
    - ~~Add in sprite sorting.~~
    - ~~Add in sprite collisions.~~
    - ~~Add actual sprite class so we can remove hardcoded locations and sprite texture. Use names (tiles will eventually too.)~~
    - ~~Add in a mechanism for controlling sprite sizes (can use just the height since ew have a vertical offset and the image ratios are now respected).~~
    - ~~Add in a basic text interaction for sprites.~~
    - The whole program needs to be abstracted to allow for using in the editor. This mainly means separating the instantiation logic from the code. But I'd also like to use this opportunity to finally move the project into a build system.
    - Calculate font sizes dynamically.
    - Refactor to only one map per WAD.
    - Add in logic to highlight closest sprite at x = 0 if it's within trigger distance and it has a trigger.
    - Refactor to create wall class so it's easier to program unique triggers and handle animated faces. Deprecate LinkImageBuffer and BokehBuffer.
    - Add in a fall back floor gradient. (This will be useful if I ever want to have a mode without textures.)
    - Add in mobile controls so I can start testing on a mobile phone.
    - Add in a console text display that is toggleable (like the minimap), change the minimap to being switched on or off rather than on when a button is pressed.
    - Explore what adding in a dialogue tree would entail.
    - Validation: Grid cells.
    - ~~Add in specified wall faces.~~
    <!-- - Add in draw distance (so that I can render varying height walls behind other walls) -->
    <!-- - Render all walls in draw distance, back to front (painter's algorithm); -->
    <!-- - Add back in ascend/descend controls. -->
    - Add in a text overlay (so that I can have pop-up messages or npcs talking or signs...). Maybe multiple types. But for now just text on the screen that is triggered by an event and a way to dismiss it. (For cheap purposes, we can use a console HUD until we have a more diegetic approach.)
    - To that effect, let's create a text display overlay that will run on it's own buffer and be drawn last. We'll let events write to is and we'll make it time based (so we don't have to deal with overlapping interactions for now.)


    - ~~Add in fallback gradient if no background sky or sky gradient is specified.~~
    - ~~Add in interactions with sprites. (Press spacebar and the sprite does something/says something).~~
    - Add in signs. (Sprites that draw text or play audio when you interact with them).
    - Make a first pass of a portfolio site!! (Or at least have the initial room point towards the portfolio (links) and the rest of the world be in development - that way I can at least replace my home domain with something new (even if it just links back to the legacy portfolio));
    - Make map builder. Without one, using texture names for walls will be too annoying, so let's get this done sooner than later.
    - As soon as we have a map builder, swap out for named textures which are loaded and then assigned to wall class instances. Link-images will need to be refactored.

    - IMPORTANT: We need to move away from numbers for cells. Even just colors should be specified explicitly. To that end we also need to move away from using 0 to denote a floor. Now that we have a map builder, every cell should be complex. To that effect, we should have a cell type rather than booleans that may or may not exist. We should really do this as soon as outputting from the editor becomes tenable because it is going to break everything until fully refactored.
    - Instead of only linear grid stops (or linear in one direction, we should use a more dynamic setup that allows us to pass in all the config for the grid.)
    - Cells should have a gradient, color, and texture property instead of just overloading the texture property. The texture is first. Then the gradient. The color is a fallback check. Finally a built in default is the last resort.
    - create generic texture getter in Screen or use textureType key?

Map Editor note in map editor repo now.

Server/DB/Backend:
    Notes:
        At some point, I'm going to need a backend of some sort. For dev purposes I will have the editor save output just to a file (or just a text display on screen), but eventually that won't be enough if my idea of letting people save WADS and generate permanent URLs.
        We'll revisit this much later.