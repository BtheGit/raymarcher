class Map {
  constructor(grid = []) {
    this.grid = grid;
    this.height = this.grid.length;
    this.width = this.height ? this.grid[0].length : 0;
  }

  getCell(y, x) {
    if (this.grid[x] == null) {
      return null;
    }
    if (this.grid[x][y] == null) {
      return null;
    }
    return this.grid[x][y];
  }

  updateGrid(newGrid) {
    this.grid = newGrid;
  }
}

export default Map;
