var enemies;
var enemiesStack;
var grid;

var tWidth;
var tHeight;
var cols = 40;
var rows = 25;

var paused;

var maxHealth;
var health;
var cash;
var wave;

var exitCount = 1;
var showGrid = true;
var spawnerCount = 1;
var wallCover = 0.1;


// Misc functions

function generateMap() {
    // Generate basic tiles and walls
    grid = [];
    for (var col = 0; col < cols; col++) {
        grid[col] = [];
        for (var row = 0; row < rows; row++) {
            if (random() < wallCover) {
                grid[col][row] = createTile(col, row, tiles.wall);
            } else {
                grid[col][row] = createTile(col, row, tiles.empty);
            }
        }
    }

    // Generate spawners
    for (var i = 0; i < spawnerCount; i++) {
        var col = floor(random(cols));
        var row = floor(random(rows));
        grid[col][row] = createTile(col, row, tiles.spawner);
    }

    // Generate exits
    for (var i = 0; i < exitCount; i++) {
        var col = floor(random(cols));
        var row = floor(random(rows));
        grid[col][row] = createTile(col, row, tiles.exit);
    }
}

function initEnemies() {
    enemies = [];
    enemiesStack = [];
}

function resetGame() {
    generateMap();
    initEnemies();
    paused = true;
    maxHealth = 100;
    health = maxHealth;
    cash = 150;
    wave = 1;
}

// Sets tile width and height based on canvas size and map dimensions
function resizeTiles(cols, rows) {
    tWidth = width / cols;
    tHeight = height / rows;
}

// Update game status
function updateStatus() {
    document.getElementById('wave').innerHTML = 'Wave ' + wave;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}

// Main p5 functions

function setup() {
    // Properly size canvas and place inside div
    var div = document.getElementById('sketch-holder');
    var w = div.offsetWidth;
    var canvas = createCanvas(w, div.offsetHeight);
    canvas.parent('sketch-holder');
    resizeCanvas(w, div.offsetHeight, true);
    // Setup proper tile size
    resizeTiles(cols, rows);
    // Initialize
    resetGame();
}

function draw() {
    background(0);

    // Process tiles
    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
            var tile = grid[col][row];
            tile.update();
            tile.draw();
        }
    }
    
    updateStatus();
}

/*
var enemies;
var newEnemies;
var towers;

var tileWidth;
var tileHeight;

var cols;
var rows;

var meta;
var grid;
var palette;

var cash;
var health;
var wave;

var showGrid = true;


// Misc functions

function loadMap(template) {
    meta = template.meta;
    grid = template.grid;
    palette = template.palette;
    var dim = getDimensions(grid);
    cols = dim.cols;
    rows = dim.rows;
    resizeTiles(cols, rows);
    resetMap();
}

// Remove all entities and return to starting state
function resetMap() {
    initEntities();
    cash = meta.cash;
    health = meta.health;
    wave = 1;
    updateStatus();
}

// Update game status
function updateStatus() {
    document.getElementById('name').innerHTML = meta.name;
    document.getElementById('wave').innerHTML = 'Wave ' + wave;
    document.getElementById('health').innerHTML = health + '/' + meta.health;
    document.getElementById('cash').innerHTML = '$' + cash;
}


// Main p5 functions

function setup() {
    // Properly size canvas and place inside div
    var div = document.getElementById('sketch-holder');
    var w = div.offsetWidth;
    var canvas = createCanvas(w, div.offsetHeight);
    canvas.parent('sketch-holder');
    resizeCanvas(w, div.offsetHeight, true);
    // Resize tiles based on initial cols and rows
    loadMap(maps[0]);
    // Initialize entities
    initEntities();
    var p = getCenter(2, 2);
    enemies[0] = new Enemy(p.x, p.y, enemies.basic);
    enemies[0].vel = createVector(1, 0);
    enemies[0].color = [127, 38, 99];
}

function draw() {
    background(0);

    // Draw tiles
    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
            var tile = palette[grid[row][col]];
            tile.draw(col, row);
        }
    }

    // Update and draw enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        e.steer();
        e.update();
        e.draw();
    }

    // Update and draw towers
    for (var i = 0; i < towers.length; i++) {
        ;
    }
}
*/
