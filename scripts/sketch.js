var divWidth;
var divHeight;

var enemies;
var newEnemies;
var towers;
var newTowers;

var grid;
var walkMap;            // map of walkable tiles
var pathMap;            // map to exit
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
    if (!isWalkable(col, row)) return false;
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
function isWalkable(col, row) {
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

// Generates shortest path to exit from every map tile
// Algorithm from https://www.redblobgames.com/pathfinding/tower-defense/
function updatePaths() {
    walkable();
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var cameFrom = {};
    cameFrom[target] = null;

    // Fill cameFrom for every grid coordinate
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var gridPos = stv(current);
        var neighbors = getNeighbors(gridPos.x, gridPos.y);

        for (var i = 0; i < neighbors.length; i++) {
            var next = neighbors[i];
            if (!(next in cameFrom)) {
                frontier.push(next);
                cameFrom[next] = current;
            }
        }
    }

    // Generate path direction for every grid coordinate
    pathMap = buildMap(cols, rows, null);
    var keys = Object.keys(cameFrom);
    for (var i = 0; i < keys.length; i++) {
        var curKey = keys[i];
        var curVal = cameFrom[curKey];
        if (curKey === null || curVal === null) continue;
        // Add vectors to determine which direction
        var current = stv(curKey);
        var next = stv(curVal);
        var dir = next.sub(current);
        // Fill tile with direction
        if (dir.x < 0) pathMap[current.x][current.y] = 'left';
        if (dir.y < 0) pathMap[current.x][current.y] = 'up';
        if (dir.x > 0) pathMap[current.x][current.y] = 'right';
        if (dir.y > 0) pathMap[current.x][current.y] = 'down';
    }
}

function updateStatus() {
    document.getElementById('wave').innerHTML = 'Wave ' + wave;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}

// Update map indicating walkability of each tile (0 = walkable)
function walkable() {
    walkMap = [];
    for (var col = 0; col < cols; col++) {
        walkMap[col] = [];
        for (var row = 0; row < rows; row++) {
            walkMap[col][row] = isWalkable(col, row) ? 0 : 1;
        }
    }
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
    // TODO update() maybe?
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (!paused) {
            t.target(t.visible(enemies.concat(towers)));
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
    if (between(mouseX, 0, width) && between(mouseY, 0, height)) {
        var t = gridPos(mouseX, mouseY);
        if (isEmpty(t.x, t.y)) {
            newTowers.push(createTower(t.x, t.y, tower.laser));
            toUpdate = true;
        }
    }
}

/*
var divw;
var divh;

var enemies;
var newEnemies;
var towers;
var newTowers;
var selected = 'laser';

var grid;
var walkMap;
var paths;
var spawnpoints;
var exit;

var cols;
var rows;
var ts = 24;            // tile size
var zoom = 2;

var paused;
var maxHealth;
var health;
var cash;
var wave;

var gridMode = true;    // MAKE THIS ALWAYS ON NO MATTER WHAT
var pathMode = false;   // GET RID OF THIS
var spawnCount = 1;
var tHold = 1;          // turning threshold, put this in code itself rather than var
var wallChance = 0.1;


// Misc functions

// Create entity at mouse position
function drawTower() {
    var t = getTile(mouseX, mouseY);
    switch (selected) {
        case 'laser':
            newTowers.push(createTower(t.x, t.y, tower.laser));
            break;
    }
    generatePaths();
}

function removeDead(entities) {
    for (var i = entities.length - 1; i >= 0; i--) {
        var e = entities[i];
        if (e.alive) continue;
        entities.splice(i, 1);
        e.onDeath();
    }
}


// Main p5 functions

function draw() {
    background(0);

    // Empty tiles and walls
    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
            var t = grid[col][row];
            if (t === 0 && gridMode) {
                noFill();
                stroke(255, 31);
                rect(col * ts, row * ts, ts, ts);
            } else if (t === 1) {
                fill(1, 50, 67);
                gridMode ? stroke(255, 31) : stroke(255, 63);
                rect(col * ts, row * ts, ts, ts);
            }
        }
    }

    // Spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        var t = spawnpoints[i];
        fill(0, 230, 64);
        stroke(255);
        rect(t.x * ts, t.y * ts, ts, ts);
        if (newEnemies.length > 0 && !paused) {
            var pos = getCenter(t.x, t.y);
            enemies.push(createEnemy(pos.x, pos.y, newEnemies.pop()));
        }
    }

    // Exit
    fill(207, 0, 15);
    stroke(255);
    rect(exit.x * ts, exit.y * ts, ts, ts);

    // Enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!paused) {
            var t = getTile(e.pos.x, e.pos.y);
            e.steer(paths[t.x][t.y]);
            e.update();
            if (t.x === exit.x && t.y === exit.y) {
                e.onExit();
                e.kill();
            }
        }
        if (isOutsideMap(e)) e.kill();
        e.draw();
    }

    // Towers
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (!paused) {
            var visible = t.getVisible(enemies);
            var names = t.toAffect.concat(t.toTarget);
            t.target(getByName(visible, names));
            t.update();
        }
        t.draw();
    }

    removeDead(enemies);
    removeDead(towers);
    towers = towers.concat(newTowers);
    newTowers = [];
}


// User input

function mousePressed() {
    // TODO do not use any kind of function here, just put switch here directly
    drawTower();
}
*/
