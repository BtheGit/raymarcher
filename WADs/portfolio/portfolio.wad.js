// We can explore preprocessing these files so the full gridCell objects don't have to be built, instead a function perhaps.

const BLANK_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  
];

// A 'WAD' file will have the list of texture assets, the maps, and the starting parameters for the player.
// Maps will include settings for static background colors.
// The WAD folder will also have a subfolder to hold image assets.

// We could load textures only by map, but I think with modern web capabilities, let's cheat and just load everything for
// now. If I come to regret it, I'm not worried, I'm sure there are plenty of other decisions I'll already be
// regretting more by that point.

// This is a weird way to do it. Having everything processed into a second lookup tree on load, but because of the 
// nature of having mixed assets, we're going to put off restructuring until a final tally of allowed texture types
// is created.
const tiles = [
  {
    type: 'image',
    name: 'floor_grass1',
    path: './images/tiles/floor_grass1.jpg',
  },
  {
    type: 'image',
    name: 'floor_carpet1',
    path: './images/tiles/floor_carpet1.jpg',
  },
  {
    type: 'image',
    name: 'floor2',
    path: './images/tiles/floor1.jpg',
  },
  {
    type: 'image',
    name: 'light_brick1',
    path: './images/tiles/light_brick1.jpg',
  },
  {
    type: 'image',
    name: 'marble1',
    path: './images/tiles/marble1.jpg',
  },
  {
    type: 'image',
    name: 'concrete1',
    path: './images/tiles/concrete1.jpg',
  },
  {
    type: 'image',
    name: 'rusted_steel1',
    path: './images/tiles/rusted_steel1.jpg',
  },
  {
    type: 'image',
    name: 'cliff1',
    path: './images/tiles/cliff1.jpg',
  },
  {
    type: 'image',
    name: 'hedge1',
    path: './images/tiles/hedge1.jpg',
  },
  {
    type: 'image',
    name: 'concrete_brick1',
    path: './images/tiles/concrete_brick1.jpg',
  },
  {
    type: 'image',
    name: 'concrete_brick2',
    path: './images/tiles/concrete_brick2.jpg',
  },
  {
    type: 'image',
    name: 'concrete_tile1',
    path: './images/tiles/concrete_tile1.jpg',
  },
  {
    type: 'image',
    name: 'concrete_tile2',
    path: './images/tiles/concrete_tile2.jpg',
  },
  {
    type: 'image',
    name: 'concrete_tile3',
    path: './images/tiles/concrete_tile3.jpg',
  },
  {
    type: 'image',
    name: 'concrete2',
    path: './images/tiles/concrete2.jpg',
  },
  {
    type: 'image',
    name: 'dots1',
    path: './images/tiles/dots1.jpg',
  },
  {
    type: 'image',
    name: 'fresco1',
    path: './images/tiles/fresco1.jpg',
  },
  {
    type: 'image',
    name: 'fur1',
    path: './images/tiles/fur1.jpg',
  },
  {
    type: 'image',
    name: 'fur2',
    path: './images/tiles/fur2.jpg',
  },
  {
    type: 'image',
    name: 'granite1',
    path: './images/tiles/granite1.jpg',
  },
  {
    type: 'image',
    name: 'alien1',
    path: './images/tiles/alien1.jpg',
  },
  {
    type: 'image',
    name: 'alien2',
    path: './images/tiles/alien2.jpg',
  },
  {
    type: 'image',
    name: 'alien3',
    path: './images/tiles/alien3.jpg',
  },
  {
    type: 'image',
    name: 'plaster1',
    path: './images/tiles/plaster1.jpg',
  },
  {
    type: 'image',
    name: 'rust1',
    path: './images/tiles/rust1.jpg',
  },
  {
    type: 'image',
    name: 'rust2',
    path: './images/tiles/rust2.jpg',
  },
  {
    type: 'image',
    name: 'stone2',
    path: './images/tiles/stone2.jpg',
  },
  {
    type: 'image',
    name: 'stripes_creamsicle1',
    path: './images/tiles/stripes_creamsicle1.jpg',
  },
  {
    type: 'image',
    name: 'tile_blue1',
    path: './images/tiles/tile_blue1.jpg',
  },
  {
    type: 'image',
    name: 'brendan_bald1',
    path: './images/tiles/me1.png',
  },
  {
    type: 'image',
    name: 'bokehfy1',
    path: './images/projects/bokehfy1.png'
  },
  {
    type: 'image',
    name: 'breakout1',
    path: './images/projects/breakout1.png'
  },
  {
    type: 'image',
    name: 'dd1',
    path: './images/projects/doodledetectives1.png'
  },
  {
    type: 'image',
    name: 'local_places1',
    path: './images/projects/localplaces1.jpg'
  },
  {
    type: 'image',
    name: 'sortable_tables1',
    path: './images/projects/sortabletables1.jpg'
  },
  {
    type: 'image',
    name: "tetris1",
    path: './images/projects/tetris1.png'
  },
  {
    type: 'link-image',
    name: 'link_github_personal',
    href: 'https://github.com/BtheGit',
    path: './WADs/portfolio/images/github_logo1.png',
  },
  {
    type: 'image',
    name: "background_trees1",
    path: './images/tiles/background_trees2.jpg',
  },
  // {
  //   type: 'image',
  //   name: 'robbie_the_geek1',
  //   path: 'https://media.licdn.com/dms/image/C5603AQFDLAcoM7oa0w/profile-displayphoto-shrink_800_800/0?e=1563408000&v=beta&t=BbkkYW-9reSYz1TNvDhAjbv7rBfNlN9RN6KIkeLbYKo'
  // },
  // {
  //   type: 'image',
  //   name: 'lindsay1',
  //   path: 'https://media.licdn.com/dms/image/C4E03AQF_rnt4a-2N4g/profile-displayphoto-shrink_800_800/0?e=1563408000&v=beta&t=gi6fY7WlyY5t71f4KYuRHjEkwurb5gRqA9hKlQ3PC_o',
  // },
  // {
  //   type: 'image',
  //   name: 'bryan1',
  //   path: 'https://scontent-iad3-1.xx.fbcdn.net/v/t31.0-8/11823034_10154226861255620_5773866248861672139_o.jpg?_nc_cat=107&_nc_ht=scontent-iad3-1.xx&oh=5b2423ed7c798b8ab75d39f9bc4353e1&oe=5D56DC9F'
  // },
  // {
  //   type: 'bokeh',
  //   name: 'bokeh_default',
  // },
  {
    type: 'bokeh',
    name: 'bokeh_purple_on_tan',
    bokehSettings: {
      color: 'black',
      backgroundColor: 'orangered',
      dx: 5,
      dy: 5,
      density: 20,
      halfLife: 100,
      radius: 30,
      frameRate: 60,
    }
  },
  // {
  //   type: 'bokeh',
  //   name: 'bokeh_purple_on_tan',
  //   bokehSettings: {
  //     color: 'white',
  //     backgroundColor: 'orangered',
  //     dx: 1,
  //     dy: 10,
  //     density: 20,
  //     halfLife: 50,
  //     radius: 30,
  //     frameRate: 60,
  //   }
  // },
  // {
  //   type: 'bokeh',
  //   name: 'bokeh_purple_on_tan',
  //   bokehSettings: {
  //     color: 'purple',
  //     backgroundColor: 'white',
  //     dx: 10,
  //     dy: 5,
  //     density: 10,
  //     halfLife: 50,
  //     radius: 10,
  //     frameRate: 60,
  //   }
  // },
  // {
  //   type: 'framed-image',
  //   imagePath: './images/tiles/me1.png',
  //   backgroundImagePath: './images/tiles/light_brick1.jpg',
  //   tilt: null, // This should trigger random,
  //   frameColor: 'black',
  // }
];

// A map needs 
// - a grid
// - a starting tile and direction
// - background colors

const MAP1 = {
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,4,0,4,4,4,0,4,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,{ isFloor: true, texture: 2, },{ isFloor: true, texture: 1, },0,0,0,0,0,4,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
    [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,4,4,4,4,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,3,0,9,0,3,3,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,2,2,2,2,2,2,12,2],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
    [1,0,0,0,0,0,0,0,3,3,0,3,3,3,0,3,2,0,0,2,0,2,0,2],
    [1,0,0,0,0,0,0,0,1,1,0,1,{ isWall: true, height: 2, texture: 7 },1,0,1,2,0,0,0,0,2,0,2],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,2,0,0,0,2,0,2],
    [1,0,0,0,0,0,0,0,6,0,6,1,0,1,0,0,0,1,2,2,2,2,0,2],
    [1,0,0,0,0,0,0,0,0,10,1,1,0,1,0,0,0,0,1,1,1,2,0,2],
    [1,0,0,0,0,0,0,0,0,1,1,6,0,6,1,0,0,0,0,0,0,0,0,11],
    [1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1]  
  ],
  playerPos: {
    x: 12.5,
    y: 22
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  backgroundSky: [
    {
      stop: 0,
      color: "#333"
    }
  ],
  backgroundFloor: [
    {
      stop: 0,
      color: "#abc"
    }
  ],
};

const MAP2 = {
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,0,0,0,0,5],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,0,0,0,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,5,0,0,5,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,5,0,5,5,5,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,0,5,0,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,5,0,5,5,5,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,5,5,5,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,5,5,5,0,5,5,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,7,1,1,5,0,5,1,6,1,1],  
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1]  
  ],
  playerPos: {
    x: 18.5,
    y: 23
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  backgroundSky: [
    {
      stop: 0,
      color: "#7AA1D2"
    },
    {
      stop: .8,
      color: "#DBD4B4"
    },
    {
      stop: 1,
      color: "#CC95C0"
    }
  ],
  backgroundFloor: [
    {
      stop: 0,
      color: "#111"
    },
    {
      stop: 0.2,
      color: "#403B4A"
    },
    {
      stop: 1,
      color: "#b0b28b"
    }
  ],
};

const MAP_TILETEST = {
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,36,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,38,0,0,0,0,0,0,35,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,0,0,0,37,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,34,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,33,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,32,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,31,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,30,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,29,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,28,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,27,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,26,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,25,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,24,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,23,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,22,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,34,3,0,0,21,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,20,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  
  ],
  playerPos: {
    x: 18.5,
    y: 23
  },
  playerDir: {
    x: 0,
    y: -1
  },
  playerPlane: {
    x: -0.66,
    Y: 0
  },
  backgroundSky: [
    {
      stop: 0,
      color: "#7AA1D2"
    },
    {
      stop: .8,
      color: "#DBD4B4"
    },
    {
      stop: 1,
      color: "#CC95C0"
    }
  ],
  backgroundFloor: [
    {
      stop: 0,
      color: "#111"
    },
    {
      stop: 0.2,
      color: "#403B4A"
    },
    {
      stop: 1,
      color: "#b0b28b"
    }
  ],
};


const maps = [
  MAP1,
  MAP_TILETEST,
  MAP2,
];

// TODO: Exports

const PORTFOLIO_WAD = {
  tiles,
  maps,
}