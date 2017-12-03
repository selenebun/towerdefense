var enemies;
var newEnemies;
var towers;

var tileWidth;
var tileHeight;

var grid;
var palette;

var showGrid = true;

var cols;
var rows;


// Misc functions

function initEntities() {
    enemies = [];
    newEnemies = [];
    towers = [];
}

function loadMap(template) {
    grid = template.grid;
    palette = template.palette;
    var dim = getDimensions(grid);
    cols = dim.cols;
    rows = dim.rows;
    resizeTiles(cols, rows);
}

// Sets tile width and height based on canvas size and map dimensions
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
    resizeCanvas(w, div.offsetHeight, true);
    // Resize tiles based on initial cols and rows
    loadMap(maps[0]);
    // Initialize entities
    initEntities();
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
}
