class Enemy {
    constructor(x, y) {
        // Display
        this.color = [0, 0, 0];
        this.radius = 0.5;          // radius in tiles
        // Misc
        this.alive = true;
        this.name = 'enemy';
        // Position
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        // Stats
        this.armor = 0;             // 1 is the max
        this.cash = 5;
        this.damage = 1;
        this.health = 1;
        this.speed = 1;             // 4 is the max
    }

    // Subtract amount * (1 - armor) from health and kill if health <= 0
    dealDamage(amt) {
        if (this.health > 0) this.health -= amt * (1 - this.armor);
        if (this.health <= 0) this.onKilled();
    }

    draw() {
        stroke(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    kill() {
        this.alive = false;
    }

    onCreate() {
        this.maxHealth = health;
    }

    onExit() {
        health -= this.damage;
    }

    onKilled() {
        if (this.alive) {
            cash += this.cash;
            this.kill();
        }
    }

    steer() {
        var t = gridPos(this.pos.x, this.pos.y);
        var c = center(t.x, t.y);
        var dir = pathMap[t.x][t.y];
        if (atTileCenter(this.pos.x, this.pos.y, c.x, c.y)) {
            // Center entity on tile
            if (dir !== null) this.pos = c;
            // Adjust velocity
            if (dir === 'left') {
                this.vel = createVector(-this.speed, 0);
            }
            if (dir === 'up') {
                this.vel = createVector(0, -this.speed);
            }
            if (dir === 'right') {
                this.vel = createVector(this.speed, 0);
            }
            if (dir === 'down') {
                this.vel = createVector(0, this.speed);
            }
        }
    }

    update() {
        this.vel.limit(4);
        this.vel.limit(this.speed);
        this.pos.add(this.vel);
    }
}
