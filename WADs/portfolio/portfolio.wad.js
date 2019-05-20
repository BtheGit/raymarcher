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
  [1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1]  
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
    name: 'brendan_bald1',
    path: './images/tiles/me1.png',
  },
  {
    type: 'bokeh',
    name: 'bokeh_default',
  },
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
  {
    type: 'image',
    name: 'robbie_the_geek1',
    path: 'https://media.licdn.com/dms/image/C5603AQFDLAcoM7oa0w/profile-displayphoto-shrink_800_800/0?e=1563408000&v=beta&t=BbkkYW-9reSYz1TNvDhAjbv7rBfNlN9RN6KIkeLbYKo'
  },
  {
    type: 'image',
    name: 'lindsay1',
    path: 'https://media.licdn.com/dms/image/C4E03AQF_rnt4a-2N4g/profile-displayphoto-shrink_800_800/0?e=1563408000&v=beta&t=gi6fY7WlyY5t71f4KYuRHjEkwurb5gRqA9hKlQ3PC_o',
  },
  {
    type: 'image',
    name: 'bryan1',
    path: 'https://scontent-iad3-1.xx.fbcdn.net/v/t31.0-8/11823034_10154226861255620_5773866248861672139_o.jpg?_nc_cat=107&_nc_ht=scontent-iad3-1.xx&oh=5b2423ed7c798b8ab75d39f9bc4353e1&oe=5D56DC9F'
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
  }
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
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
    [1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,4,4,4,4,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,3,0,9,0,3,3,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,2,2,2,2,2,2,12,2],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
    [1,0,0,0,0,0,0,0,3,3,0,3,3,3,0,3,2,0,0,2,0,2,0,2],
    [1,0,0,0,0,0,0,0,1,1,0,1,7,1,0,1,2,0,0,0,0,2,0,2],
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


const maps = [
  MAP2,
  MAP1,
];

// TODO: Exports

const PORTFOLIO_WAD = {
  tiles,
  maps,
}