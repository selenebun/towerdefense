class Tile {
    constructor(col, row) {
        // Position
        this.pos = createVector(col, row);
        // Misc
        this.name = 'tile';
        this.canPlace = true;
        this.canWalk = false;
        // Display
        this.color = [0, 0, 0];
        this.alpha = 255;
    }

    draw() {
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        showGrid ? stroke(0) : noStroke();
        rect(this.pos.x * tWidth, this.pos.y * tHeight, tWidth, tHeight);
    }

    getNearest(enemies) {}
    getVisible(enemies) {}
    onDelete() {}
    onKill(e) {}
    onSight(e) {}
    onTick() {}
    onWalk(e) {}
    update() {}
}
