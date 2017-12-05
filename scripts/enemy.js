class Enemy {
    constructor(x, y) {
        // Position
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        // Stats
        this.health = 1;
        this.armor = 0;
        this.damage = 1;
        this.speed = 1;             // 4 is the max
        this.cash = 1;
        // Misc
        this.name = 'enemy';
        this.alive = true;
        // Display
        this.color = [0, 0, 0];
        this.alpha = 255;
        this.radius = 0.5;          // radius in tiles
    }

    // TODO account for armor
    damage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.kill();
    }

    draw() {
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        stroke(0);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    kill() {
        this.alive = false;
    }

    onDeath() {}
    onExit() {}
    onTick() {}

    steer(dir) {
        var t = getTileCenter(this.pos.x, this.pos.y);
        if (dir === 'left') {
            if (isBetween(this.pos.y, t.y - tHold, t.y + tHold)) {
                this.vel = createVector(-this.speed, 0);
            }
        }
        if (dir === 'up') {
            if (isBetween(this.pos.x, t.x - tHold, t.x + tHold)) {
                this.vel = createVector(0, -this.speed,);
            }
        }
        if (dir === 'right') {
            if (isBetween(this.pos.y, t.y - tHold, t.y + tHold)) {
                this.vel = createVector(this.speed, 0);
            }
        }
        if (dir === 'down') {
            if (isBetween(this.pos.x, t.x - tHold, t.x + tHold)) {
                this.vel = createVector(0, this.speed,);
            }
        }
    }

    update() {
        this.vel.limit(4);
        this.vel.limit(this.speed);
        this.pos.add(this.vel);
    }
}
