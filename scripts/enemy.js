class Enemy {
    // TODO add armor, cash, damage, health stats
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
        this.speed = 1;             // 4 is the max
    }

    draw() {
        stroke(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    kill() {
        this.alive = false;
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

/*
class Enemy {
    onCreate() {}
    onDeath() {}

    onExit() {
        health -= this.damage;
    }

    onKilled() {
        cash += this.cash;
    }

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
}
*/
