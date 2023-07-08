// For just basic wandering and walking, going to start with a non-weighted BFS algorithm.
// TODO: Besides using other algorithms, it would be best, eventually, to preprocess maps into more efficient search graphs for things like this. We could recalculate the graph on certain events (namely grid tile changes to the accessible attribute).

import { GridManager } from "../GridManager/GridManager";

// This is going to be specifically to find a single path between two points and return the path. So it's a bit different than just visiting all nodes, and also it's going to use a linked list mechanic (node's with parents) to retain memory for backtracking.

// NOTE: The grid manager might be the best entity responsible for doing this since it owns the grid (and by extension the shape of it). I would also like to consider being able to pass weights and limitations (namely between acessible and solid flags, so maybe projectiles could pass through non-solid but inaccessible tiles while NPCs and players could not.) Let's start by assuming the system calling this will pass the grid manager in. So we can start with grid cell lookups instead of just a whole grid. However, might be nicer to just make a simple matrix of accessible vs non-accessible tiles.

// Oh. I take that back. The grid manager does not keep an actual grid of the map. So maybe we should keep a copy there for this. But also another remapped one as well for search graphs. Using a remapped grid would essentially make this algorithm independent of the grid manager which would only be responsible for generating a (cached) representation of accessible grid tiles. We can decouple that pretty easily later.

import { GridCoord, GridNode } from "../raymarcher";

const directions = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
];

export const shortestPathBFS = (
  gridManager: GridManager,
  start: GridCoord,
  target: GridCoord
) => {
  const rows = gridManager.rows;
  const columns = gridManager.columns;

  // TODO: Verify start and end are valid grid locations so we can save some hassle with bad values (not that we'd expect that internally).

  const queue: GridNode[] = [];
  const visited: boolean[][] = Array.from(Array(rows), () =>
    Array(columns).fill(false)
  );

  queue.push({ ...start, parent: null });
  visited[Math.floor(start.y)][Math.floor(start.x)] = true;

  while (queue.length) {
    let current = queue.shift()!;

    // Check current node for equality with target
    if (
      Math.floor(current.x) === target.x &&
      Math.floor(current.y) === target.y
    ) {
      // We're here!!
      // Now we just need to walk back through the nodes until we hit the start (parent = null).
      // If we're extra clever (because array size preallocation says what in JS world) we just push them in backwards and everything is right as rain!
      const path: GridNode[] = [];
      while (current) {
        path.unshift(current);
        current = current.parent!;
      }
      return path;
    }

    // Ok. We haven't found the target. Now let's add each of cells in the four adjacent cells to the queue to check.
    // NOTE: We are not prioritizing a direction based on the target, but that is a minor optimization step.
    // Also NOTE: We obviously want to check whether the cell a) exists and b) is accesible.

    for (const direction of directions) {
      const newX = Math.floor(current.x + direction.x);
      const newY = Math.floor(current.y + direction.y);

      const wasVisited = visited[newY][newX] === true;
      if (wasVisited) continue;

      const isAccessible = gridManager.isTileAccessible(newX, newY);
      if (!isAccessible) continue;

      // Alright, fresh meat for adding to the queue to check!
      queue.push({
        x: newX,
        y: newY,
        parent: current,
      });
      visited[newY][newX] = true;
    }
  }

  // OK. We tried everything and we found nothing. Are you sure you didn't stick us in a locked room?
  return null;
};
