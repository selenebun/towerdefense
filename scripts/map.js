class Map {
    constructor() {
        // Grids
        this.dists;             // distance to exit
        this.grid;              // tile type
                                // (0 = empty, 1 = wall, 2 = path, 3 = tower)
        this.paths;             // direction to reach exit
        this.visitMap;          // whether exit can be reached
        this.walkMap;           // walkability map

        // Important tiles
        this.exit = createVector(0, 0);
        this.spawnpoints = [];

        // Map generation settings
        this.minDist = 15;      // min distance between spawn and exit
        this.wallCover = 0.1;   // percentage of map covered by walls

        // Misc
        this.cols;
        this.name = 'map';
        this.rows;
        this.waves = -1;        // -1 for unlimited waves
    }

    // Return direction to take to reach exit
    dir(col, row) {
        return this.paths[col][row];
    }

    // Return distance to exit
    dist(col, row) {
        return this.dists[col][row];
    }

    // Recalculate pathfinding maps
    // Algorithm from https://www.redblobgames.com/pathfinding/tower-defense/
    recalculate() {
        this.walkMap = this.getWalkMap();
        var frontier = [];
        var target = vts(this.exit);
        frontier.push(target);
        var cameFrom = {};
        var distance = {};
        cameFrom[target] = null;
        distance[target] = 0;

        // Fill cameFrom and distance for every tile
        while (frontier.length !== 0) {
            var current = frontier.shift();
            var t = stv(current);
            var adj = neighbors(this.walkMap, t.x, t.y, 0);

            for (var i = 0; i < adj.length; i++) {
                var next = adj[i];
                if (!(next in cameFrom) || !(next in distance)) {
                    frontier.push(next);
                    cameFrom[next] = current;
                    distance[next] = distance[current] + 1;
                }
            }
        }

        // Generate usable maps
        this.dists = buildArray(this.cols, this.rows, null);
        this.paths = buildArray(this.cols, this.rows, null);
        var keys = Object.keys(cameFrom);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var current = stv(key);

            // Distance map
            this.dists[current.x][current.y] = distance[key];

            // Generate path direction for every tile
            var val = cameFrom[key];
            if (val !== null) {
                // Subtract vectors to determine direction
                var next = stv(val);
                var dir = next.sub(current);
                // Fill tile with direction
                if (dir.x < 0) this.paths[current.x][current.y] = 'left';
                if (dir.y < 0) this.paths[current.x][current.y] = 'up';
                if (dir.x > 0) this.paths[current.x][current.y] = 'right';
                if (dir.y > 0) this.paths[current.x][current.y] = 'down';
            }
        }
    }
}
/*
class Map {
    constructor() {
        // Entities
        this.enemies = [];
        this.towers = [];
        this.newEnemies = [];
        this.newTowers = [];

        // Grids
        this.dists;         // map of distance to exit
        // 0 = empty, 1 = wall, 2 = enemy-only, 3 = tower-only
        this.grid;          // map of tiles
        this.paths;         // map of directions to reach exit
        this.visitMap;      // map of whether exit can be reached
        this.walkMap;       // map of walkability

        // Important tiles
        this.exit;
        this.spawnpoints = [];

        // Misc
        this.cols;
        this.name = 'map';
        this.rows;
        this.waves = -1;    // -1 for unlimited waves

        // Map generation settings
        this.min = 15;              // minimum distance from spawn to exit
        this.numSpawns = parseInt(
            document.getElementById('difficulty').value
        ) + 1;
        this.wallCoverage = 0.1;    // approx. percentage of map to be wall
    }

    // Set dimensions
    dim() {
        this.cols = grid.length;
        this.rows = grid[0].length;
    }

    onCreate() {
        if (typeof this.grid === 'undefined') {
            if (typeof this.cols === 'undefined') this.cols = resizeMap().x;
            if (typeof this.rows === 'undefined') this.rows = resizeMap().y;
            this.randomMap();
        } else {
            this.cols = this.grid.length;
            this.rows = this.grid[0].length;
            resizeCanvas(this.cols * ts, this.rows * ts, true);
        }
        if (
            typeof this.dists === 'undefined' ||
            typeof this.paths === 'undefined'
        ) {
            this.recalculate();
        }
    }

    // Generate random map
    randomMap() {
        // Generate empty tiles and walls
        this.grid = [];
        for (var x = 0; x < this.cols; x++) {
            this.grid[x] = [];
            for (var y = 0; y < this.rows; y++) {
                this.grid[x][y] = random() < this.wallCoverage ? 1 : 0;
            }
        }
        this.walkMap = this.makeWalkMap();

        // Generate exit and remove walls that are adjacent
        this.exit = this.getEmpty();
        var adj = neighbors(this.walkMap, this.exit.x, this.exit.y, 1);
        for (var i = 0; i < adj.length; i++) {
            var n = stv(adj[i]);
            this.grid[n.x][n.y] = 0;
        }

        // Generate enemy spawnpoints and ensure exit is possible
        this.spawnpoints = [];
        this.visitMap = this.makeVisitMap(this.walkMap);
        for (var i = 0; i < this.numSpawns; i++) {
            var s;
            while (true) {
                s = this.getEmpty();
                if (s.dist(this.exit) >= this.min && this.visitMap[vts(s)]) {
                    break;
                }
            }
            this.spawnpoints.push(s);
        }

        // Generate maps
        this.recalculate();
    }
}
*/
