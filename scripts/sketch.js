var enemies;
var newEnemies;
var towers;

var tileWidth;
var tileHeight;

// TODO get rid of this, dynamically determine from map
var cols = 30;
var rows = 20;

var showGrid = true;


// Misc functions

function initEntities() {
    enemies = [];
    newEnemies = [];
    towers = [];
}

function resizeTiles(cols, rows) {
    tileWidth = width / cols;
    tileHeight = height / rows;
}


// Main p5 functions

function setup() {
    // Properly size canvas and place inside div
    var div = document.getElementById('sketch-holder');
    var w = div.offsetWidth;
    var canvas = createCanvas(w, div.offsetHeight);
    canvas.parent('sketch-holder');
    resizeCanvas(w, div.offsetHeight);
    // Setup tile size
    resizeTiles(cols, rows);  // TODO get rows and cols from current map
    // Initialize entities
    initEntities();
}

function draw() {
    background(0);

    tiles.start.draw(0, floor(rows / 2));
    for (var i = 1; i < cols - 1; i++) {
        tiles.path.draw(i, floor(rows / 2));
    }
    tiles.end.draw(cols - 1, floor(rows / 2));
}
