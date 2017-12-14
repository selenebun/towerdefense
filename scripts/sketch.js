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

var dists;              // distance to exit
var grid;               // tile type (0 = empty, 1 = wall, 2 = path, 3 = tower)
var paths;              // direction to reach exit
var visitMap;           // whether exit can be reached
var walkMap;            // walkability map

var exit;
var spawnpoints = [];

var cash;
var health;
var maxHealth;
var wave;
var maxWave;            // -1 for infinite waves

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
        ['taunt', 'strong', 'strong', 25]
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

// Check if all conditions for placing a tower are true
function canPlace() {
    return mouseInMap() && toPlace && typeof towerType !== 'undefined';
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

// TODO generate map, pathfinding if not present
// TODO copy grid with copyArray()
function loadMap(name) {
    resizeTiles();
    randomMap();
    maxWave = -1;
}

// Increment wave counter
function nextWave() {
    if (maxWave === -1 || wave < maxWave) {
        createWave(getWave());
        wave++;
    }
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

    // Generate maps
    recalculate();
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
    paths = buildArray(cols, rows, null);
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
            if (dir.x < 0) paths[current.x][current.y] = 'left';
            if (dir.y < 0) paths[current.x][current.y] = 'up';
            if (dir.x > 0) paths[current.x][current.y] = 'right';
            if (dir.y > 0) paths[current.x][current.y] = 'down';
        }
    }
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

// TODO reset more of these things
// TODO make health vary by difficulty
function resetGame() {
    loadMap(document.getElementById('map').value);
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
    health = 30;
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

// Resizes cols, rows, and canvas based on tile size
function resizeTiles() {
    var div = document.getElementById('sketch-holder');
    cols = floor(div.offsetWidth / ts);
    rows = floor(div.offsetHeight / ts);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Sell a tower
function sell(t) {
    selected = null;
    toPathfind = true;
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
// TODO display average DPS and average cooldown time in seconds
function updateInfo(t) {
    var name = document.getElementById('name');
    name.innerHTML = '<span style="color:rgb(' + t.color + ')">' + t.title +
    '</span>';
    document.getElementById('cost').innerHTML = 'Cost: $' + t.cost;
    document.getElementById('sellPrice').innerHTML = 'Sell price: $' +
    t.sellPrice();
    document.getElementById('damage').innerHTML = 'Damage: ' +
    rangeText(t.damageMin, t.damageMax);
    document.getElementById('range').innerHTML = 'Range: ' + t.range;
    document.getElementById('cooldown').innerHTML = 'Cooldown: ' +
    rangeText(t.cooldownMin, t.cooldownMax);
    document.getElementById('info-div').style.display = 'block';
}

// Update game status display with wave, health, and cash
function updateStatus() {
    waveText = 'Wave ' + wave + (maxWave === -1 ? '' : '/' + maxWave);
    document.getElementById('wave').innerHTML = waveText;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}

// Return whether tile is walkable
function walkable(col, row) {
    // Check if wall or tower-only tile
    if (typeof grid[col] === 'undefined') console.log(grid);
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

// TODO change color of tower-only tiles (maybe to grey?)
function draw() {
    background(0);

    // Update game status display
    updateStatus();

    // Update spawn cooldown
    if (!paused && scd > 0) scd--;

    // Draw empty tiles and walls
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            stroke(255, 31);
            var t = grid[x][y];
            if (t === 0) noFill();          // empty
            if (t === 1) fill(1, 50, 67);   // wall
            if (t === 2) noFill();          // enemy-only
            if (t === 3) fill(1, 50, 67);   // tower-only
            rect(x * ts, y * ts, ts, ts);
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
    if (canPlace()) {
        var p = gridPos(mouseX, mouseY);
        var c = center(p.x, p.y);
        var t = createTower(0, 0, tower[towerType]);
        showRange(t, c.x, c.y);
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
            setPlace('sniper');
            break;
        case 82:
            // R
            resetGame();
            break;
        case 83:
            // S
            if (selected) sell(selected);
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

// TODO clean up and move to subroutines
// TODO only update path if tower on walkable tile
// TODO only allow placing on the correct tile types
function mousePressed() {
    if (mouseInMap()) {
        var p = gridPos(mouseX, mouseY);
        var t = getTower(p.x, p.y);
        if (t) {
            selected = t;
            toPlace = false;
            updateInfo(selected);
        } else if (empty(p.x, p.y) && placeable(p.x, p.y) && toPlace) {
            var n = createTower(p.x, p.y, tower[towerType]);
            // Buy tower if enough money
            if (godMode || cash >= n.cost) {
                if (!godMode) cash -= n.cost;
                selected = n;
                toPlace = false;
                toPathfind = true;
                updateInfo(selected);
                newTowers.push(n);
            }
        }
    } else {
        selected = null;
        clearInfo();
    }
}

/*
var tileZoom = 2;
var ts = 24;

var curMap;
var mapName = 'random';

var cash;
var health;
var maxHealth;
var wave;

var paused = true;

var sellConst = 0.8;


// Misc functions

// Clear tower info display
function clearInfo() {
    document.getElementById('info-div').style.display = 'none';
}

function loadMap(name) {
    curMap = createMap(maps[name]);
}

// Toggle pause state
function pause() {
    paused = !paused;
}

function resetGame() {
    curMap.reset();
    // Get difficulty
    var d = parseInt(document.getElementById('difficulty').value);
    // Reset all stats
    health = [100, 100, 100, 100][d];
    maxHealth = health;
    cash = [40, 55, 65, 65][d];
    wave = 0;
    // Reset all flags
    paused = true;
}

/*
function resetGame() {
    // Clear all entities
    enemies = [];
    newEnemies = [];
    towers = [];
    newTowers = [];
    // Get difficulty
    var d = document.getElementById('difficulty').value;
    // Reset all stats
    health = 100;
    maxHealth = health;
    cash = {
        easy: 40,
        normal: 55,
        hard: 65,
        insane: 65
    }[d];
    wave = 0;
    // Misc settings
    numSpawns = {
        easy: 1,
        normal: 2,
        hard: 3,
        insane: 4
    }[d];
    // Reset all flags
    paused = true;
    scd = 0;
    toCooldown = false;
    toPlace = false;
    toUpdate = false;
    // Reset map
    generateMap();
    // Start game
    nextWave();
}
*/
/*
// Sets cols and rows based on tile size and map dimensions
function resizeMap() {
    var div = document.getElementById('sketch-holder');
    var cols = floor(div.offsetWidth / ts);
    var rows = floor(div.offsetHeight / ts);
    resizeCanvas(cols * ts, rows * ts, true);
    return createVector(cols, rows);
}

// Update tower info display
function updateInfo(t) {
    document.getElementById('name').innerHTML = '<span style="color:' +
    t.color + '">' + t.name + ' Tower</span>';
    document.getElementById('cost').innerHTML = 'Cost: $' + t.cost;
    document.getElementById('sellPrice').innerHTML = 'Sell price: $' +
    t.sellPrice();
    document.getElementById('damage').innerHTML = 'Damage: ' +
    textRange(t.damageMin, t.damageMax);
    document.getElementById('type').innerHTML = 'Type: ' + t.type;
    document.getElementById('range').innerHTML = 'Range: ' + t.range;
    document.getElementById('cooldown').innerHTML = 'Cooldown ' +
    textRange(t.cooldownMin, t.cooldownMax);
    document.getElementById('info-div').style.display = 'block;'
}

// Update display with wave, health, and cash
function updateStatus() {
    document.getElementById('wave').innerHTML = 'Wave ' + wave;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}


// Main p5 functions

function setup() {
    var div = document.getElementById('sketch-holder');
    var canvas = createCanvas(div.offsetWidth, div.offsetHeight);
    canvas.parent('sketch-holder');
    // Load map
    loadMap(maps.random);
}

function draw() {
    background(0);

    // Update game status display
    updateStatus();

    // Draw empty tiles and walls
    for (var x = 0; x < curMap.cols; x++) {
        for (var y = 0; y < curMap.rows; y++) {
            var t = curMap.grid[x][y];
            if (t === 0 || t === 2) noFill();
            if (t === 1 || t === 3) fill(1, 50, 67);
            stroke(255, 31);
            rect(x * ts, y * ts, ts, ts);
        }
    }

    // Draw spawnpoints
    for (var i = 0; i < curMap.spawnpoints.length; i++) {
        var s = curMap.spawnpoints[i];
        stroke(255);
        fill(0, 230, 64);
        rect(s.x * ts, s.y * ts, ts, ts);
    }

    // Spawn enemies
    
    // Draw exit
    stroke(255);
    fill(207, 0, 15);
    rect(curMap.exit.x * ts, curMap.exit.y * ts, ts, ts);
}

/*
function draw() {
    // Spawn enemies
    if (newEnemies.length > 0 && scd === 0 && !paused) {
        // Spawn same enemy for each spawnpoint
        var t = newEnemies.shift();
        for (var i = 0; i < spawnpoints.length; i++) {
            var s = spawnpoints[i];
            var c = center(s.x, s.y);
            enemies.push(createEnemy(c.x, c.y, t));
        }
        toCooldown = true;
    }

    // Draw exit
    stroke(255);
    fill(207, 0, 15);
    rect(exit.x * ts, exit.y * ts, ts, ts);

    // Enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!paused) {
            e.steer();
            e.update();
        }
        // Kill if outside map
        if (outsideMap(e)) e.kill();
        // If at center of exit tile, kill and reduce player health
        var c = center(exit.x, exit.y);
        if (atTileCenter(e.pos.x, e.pos.y, c.x, c.y)) {
            e.onExit();
            e.kill();
        }
        e.draw();
    }

    // Towers
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (!paused) {
            t.onTarget(enemies);
            t.update();
        }
        if (outsideMap(t)) t.kill();
        t.draw();
    }

    // Draw range of tower being placed
    if (mouseInMap() && toPlace && typeof towerType !== 'undefined') {
        var p = gridPos(mouseX, mouseY);
        var c = center(p.x, p.y);
        var t = createTower(0, 0, tower[towerType]);
        showRange(t, c.x, c.y);
    }

    removeDead(enemies);
    removeDead(towers);
    
    towers = towers.concat(newTowers);
    newTowers = [];

    if (health <= 0) resetGame();

    if (enemies.length === 0 && newEnemies.length === 0) {
        paused = true;
        nextWave();
    }

    if (toCooldown) {
        scd = spawnCool;
        toCooldown = false;
    }

    if (toUpdate) {
        updatePaths();
        toUpdate = false;
    }
}
*/


// User input

/*
var enemies;
var newEnemies;
var towers;
var newTowers;

var grid;
var distMap;                // map of distances from exit
var pathMap;                // map to exit
var walkMap;                // map of walkable tiles
var toUpdate = false;       // flag to update paths
var spawnpoints;
var exit;

var cols;
var rows;
var ts = 24;                // tile size
var tileZoom = 2;

var doLine = true;          // render tower line on attack
var doRange = true;         // render tower range
var paused;
var selected;
var sellConst = 0.8;
var toPlace = false;
var towerType;

var cash;
var health;
var maxHealth;
var wave;

var spawnCooldowns = [
    40,
    20,
    20,
    40,
    20,
    10
];
var waves = [
    [[enemy.weak, 50]],
    [[enemy.weak, 25]],
    [
        [enemy.weak, 15],
        [enemy.strong, 10]
    ],
    [[enemy.fast, 25]],
    [
        [enemy.strong, 50],
        [enemy.fast, 25]
    ],
    [
        [enemy.strong, 100],
        [enemy.fast, 50]
    ]
];

var resistance = 0.3;       // percent of damage blocked with resistance

var spawnCool = 40;         // number of ticks between spawning enemies
var scd = 0;                // number of ticks until next spawn
var toCooldown = false;     // flag to reset cooldown

var minExitDist = 15;       // minimum distance between spawnpoints and exit
var numSpawns;              // number of enemy spawnpoints to generate
var wallChance = 0.1;


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

// Buy a tower
function buy(t) {
    towerType = t;
    toPlace = true;
    updateInfo(createTower(0, 0, tower[towerType]));
}

// Create a wave of enemies to spawn
function createWave(pattern) {
    if (typeof pattern === 'undefined') pattern = [];
    for (var i = 0; i < pattern.length; i++) {
        var t = pattern[i];
        var count = t.pop();
        addEnemies(t, count);
    }
}

// Set spawn cooldown and generate enemies
function getWave() {
    if (wave < waves.length) {
        spawnCool = spawnCooldowns[wave];
        return waves[wave];
    } else {
        spawnCool = 10;
        return [
            [enemy.strong, 100],
            [enemy.fast, 100]
        ];
    }
}
/*
// Set spawn cooldown and generate enemies
function getWave() {
    var waves = [
        [[enemy.weak, 100]],
        [[enemy.weak, 50]],
        [[enemy.fast, 20]],
        [
            [enemy.weak, enemy.tank, 10],
        ],
        [[enemy.weak, 100]],
        [
            [enemy.fast, 25],
            [enemy.tank, 50]
        ]
    ];
    var cooldowns = [40, 20, 20, 40, 10, 20];
    // Set spawn cooldown and enemies
    if (wave < waves.length) {
        spawnCool = cooldowns[wave];
        return waves[wave];
    } else {
        spawnCool = Math.max(floor(random(0, 3) * 10), 1);
        switch (floor(random(3))) {
            case 0:
                return [[enemy.basic, 100]];
                break;
            case 1:
                return [[enemy.fast, 100]];
                break;
            case 2:
                return [[enemy.tank, 25]];
                break;
        }
    }
}
*//*

// Trigger next wave
function nextWave() {
    createWave(getWave());
    wave++;
}

// Check if entity is outside map
function outsideMap(e) {
    return outsideRect(e.pos.x, e.pos.y, 0, 0, width, height);
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
    // Get difficulty
    var d = document.getElementById('difficulty').value;
    // Reset all stats
    health = 100;
    maxHealth = health;
    cash = {
        easy: 40,
        normal: 55,
        hard: 65,
        insane: 65
    }[d];
    wave = 0;
    // Misc settings
    numSpawns = {
        easy: 1,
        normal: 2,
        hard: 3,
        insane: 4
    }[d];
    // Reset all flags
    paused = true;
    scd = 0;
    toCooldown = false;
    toPlace = false;
    toUpdate = false;
    // Reset map
    generateMap();
    // Start game
    nextWave();
}

// Sell a tower
function sell(t) {
    selected = null;
    clearInfo();
    cash += t.sellPrice();
    t.kill();
}

// Visualize range of tower
function showRange(t, cx, cy) {
    if (!doRange) return;
    stroke(255);
    fill(t.color + '3F');
    ellipse(cx, cy, t.range * ts, t.range * ts);
}


// Main p5 functions

function draw() {
    background(0);

    // Update game status display
    updateStatus();

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

    // Draw spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        var s = spawnpoints[i];
        stroke(255);
        fill(0, 230, 64);
        rect(s.x * ts, s.y * ts, ts, ts);
    }

    // Spawn enemies
    if (newEnemies.length > 0 && scd === 0 && !paused) {
        // Spawn same enemy for each spawnpoint
        var t = newEnemies.shift();
        for (var i = 0; i < spawnpoints.length; i++) {
            var s = spawnpoints[i];
            var c = center(s.x, s.y);
            enemies.push(createEnemy(c.x, c.y, t));
        }
        toCooldown = true;
    }

    // Draw exit
    stroke(255);
    fill(207, 0, 15);
    rect(exit.x * ts, exit.y * ts, ts, ts);

    // Enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!paused) {
            e.steer();
            e.update();
        }
        // Kill if outside map
        if (outsideMap(e)) e.kill();
        // If at center of exit tile, kill and reduce player health
        var c = center(exit.x, exit.y);
        if (atTileCenter(e.pos.x, e.pos.y, c.x, c.y)) {
            e.onExit();
            e.kill();
        }
        e.draw();
    }

    // Towers
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (!paused) {
            t.onTarget(enemies);
            t.update();
        }
        if (outsideMap(t)) t.kill();
        t.draw();
    }

    // Draw range of tower being placed
    if (mouseInMap() && toPlace && typeof towerType !== 'undefined') {
        var p = gridPos(mouseX, mouseY);
        var c = center(p.x, p.y);
        var t = createTower(0, 0, tower[towerType]);
        showRange(t, c.x, c.y);
    }

    removeDead(enemies);
    removeDead(towers);
    
    towers = towers.concat(newTowers);
    newTowers = [];

    if (health <= 0) resetGame();

    if (enemies.length === 0 && newEnemies.length === 0) {
        paused = true;
        nextWave();
    }

    if (toCooldown) {
        scd = spawnCool;
        toCooldown = false;
    }

    if (toUpdate) {
        updatePaths();
        toUpdate = false;
    }
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 18:
            // Alt
            doRange = !doRange;
            break;
        case 27:
            // Escape
            toPlace = false;
            clearInfo();
            break;
        case 32:
            // Space
            pause();
            break;
        case 49:
            // 1
            buy('gun');
            break;
        case 50:
            // 2
            buy('laser');
            break;
        case 51:
            // 3
            buy('sniper');
            break;
        case 76:
            // L
            doLine = !doLine;
            break;
        case 82:
            // R
            resetGame();
            break;
        case 83:
            // S
            if (selected) sell(selected);
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
        var t = getTower(p.x, p.y);
        if (t) {
            selected = t;
            toPlace = false;
            updateInfo(selected);
        } else if (isEmpty(p.x, p.y) && checkValid(p.x, p.y) && toPlace) {
            var n = createTower(p.x, p.y, tower[towerType]);
            if (cash >= n.cost) {
                cash -= n.cost;
                selected = n;
                toPlace = false;
                toUpdate = true;
                updateInfo(selected);
                newTowers.push(n);
            }
        } else {
            selected = null;
            clearInfo();
        }
    }
}
*/
