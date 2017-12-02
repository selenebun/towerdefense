class Tile {
    constructor() {
        // Behavior
        this.placeable = true;
        this.walkable = false;
        // Display
        this.color = [0, 0, 0];
        this.alpha = 255;
        // Border
        this.borderColor = [0, 0, 0];
        this.borderAlpha = 255;
        this.drawBorder = true;
    }

    draw(col, row) {
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        if (showGrid) {
            stroke(0, 127);
        } else if (this.drawBorder) {
            var b = this.borderColor;
            stroke(b[0], b[1], b[2], this.borderAlpha);
        } else {
            noStroke();
        }
        rect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
    }
}
