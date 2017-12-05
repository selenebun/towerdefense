class Tower {
    constructor(col, row) {
        // Position
        this.pos = createVector(col, row);
        // Stats
        this.cooldown = 10;
        this.damage = 1;
        this.range = 5;
        // AI
        this.toAffect = [];
        this.toTarget = [];
        // Misc
        this.name = 'tower';
        this.alive = true;
        this.angle = 0;
        // Display
        this.color = [0, 0, 0];
        this.barrel = [0, 0, 0];    // barrel color
        this.border = [0, 0, 0];
        this.alpha = 255;
        this.radius = 1;            // radius in tiles
        this.length = 0.7;          // barrel length in tiles (from center)
        this.width = 0.1;           // barrel width in tiles (from center)
        this.showBarrel = false;
        this.showBorder = true;
    }

    aim(x, y) {
        var pos = getCenter(this.pos.x, this.pos.y);
        this.angle = atan2(y - pos.y, x - pos.x);
    }

    attack(e) {}

    draw() {
        var pos = getCenter(this.pos.x, this.pos.y);
        if (this.showBorder) {
            stroke(this.border[0], this.border[1], this.border[2], this.alpha);
        } else {
            noStroke();
        }
        if (this.showBarrel) {
            push();
            translate(pos.x, pos.y);
            rotate(this.angle);
            fill(this.barrel[0], this.barrel[1], this.barrel[2], this.alpha);
            rect(0, -this.width * ts, this.length * ts, this.width * ts * 2);
            pop();
        }
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        ellipse(pos.x, pos.y, this.radius * ts, this.radius * ts);
    }

    kill() {
        this.alive = false;
    }

    onDeath() {}
    onFire() {}
    onKill(e) {}
    onPlace() {}
    onSell() {}
    onTick() {}
    onUpgrade() {}

    update() {
        if (this.cooldown > 0) this.cooldown--;
    }
}
