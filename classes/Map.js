class Map {
  constructor(grid = []){
    this.rawGrid = grid;
    this.grid = this.temporaryCreateComplexGridObjects(this.rawGrid);
    this.height = this.grid.length;
    this.width = this.height ? this.grid[0].length : 0;
  }

  // In the future, a number of pieces of data will be useful to have
  // attached to each cell in the grid, thus necessitating the use of objects
  // over simple numbers. For a short period, we will continue to use basic textures
  // but want the ability to add in a second property, whether a tile has been seen or not (for
  // minimap rendering). So we'll dynamically generate the complex grid until we start hardcoding it.
  temporaryCreateComplexGridObjects(grid){
    return grid;
  }

  getCell(y, x){
    if(this.grid[x][y] == null){
      return null;
    }
    if(this.grid[x] == null){
      return null;
    }
    return this.grid[x][y];
  }
}