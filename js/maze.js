/*
 * This is an enumerated type to hold the types of cells required to represent a maze.
 */
MazeCellTypes = {
	WALL: '#',
	PASSAGEWAY: ' ',
	SOLUTION: '@',
	FRONTIER: 'F',
	VISITED: 'V',
}

class MazeCell {
	constructor(row, col, type) {
		this.row = row;
		this.col = col;
		this.type = type;
		// only used by Dijkstra's and A*
		this.priority = Infinity;
	}

	/*
	 * returns a string of the maze cell type and location
	 * (will be used like a Map in Java)
	 */
    projection() {
		var projection = '';
		if (this.type === MazeCellTypes.WALL) {
			projection = "WALL cell at "
		}
		// a cell doesn't stop being a passageway when it becomes part of a solution.
		else if (this.type === MazeCellTypes.PASSAGEWAY || this.type === MazeCellTypes.SOLUTION) {
			projection = "PASSAGEWAY cell at "
		}
		projection += '[' + this.row + ',' + this.col + ']';
		return projection;
	}
}

class Maze {
	/* 
	 *this function constructs the maze object, a 2D array of chars, and
	 * accepts an argument, plainTextMaze, which is an nxn string
	 * representation of a maze with each cell described by single-character
	 * MazeCellTypes.
	 */

	constructor(plainTextMaze) {
		// split the string into rows
		this.maze = plainTextMaze.split('\n')

		for (var i = 0; i < this.maze.length; i++) {
			// store each row as a char array
			this.maze[i] = this.maze[i].split('');

			for (var j = 0; j < this.maze[i].length; j++) {
				var type = this.maze[i][j];
				this.maze[i][j] = new MazeCell(i, j, type);
			}
		}

		// start and destination can be hard coded since there will always
		// be one path from any one point to another in a perfect maze
		this.start = this.maze[1][0];
		this.destination = this.maze[this.maze.length - 2][this.maze[0].length - 1];
	}

	/*
	 * this function determines whether the argument cell has the same row
	 * and column as the the destination cell, i.e. whether the end has been reached
	 */
	destinationPredicate(cell) {
		if (this.destination.row === cell.row && this.destination.col == cell.col)
			return true;
		else
			return false;
	}

	/*
	 * this function returns all of the neighbors of the argument cell (it does not
	 * check whether those neighbors have been visited)
	 */
	getNeighbors(cell) {
		var neighbors = [];

		// checks neighbor below
		if (cell.row + 1 < this.maze.length &&
			this.maze[cell.row + 1][cell.col].type === MazeCellTypes.PASSAGEWAY) {
			neighbors.push(this.maze[cell.row + 1][cell.col])
		}

        // checks neighbor to the right
		if (cell.col + 1 < this.maze[cell.row].length &&
			this.maze[cell.row][cell.col + 1].type === MazeCellTypes.PASSAGEWAY) {
			neighbors.push(this.maze[cell.row][cell.col + 1]);
		}

        // checks neighbor above
        if (cell.row - 1 >= 0 &&
            this.maze[cell.row - 1][cell.col].type === MazeCellTypes.PASSAGEWAY) {
            neighbors.push(this.maze[cell.row - 1][cell.col]);
        }

        // checks neighbor to the left
        if (cell.col - 1 >= 0 &&
            this.maze[cell.row][cell.col - 1].type === MazeCellTypes.PASSAGEWAY) {
            neighbors.push(this.maze[cell.row][cell.col - 1]);
        }
		return neighbors;
	}


	/*
	 * this function uses a breadth first search to solve the maze. When the solution
	 * is found, the function modifies the maze by marking each cell of the solution
	 * with the type MazeCellTypes.SOLUTION. 
	 */
	solveMazeBFS() {
		// create the queue to hold the cells we have visited but need
		// to return to explore (we will treat the array like a queue)
		var frontier = new Array()
		frontier.push(this.start);

		// create a set to hold the cells we have visited and add the 
		// first element
		var visited = new Set();
		visited.add(this.start.projection())

		// create a map to hold cells to parents, set first element's
		// parents as false (is source cell). Generally, the parents
		// map will have projection values as keys and objects as values.
		// The map will be used to backtrack through MazeCell objects whose type
		// will be changed to SOLUTION until the source cell with value false is
		// reached
		var parents = new Array();
		parents[this.start.projection()] = false;

		// search and continue searching  while there are still items in the queue
		while (frontier.length >= 1) {

			// get the next element in the queue
			var current = frontier.shift();

			// mark the next element as visited
			current.type = MazeCellTypes.VISITED;

			// test to see if it meets the destination criteria
			if (this.destinationPredicate(current)) {
				// we've reached the destination! Awesome!
				break;
			}

			// get the neighbors of the current cell (passageways)
			var neighbors = this.getNeighbors(current);

			// one by one, add neighbors to the queue
			for (var i = 0; i < neighbors.length; i++) {

				var neighbor = neighbors[i].projection();

				// see if we've already visited this cell
				if (!visited.has(neighbor)) {
					// if we haven't,  add it to the visited set
					visited.add(neighbor);
					// add current as the neighbor's parent
					parents[neighbor] = current;
					// add the neighbor to the queue
					frontier.push(neighbors[i])
						// set the neighbor to have a "frotier" type
					neighbors[i].type = MazeCellTypes.FRONTIER;
				}
			}
		}

		// backtrack through each cell's parent and set path cells to type
		// solution
		while (current) {
			current.type = MazeCellTypes.SOLUTION;
			current = parents[current.projection()];
		}
	}

	/*
	 * this function uses a depth first search to solve the maze. When the solution
	 * is found, the function modifies the maze by marking each cell of the solution
	 * with the type MazeCellTypes.SOLUTION. 
	 */
	solveMazeDFS() {
		// store the nodes that may become the solution path on a stack
		var stack = new Array();
		stack.push(this.start);

		// make set for visited cells and add the starting one
		var visited = new Set();
        visited.add(this.start.projection());

		// "peek" the current stack and make it the starting cell
        var current = stack[stack.length - 1];
        var neighbors;
		var flag;

		// do this until the destination is reached
        while (!this.destinationPredicate(current)) {
			flag = true;

			neighbors = this.getNeighbors(current);
			for (var i = 0; i < neighbors.length; i++) {
				// take the first cell of the neighbors
                var neighbor = neighbors[i];

                // see if we haven't visited the cell
				if (!visited.has(neighbor)) {
                    // if we haven't visited, add it to the visited set
                    visited.add(neighbor);

					// add the cell onto the stack of the potential solution
					stack.push(neighbor);

					// update the current cell to find its neighbors in the next loop
					current = neighbor;

					// since we found an unvisited neighbor, go back to beginning of while
					// loop and keep finding neighbors
                    flag = false;
                    break;
				}

			}

			// if we're at a dead end or all of the neighbors have been visited,
			// pop a cell off and assign the current cell to the last one in the stack
			if (neighbors.length < 1 || flag) {
				stack.pop();
				current = stack[stack.length - 1];
            }
		}

		// if the destination is found, mark each one in the stack as a solution tile
		if (this.destinationPredicate(current)) {
			for (var i = 0; i < stack.length; i++) {
                stack[i].type = MazeCellTypes.SOLUTION;
            }
        }
    }
	
	/*
	 * this function uses a Dijkstra's algorithm to solve the maze. When the solution
	 * is found, the function modifies the maze by marking each cell of the solution
	 * with the type MazeCellTypes.SOLUTION. 
	 */
	solveMazeDijkstra() {
		// TODO
	}
	
	/*
	 * this function uses A* to solve the maze. When the solution
	 * is found, the function modifies the maze by marking each cell of the solution
	 * with the type MazeCellTypes.SOLUTION. 
	 */
	solveMazeAStar() {
		// TODO
	}

	
	/*
	 * this function returns the number of cells that are included in the solution path.
	 */
	cellCounts() {
		var counter = []
		counter['solution'] = 0;
		counter['visited'] = 0;
		counter['frontier'] = 0;
		for (var i = 0; i < this.maze.length; i++) {
			for (var j = 0; j < this.maze[i].length; j++) {
				if (this.maze[i][j].type === MazeCellTypes.SOLUTION) {
					counter['solution']++;
				}
				if (this.maze[i][j].type === MazeCellTypes.SOLUTION ||
					this.maze[i][j].type == MazeCellTypes.VISITED) {
					counter['visited']++;
				}
				if (this.maze[i][j].type === MazeCellTypes.FRONTIER) {
					counter['frontier']++;
				}
			}
		}
		return counter;
	}

}

/*
 * 6. On average, the BFS visited 297.5 more cells than the DFS
 *
 * 7. Considering every possible graph, DFS and BFS would technically average out to have the same performance
 * But, the average cases is much more consistent with BFS, so in the informal sense of the "average case"
 * BFS is better.
 *
 * 8. The getNeighbors() ordering would be right, down, up, left.
 *
 * The 7x7 border maze that would present a best case scenario for DFS with this ordering is:
 *
 * ■ ■ ■ ■ ■ ■ ■
 *     ■       ■
 * ■   ■   ■   ■
 * ■   ■   ■   ■
 * ■   ■   ■   ■
 * ■   
 * ■ ■ ■ ■ ■ ■ ■
 *
 */

