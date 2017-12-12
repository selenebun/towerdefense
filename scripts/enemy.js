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
        this.cash = 1;
        this.damage = 1;
        this.health = 35;
        this.immune = [];           // no damage from these damage types
        this.resistant = [];        // reduced damage from these damage types
        this.speed = 1;             // 4 is the max
    }

    // Subtract amount and kill if health <= 0
    dealDamage(amt, type) {
        var mult;
        if (this.immune.includes(type)) {
            mult = 0;
        } else if (this.resistant.includes(type)) {
            mult = 1 - resistance;
        } else {
            mult = 1;
        }
        if (this.health > 0) this.health -= amt * mult;
        if (this.health <= 0) this.onKilled();
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        this.drawEnemy();
        pop();
    }

    drawEnemy() {
        stroke(0);
        fill(this.color);
        ellipse(0, 0, this.radius * ts, this.radius * ts);
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
