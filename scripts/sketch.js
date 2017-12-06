var divWidth;
var divHeight;

var enemies;
var newEnemies;
var towers;
var newTowers;

var grid;
var distMap;            // map of distances from exit
var pathMap;            // map to exit
var visitedMap;         // map of visited tiles
var walkMap;            // map of walkable tiles
var toUpdate = false;   // flag to update paths
var spawnpoints;
var exit;

var cols;
var rows;
var ts = 24;            // tile size
var tileZoom = 2;

var paused;
var selected = 'laser';

var cash;
var health;
var maxHealth;
var wave;

var spawnCool = 40;     // number of ticks between spawning enemies
var scd = 0;            // number of ticks until next spawn

var numSpawns = 1;      // number of enemy spawnpoints to generate
var wallChance = 0.1;


// Misc functions

// Check if blocking a tile would invalidate paths to exit
function checkValid(col, row) {
    var walkMap = walkable(grid);
    walkMap[col][row] = 1;
    var vMap = visited(walkMap);

    // Check spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        if (!vMap[vts(spawnpoints[i])]) return false;
    }

    // Check each enemy
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!vMap[vts(gridPos(e.pos.x, e.pos.y))]) return false;
    }

    return true;
}

// Create a wave of enemies to spawn
// TODO consider pausing inside
function createWave(pattern) {
    newEnemies = [];
    for (var i = 0; i < pattern.length; i++) {
        var t = pattern[i];
        if (Array.isArray(t)) {
            if (t.length === 1) {
                newEnemies.push(t[0]);
            } else if (t.length > 1) {
                for (var j = 0; j < t[1]; j++) {
                    newEnemies.push(t[0]);
                }
            }
        } else {
            newEnemies.push(t);
        }
    }
}

function generateMap() {
    // Generate empty tiles and walls
    grid = [];
    for (var x = 0; x < cols; x++) {
        grid[x] = [];
        for (var y = 0; y < rows; y++) {
            grid[x][y] = random() < wallChance ? 1 : 0;
        }
    }

    // Generate exit
    exit = getEmpty();

    // Generate enemy spawnpoints
    spawnpoints = [];
    for (var i = 0; i < numSpawns; i++) {
        spawnpoints.push(getEmpty());
    }

    // Generate pathfinding map
    updatePaths();
}

// Return an empty grid coordinate
function getEmpty() {
    while (true) {
        var gridPos = randomGridPos();
        if (isEmpty(gridPos.x, gridPos.y)) return gridPos;
    }
}

// Find tower at specific grid coordinate
function getTower(col, row) {
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (t.gridPos.x === col && t.gridPos.y === row) return t;
    }
    return null;
}

// Check if map coordinate is empty
function isEmpty(col, row) {
    // Check if not walkable
    if (!isWalkable(grid, col, row)) return false;
    // Check if spawnpoint
    if (typeof spawnpoints !== 'undefined') {
        for (var i = 0; i < spawnpoints.length; i++) {
            var s = spawnpoints[i];
            if (s.x === col && s.y === row) return false;
        }
    }
    // Check if exit
    if (typeof exit !== 'undefined' && exit.x === col && exit.y === row) {
        return false;
    }
    return true;
}

// Check if map coordinate is walkable
function isWalkable(grid, col, row) {
    // Check if wall
    if (grid[col][row] === 1) return false;
    // Check if tower
    if (getTower(col, row)) return false;
    return true;
}

// Check if entity is outside map
function outsideMap(e) {
    return outsideRect(e.pos.x, e.pos.y, 0, 0, width, height);
}

// Return a random grid coordinate
function randomGridPos() {
    var col = floor(random(cols));
    var row = floor(random(rows));
    return createVector(col, row);
}

// Remove dead entities
// TODO onDeath()
function removeDead(entities) {
    for (var i = entities.length - 1; i >= 0; i--) {
        var e = entities[i];
        if (e.alive) continue;
        entities.splice(i, 1);
    }
}

function resetGame() {
    // Clear all entities
    enemies = [];
    newEnemies = [];
    towers = [];
    newTowers = [];
    // Reset all stats
    paused = true;
    health = 100;
    maxHealth = health;
    cash = 150;
    wave = 1;
    // Reset map
    generateMap();
    
}

// Sets tile width and height based on canvas size and map dimensions
function resizeTiles() {
    var div = document.getElementById('sketch-holder');
    cols = floor(div.offsetWidth / ts);
    rows = floor(div.offsetHeight / ts);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Display tower information
function updateInfo(t) {
    var name = document.getElementById('name');
    name.innerHTML = '<span style="color:rgb(' + t.color[0] + ',' +
    t.color[1] + ',' + t.color[2] + ')">' + t.name.capitalize() +
    ' Tower' + '</span>';
    document.getElementById('damage').innerHTML = 'Damage: ' + t.damage;
    document.getElementById('range').innerHTML = 'Range: ' + t.range;
    document.getElementById('speed').innerHTML = 'Speed: ' + t.cooldown;
}

// Generates shortest path to exit from every map tile
// Algorithm from https://www.redblobgames.com/pathfinding/tower-defense/
function updatePaths() {
    walkMap = walkable(grid);
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var cameFrom = {};
    cameFrom[target] = null;
    var distance = {};
    distance[target] = 0;

    // Fill cameFrom for every grid coordinate
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var gridPos = stv(current);
        var neighbors = getNeighbors(walkMap, gridPos.x, gridPos.y);

        for (var i = 0; i < neighbors.length; i++) {
            var next = neighbors[i];
            if (!(next in cameFrom)) {
                frontier.push(next);
                cameFrom[next] = current;
                distance[next] = 1 + distance[current];
            }
        }
    }

    // Generate usable maps
    distMap = buildMap(cols, rows, null);
    pathMap = buildMap(cols, rows, null);
    var keys = Object.keys(cameFrom);
    for (var i = 0; i < keys.length; i++) {
        var curKey = keys[i];
        var curVal = cameFrom[curKey];
        if (curKey === null) continue;
        var current = stv(curKey);

        // Distance map
        distMap[current.x][current.y] = distance[curKey];

        // Generate path direction for every grid coordinate
        if (curVal !== null) {
            // Subtract vectors to determine which direction
            var next = stv(curVal);
            var dir = next.sub(current);
            // Fill tile with direction
            if (dir.x < 0) pathMap[current.x][current.y] = 'left';
            if (dir.y < 0) pathMap[current.x][current.y] = 'up';
            if (dir.x > 0) pathMap[current.x][current.y] = 'right';
            if (dir.y > 0) pathMap[current.x][current.y] = 'down';
        }
    }
}

// Update display with wave, health, and cash
function updateStatus() {
    document.getElementById('wave').innerHTML = 'Wave ' + wave;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}

// Return status of whether a path can be visited
function visited(walkMap) {
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var visited = {};
    visited[target] = true;

    // Fill visited for every grid coordinate
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var gridPos = stv(current);
        var neighbors = getNeighbors(walkMap, gridPos.x, gridPos.y);

        for (var i = 0; i < neighbors.length; i++) {
            var next = neighbors[i];
            if (!(next in visited)) {
                frontier.push(next);
                visited[next] = true;
            }
        }
    }

    return visited;
}

// Update map indicating walkability of each tile (0 = walkable)
function walkable(grid) {
    var walkMap = [];
    for (var col = 0; col < cols; col++) {
        walkMap[col] = [];
        for (var row = 0; row < rows; row++) {
            walkMap[col][row] = isWalkable(grid, col, row) ? 0 : 1;
        }
    }
    return walkMap;
}


// Main p5 functions

function setup() {
    var div = document.getElementById('sketch-holder');
    var canvas = createCanvas(div.offsetWidth, div.offsetHeight);
    canvas.parent('sketch-holder');
    // Setup tile size and reset game
    resizeTiles();
    resetGame();
}

function draw() {
    background(0);

    // Update spawn cooldown
    if (scd > 0) scd--;

    // Draw empty tiles and walls
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            var t = grid[x][y];
            t === 0 ? noFill() : fill(1, 50, 67);
            stroke(255, 31);
            rect(x * ts, y * ts, ts, ts);
        }
    }

    // Draw and update spawnpoints
    // TODO improve cooldown system, perhaps change spacing between enemies
    for (var i = 0; i < spawnpoints.length; i++) {
        var s = spawnpoints[i];
        stroke(255);
        fill(0, 230, 64);
        rect(s.x * ts, s.y * ts, ts, ts);
        // Spawning enemies
        if (newEnemies.length > 0 && scd === 0 && !paused) {
            var c = center(s.x, s.y);
            enemies.push(createEnemy(c.x, c.y, newEnemies.pop()));
            scd = spawnCool;
        }
    }

    // Draw exit
    stroke(255);
    fill(207, 0, 15);
    rect(exit.x * ts, exit.y * ts, ts, ts);

    // Enemies
    // TODO onExit()
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!paused) {
            e.steer();
            e.update();
        }
        // Kill if outside map
        if (outsideMap(e)) e.kill();
        // Kill if at center of exit tile
        var c = center(exit.x, exit.y);
        if (atTileCenter(e.pos.x, e.pos.y, c.x, c.y)) e.kill();
        e.draw();
    }

    // Towers
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (!paused) {
            if (t.canFire()) {
                t.onTarget(t.visible(enemies));
                t.resetCooldown();
            }
            t.update();
        }
        if (outsideMap(t)) t.kill();
        t.draw();
    }

    removeDead(enemies);
    removeDead(towers);
    
    towers = towers.concat(newTowers);
    newTowers = [];

    if (toUpdate) {
        updatePaths();
        toUpdate = false;
    }
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 49:
            // 1
            selected = 'laser';
            break;
        case 50:
            // 2
            selected = 'sniper';
            break;
        case 219:
            // Left bracket
            if (ts > 16) {
                ts -= tileZoom;
                resizeTiles();
                resetGame();
            }
            break;
        case 221:
            // Right bracket
            if (ts < 40) {
                ts += tileZoom;
                resizeTiles();
                resetGame();
            }
            break;
    }
}

function mousePressed() {
    if (mouseInMap()) {
        var p = gridPos(mouseX, mouseY);
        // Update tower info
        var t = getTower(p.x, p.y);
        if (t) {
            updateInfo(t);
        } else if (isEmpty(p.x, p.y) && checkValid(p.x, p.y)) {
            var n = createTower(p.x, p.y, tower[selected]);
            updateInfo(n);
            newTowers.push(n);
            toUpdate = true;
        }
    }
}
