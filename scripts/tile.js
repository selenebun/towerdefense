class Tile {
    constructor(template) {
        template = getDefault(template, {});
        // Behavior
        this.canPlace = getDefault(template.canPlace, false);
        // 0 = nothing, 1 = up, 2 = right, 3 = down, 4 = left
        this.direction = getDefault(template.direction, 0);
        // Display
        this.color = getDefault(template.color, [0, 0, 0]);
        this.alpha = getDefault(template.alpha, 255);
    }

    draw(col, row) {
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        if (showGrid) {
            stroke(0, 127);
        } else {
            noStroke();
        }
        rect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
    }
}


// Tile templates

var tiles = {};

tiles.null = new Tile();

// Path tiles

tiles.path = new Tile({
    color: [51, 110, 123]
});

tiles.pathUp = new Tile({
    direction: 1,
    color: [51, 110, 123]
});

tiles.pathRight = new Tile({
    direction: 2,
    color: [51, 110, 123]
});

tiles.pathDown = new Tile({
    direction: 3,
    color: [51, 110, 123]
});

tiles.pathLeft = new Tile({
    direction: 4,
    color: [51, 110, 123]
});

tiles.start = new Tile({
    color: [0, 230, 64]
});

tiles.end = new Tile({
    color: [207, 0, 15]
});


// Tower tiles

tiles.platform = new Tile({
    canPlace: true,
    color: [34, 49, 63]
});
