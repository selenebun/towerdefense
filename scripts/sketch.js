var enemies = [];
var projectiles = [];
var towers = [];
var newEnemies = [];
var newProjectiles = [];
var newTowers = [];

var cols;
var rows;
var tileZoom = 2;
var ts = 24;            // tile size
var zoomDefault = ts;

var custom;             // custom map JSON
var display;            // display tiles
var dists;              // distance to exit
var grid;               // tile type (0 = empty, 1 = wall, 2 = path, 3 = tower)
var palette;            // what to display for each display tile
var paths;              // direction to reach exit
var visitMap;           // whether exit can be reached
var walkMap;            // walkability map

var exit;
var spawnpoints = [];

var cash;
var health;
var maxHealth;
var wave;

var spawnCool;          // number of ticks between spawning enemies

var selected;
var towerType;

// TODO add more functionality to god mode
var godMode = false;    // make player immortal for test purposes
var paused;             // whether to update or not
var scd;                // number of ticks to next spawn cycle
var toCooldown;         // flag to reset spawning cooldown
var toPathfind;         // flag to update enemy pathfinding
var toPlace;            // flag to place a tower

var minDist = 15;       // minimum distance between spawnpoint and exit
var resistance = 0.3;   // percentage of damage blocked by resistance
var sellConst = 0.8;    // ratio of tower cost to sell price
var wallCover = 0.1;    // percentage of map covered by walls

var presetCools = [
    40,
    20,
    20,
    40,
    20,
    10,
    10,
    20,
    10,
    10
];
var presetWaves = [
    [['weak', 50]],
    [['weak', 25]],
    [
        ['weak', 15],
        ['strong', 10]
    ],
    [['fast', 25]],
    [
        ['strong', 50],
        ['fast', 25]
    ],
    [
        ['strong', 100],
        ['fast', 50]
    ],
    [
        ['strong', 100],
        ['fast', 50]
    ],
    [
        ['taunt', 'strong', 'strong', 'strong', 'strong', 10]
    ],
    [
        ['strong', 100],
        ['fast', 50]
    ],
    [
        ['strong', 100],
        ['fast', 50],
        ['taunt', 'strong', 'strong', 50]
    ]
];


// Misc functions

// Spawn a group of enemies, alternating if multiple types
function addEnemies(enemies, count) {
    if (!Array.isArray(enemies)) enemies = [enemies];
    for (var i = 0; i < count; i++) {
        for (var j = 0; j < enemies.length; j++) {
            newEnemies.push(enemies[j]);
        }
    }
}

// Buy and place a tower if player has enough money
function buy(t) {
    if (godMode || cash >= t.cost) {
        if (!godMode) cash -= t.cost;
        selected = t;
        toPlace = false;
        if (grid[t.gridPos.x][t.gridPos.y] === 0) toPathfind = true;
        updateInfo(t);
        newTowers.push(t);
    }
}

// Check if all conditions for placing a tower are true
function canPlace(col, row) {
    if (!toPlace) return false;
    if (grid[col][row] === 3) return true;
    if (grid[col][row] === 1 || grid[col][row] === 2) return false;
    if (!empty(col, row) || !placeable(col, row)) return false;
    return true;
}

// Check if spawn cooldown is done and enemies are available to spawn
function canSpawn() {
    return newEnemies.length > 0 && scd === 0;
}

// Clear tower information
function clearInfo() {
    document.getElementById('info-div').style.display = 'none';
}

// Add enemies to spawn
function createWave(pattern) {
    if (typeof pattern === 'undefined') pattern = [];
    for (var i = 0; i < pattern.length; i++) {
        var group = pattern[i];
        var count = group.pop();
        addEnemies(group, count);
    }
}

// Check if all conditions for showing a range are true
function doRange() {
    return mouseInMap() && toPlace && typeof towerType !== 'undefined';
}

// Check if tile is empty
function empty(col, row) {
    // Check if not walkable
    if (!walkable(col, row)) return false;

    // Check if spawnpoint
    for (var i = 0; i < spawnpoints.length; i++) {
        var s = spawnpoints[i];
        if (s.x === col && s.y === row) return false;
    }

    // Check if exit
    if (typeof exit !== 'undefined') {
        if (exit.x === col && exit.y === row) return false;
    }
    
    return true;
}

// Return map string
function exportMap() {
    // Convert spawnpoints into a JSON-friendly format
    var spawns = [];
    for (var i = 0; i < spawnpoints.length; i++) {
        var s = spawnpoints[i];
        spawns.push([s.x, s.y]);
    }
    return JSON.stringify({
        // Grids
        grid: grid,
        paths: paths,
        // Important tiles
        exit: [exit.x, exit.y],
        spawnpoints: spawns,
        // Misc
        cols: cols,
        rows: rows
    });
}

// Get an empty tile
function getEmpty() {
    while (true) {
        var t = randomTile();
        if (empty(t.x, t.y)) return t;
    }
}

// Find tower at specific tile, otherwise return null
function getTower(col, row) {
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (t.gridPos.x === col && t.gridPos.y === row) return t;
    }
    return null;
}

// Return map of visitability
function getVisitMap(walkMap) {
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var visited = {};
    visited[target] = true;

    // Fill visited for every tile
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var t = stv(current);
        var adj = neighbors(walkMap, t.x, t.y, true);

        for (var i = 0; i < adj.length; i++) {
            var next = adj[i];
            if (!(next in visited)) {
                frontier.push(next);
                visited[next] = true;
            }
        }
    }

    return visited;
}

// Return walkability map
function getWalkMap() {
    var walkMap = [];
    for (var x = 0; x < cols; x++) {
        walkMap[x] = [];
        for (var y = 0; y < rows; y++) {
            walkMap[x][y] = walkable(x, y);
        }
    }
    return walkMap;
}

// Set spawn cooldown and generate enemies
// TODO better random wave generation
// TODO fix wave bug (only first branch of if statement causes it)
function getWave() {
    if (wave < presetWaves.length) {
        spawnCool = presetCools[wave];
        return presetWaves[wave];
    } else {
        spawnCool = randint(5, 21);
        return random([
            [
                ['strong', 100],
                ['fast', 50]
            ],
            [
                ['strong', 100]
            ],
            [
                ['fast', 100]
            ],
            [
                ['taunt', 'strong', 'strong', 'strong', 'strong', 100],
                ['fast', 50]
            ],
            [
                ['taunt', 'strong', 'strong', 100],
                ['fast', 25],
                ['taunt', 'strong', 'strong', 100],
                ['fast', 50]
            ]
        ]);
    }
}

// Load a map from a map string
function importMap(str) {
    try {
        custom = JSON.parse(str);
        document.querySelector('#map [value="custom"]').selected = true;
        resetGame();
    } catch (err) {}
}

// Load map from template
// Always have an exit and spawnpoints if you do not have a premade grid
// TODO display and palette
function loadMap() {
    var name = document.getElementById('map').value;
    
    if (name === 'custom' && custom) {
        // Grids
        grid = copyArray(custom.grid);
        paths = copyArray(custom.paths);
        
        // Important tiles
        exit = createVector(custom.exit[0], custom.exit[1]);
        spawnpoints = [];
        for (var i = 0; i < custom.spawnpoints.length; i++) {
            var s = custom.spawnpoints[i];
            spawnpoints.push(createVector(s[0], s[1]));
        }
        // Misc
        cols = custom.cols;
        rows = custom.rows;

        // Display tiles
        display = copyArray(grid);
        palette = [
            function(col, row) {
                stroke(255, 31);
                noFill();
                rect(col * ts, row * ts, ts, ts);
            },
            [1, 50, 67],
            function(col, row) {
                stroke(255, 31);
                noFill();
                rect(col * ts, row * ts, ts, ts);
            },
            [1, 50, 67]
        ];

        resizeFit();
    } else if (name in maps) {
        var m = maps[name];

        // Grids
        grid = m.grid;
        paths = m.paths;
        // Important tiles
        exit = createVector(m.exit[0], m.exit[1]);
        spawnpoints = [];
        for (var i = 0; i < m.spawnpoints.length; i++) {
            var s = m.spawnpoints[i];
            spawnpoints.push(createVector(s[0], s[1]));
        }
        // Misc
        cols = m.cols;
        rows = m.rows;

        // Display tiles
        display = copyArray(grid);
        palette = [
            function(col, row) {
                stroke(255, 31);
                noFill();
                rect(col * ts, row * ts, ts, ts);
            },
            [1, 50, 67],
            function(col, row) {
                stroke(255, 31);
                noFill();
                rect(col * ts, row * ts, ts, ts);
            },
            [1, 50, 67]
        ];

        resizeFit();
    } else {
        resizeMax();
        randomMap();
    }

    recalculate();
}

// Increment wave counter
function nextWave() {
    createWave(getWave());
    wave++;
}

function outsideMap(e) {
    return outsideRect(e.pos.x, e.pos.y, 0, 0, width, height);
}

// Toggle pause state
function pause() {
    paused = !paused;
}

// Return false if blocking a tile would invalidate paths to exit
function placeable(col, row) {
    var walkMap = getWalkMap();
    walkMap[col][row] = false;
    var visitMap = getVisitMap(walkMap);

    // Check spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        if (!visitMap[vts(spawnpoints[i])]) return false;
    }

    // Check each enemy
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!visitMap[vts(gridPos(e.pos.x, e.pos.y))]) return false;
    }

    return true;
}

// Generate random map
function randomMap() {
    // Generate empty tiles and walls
    grid = [];
    for (var x = 0; x < cols; x++) {
        grid[x] = [];
        for (var y = 0; y < rows; y++) {
            grid[x][y] = random() < wallCover ? 1 : 0;
        }
    }
    walkMap = getWalkMap();

    // Copy to display grid
    display = copyArray(grid);
    palette = [
        function(col, row) {
            stroke(255, 31);
            noFill();
            rect(col * ts, row * ts, ts, ts);
        },
        [1, 50, 67]
    ];

    // Generate exit and remove walls that are adjacent
    exit = getEmpty();
    var adj = neighbors(walkMap, exit.x, exit.y, false);
    for (var i = 0; i < adj.length; i++) {
        var n = stv(adj[i]);
        grid[n.x][n.y] = 0;
    }

    // Generate enemy spawnpoints and ensure exit is possible
    spawnpoints = [];
    visitMap = getVisitMap(walkMap);
    var numSpawns = parseInt(document.getElementById('difficulty').value) + 1;
    for (var i = 0; i < numSpawns; i++) {
        var s;
        // Try to place spawnpoint
        for (var j = 0; j < 100; j++) {
            s = getEmpty();
            while (!visitMap[vts(s)]) s = getEmpty();
            if (s.dist(exit) >= minDist) break;
        }
        spawnpoints.push(s);
    }
}

// Random grid coordinate
function randomTile() {
    return createVector(randint(cols), randint(rows));
}

// Recalculate pathfinding maps
// Algorithm from https://www.redblobgames.com/pathfinding/tower-defense/
function recalculate() {
    walkMap = getWalkMap();
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var cameFrom = {};
    var distance = {};
    cameFrom[target] = null;
    distance[target] = 0;

    // Fill cameFrom and distance for every tile
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var t = stv(current);
        var adj = neighbors(walkMap, t.x, t.y, true);

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
    dists = buildArray(cols, rows, null);
    var newPaths = buildArray(cols, rows, null);
    var keys = Object.keys(cameFrom);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var current = stv(key);

        // Distance map
        dists[current.x][current.y] = distance[key];

        // Generate path direction for every tile
        var val = cameFrom[key];
        if (val !== null) {
            // Subtract vectors to determine direction
            var next = stv(val);
            var dir = next.sub(current);
            // Fill tile with direction
            if (dir.x < 0) newPaths[current.x][current.y] = 'left';
            if (dir.y < 0) newPaths[current.x][current.y] = 'up';
            if (dir.x > 0) newPaths[current.x][current.y] = 'right';
            if (dir.y > 0) newPaths[current.x][current.y] = 'down';
        }
    }

    // Preserve old paths on path tiles
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            if (grid[x][y] === 2) newPaths[x][y] = paths[x][y];
        }
    }

    paths = newPaths;
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

// TODO vary health based on difficulty
function resetGame() {
    loadMap();
    // Clear all entities
    enemies = [];
    projectiles = [];
    towers = [];
    newEnemies = [];
    newProjectiles = [];
    newTowers = [];
    // Get difficulty
    var d = parseInt(document.getElementById('difficulty').value);
    // Reset all stats
    health = [40, 40, 40, 40][d];
    maxHealth = health;
    cash = [40, 55, 65, 65][d];
    wave = 0;
    // Reset all flags
    paused = true;
    scd = 0;
    toCooldown = false;
    toPathfind = false;
    toPlace = false;
    // Start game
    nextWave();
}

// Changes tile size to fit everything onscreen
function resizeFit() {
    var div = document.getElementById('sketch-holder');
    var ts1 = floor(div.offsetWidth / cols);
    var ts2 = floor(div.offsetHeight / rows);
    ts = Math.min(ts1, ts2);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Resizes cols, rows, and canvas based on tile size
function resizeMax() {
    var div = document.getElementById('sketch-holder');
    cols = floor(div.offsetWidth / ts);
    rows = floor(div.offsetHeight / ts);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Sell a tower
function sell(t) {
    selected = null;
    if (grid[t.gridPos.x][t.gridPos.y] === 0) toPathfind = true;
    clearInfo();
    cash += t.sellPrice();
    t.kill();
}

// Set a tower to place
function setPlace(t) {
    towerType = t;
    toPlace = true;
    updateInfo(createTower(0, 0, tower[towerType]));
}

// Visualize range of tower
function showRange(t, cx, cy) {
    stroke(255);
    fill(t.color[0], t.color[1], t.color[2], 63);
    ellipse(cx, cy, (t.range + 0.5) * ts * 2, (t.range + 0.5) * ts * 2);
}

// Display tower information
// TODO maybe display average DPS
function updateInfo(t) {
    var name = document.getElementById('name');
    name.innerHTML = '<span style="color:rgb(' + t.color + ')">' + t.title +
    '</span>';
    document.getElementById('cost').innerHTML = 'Cost: $' + t.cost;
    document.getElementById('sellPrice').innerHTML = 'Sell price: $' +
    t.sellPrice();
    document.getElementById('damage').innerHTML = 'Damage: ' + t.getDamage();
    document.getElementById('type').innerHTML = 'Type: ' +
    t.type.toUpperCase();
    document.getElementById('range').innerHTML = 'Range: ' + t.range;
    document.getElementById('cooldown').innerHTML = 'Avg. Cooldown: ' +
    t.getCooldown().toFixed(2) + 's';
    document.getElementById('info-div').style.display = 'block';
}

// Update game status display with wave, health, and cash
function updateStatus() {
    waveText = 'Wave ' + wave;
    document.getElementById('wave').innerHTML = waveText;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}

// Return whether tile is walkable
function walkable(col, row) {
    // Check if wall or tower-only tile
    if (grid[col][row] === 1 || grid[col][row] === 3) return false;
    // Check if tower
    if (getTower(col, row)) return false;
    return true;
}


// Main p5 functions

function setup() {
    var div = document.getElementById('sketch-holder');
    var canvas = createCanvas(div.offsetWidth, div.offsetHeight);
    canvas.parent('sketch-holder');
    resetGame();
}

// TODO indicate whether tower can be placed while hovering
// TODO show range of selected tower
function draw() {
    background(0);

    // Update game status display
    updateStatus();

    // Update spawn cooldown
    if (!paused && scd > 0) scd--;

    // Draw basic tiles
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            var g = palette[display[x][y]];
            if (typeof g === 'function') {
                g(x, y);
            } else {
                stroke(255, 31);
                fill(g);
                rect(x * ts, y * ts, ts, ts);
            }
        }
    }

    // Draw spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        stroke(255);
        fill(0, 230, 64);
        var s = spawnpoints[i];
        rect(s.x * ts, s.y * ts, ts, ts);
    }

    // Draw exit
    stroke(255);
    fill(207, 0, 15);
    rect(exit.x * ts, exit.y * ts, ts, ts);

    // Spawn enemies
    if (canSpawn() && !paused) {
        // Spawn same enemy for each spawnpoint
        var name = newEnemies.shift();
        for (var i = 0; i < spawnpoints.length; i++) {
            var s = spawnpoints[i];
            var c = center(s.x, s.y);
            enemies.push(createEnemy(c.x, c.y, enemy[name]));
        }
        // Reset cooldown
        toCooldown = true;
    }

    // Update and draw enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        
        // Update direction and position
        if (!paused) {
            e.steer();
            e.update();
        }

        // Kill if outside map
        if (outsideMap(e)) e.kill();

        // If at exit tile, kill and reduce player health
        if (atTileCenter(e.pos.x, e.pos.y, exit.x, exit.y)) e.onExit();

        // Draw
        e.draw();
    }

    // Update and draw towers
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];

        // Target enemies and update cooldowns
        if (!paused) {
            t.onTarget(enemies);
            t.update();
        }

        // Kill if outside map
        if (outsideMap(t)) t.kill();

        // Draw
        t.draw();
    }

    // Draw range of tower being placed
    // TODO indicate whether tower can be placed or not
    if (doRange()) {
        var p = gridPos(mouseX, mouseY);
        var c = center(p.x, p.y);
        var t = createTower(0, 0, tower[towerType]);
        showRange(t, c.x, c.y);

        // Indicate whether tower can be placed
        push();
        translate(c.x, c.y);
        rotate(PI / 4);
        stroke(255);
        if (canPlace(p.x, p.y)) {
            // Draw a green check mark
            fill(0, 230, 64);
        } else {
            // Draw a red X
            fill(207, 0, 15);
        }
        pop();
    }

    removeDead(enemies);
    removeDead(projectiles);
    removeDead(towers);

    projectiles = projectiles.concat(newProjectiles);
    towers = towers.concat(newTowers);
    newProjectiles = [];
    newTowers = [];

    // If player is dead, reset game
    if (health <= 0) resetGame();

    // Start next wave
    if (enemies.length === 0 && newEnemies.length === 0) {
        paused = true;
        nextWave();
    }

    // Reset spawn cooldown
    if (toCooldown) {
        scd = spawnCool;
        toCooldown = false;
    }

    // Recalculate pathfinding
    if (toPathfind) {
        recalculate();
        toPathfind = false;
    }
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 17:
            // Ctrl
            godMode = !godMode;
            break;
        case 27:
            // Esc
            toPlace = false;
            clearInfo();
            break;
        case 32:
            // Space
            pause();
            break;
        case 49:
            // 1
            setPlace('gun');
            break;
        case 50:
            // 2
            setPlace('laser');
            break;
        case 51:
            // 3
            setPlace('slow');
            break;
        case 52:
            // 4
            setPlace('sniper');
            break;
        case 53:
            // 5
            setPlace('bomb');
            break;
        case 54:
            // 6
            setPlace('poison');
            break;
        case 77:
            // M
            importMap(prompt('Input map string:'));
            break;
        case 82:
            // R
            resetGame();
            break;
        case 83:
            // S
            if (selected) sell(selected);
            break;
        case 88:
            // X
            copyToClipboard(exportMap());
            break;
        case 90:
            // Z
            ts = zoomDefault;
            resizeMax();
            resetGame();
            break;
        case 219:
            // Left bracket
            if (ts > 16) {
                ts -= tileZoom;
                resizeMax();
                resetGame();
            }
            break;
        case 221:
            // Right bracket
            if (ts < 40) {
                ts += tileZoom;
                resizeMax();
                resetGame();
            }
            break;
    }
}

function mousePressed() {
    if (!mouseInMap()) return;
    var p = gridPos(mouseX, mouseY);
    var t = getTower(p.x, p.y);
    
    if (t) {
        // Clicked on tower
        selected = t;
        toPlace = false;
        updateInfo(selected);
    } else if (canPlace(p.x, p.y)) {
        buy(createTower(p.x, p.y, tower[towerType]));
    }
}
