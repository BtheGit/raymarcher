class Map {
  constructor(grid = []){
    this.grid = grid;
    this.height = this.grid.length;
    this.width = this.height ? this.grid[0].length : 0;
  }
}